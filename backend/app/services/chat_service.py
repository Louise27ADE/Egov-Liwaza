"""
Service de chat — orchestre Gemini + outils MCP.

Flux :
1. L'utilisateur envoie un message
2. On l'envoie à Gemini avec les outils disponibles
3. Si Gemini veut appeler un outil → on l'exécute localement
4. On renvoie le résultat à Gemini → réponse finale
"""

import json
import structlog
import google.generativeai as genai
from app.config import get_settings
from app.tools.fiscal_tools import (
    calculate_tva, calculate_cnps_contributions,
    verify_nif, get_tax_deadlines, get_tax_regime_info,
)
from app.models.fiscal import (
    TVARequest, CNPSRequest, NIFValidationRequest,
    TaxRegimeInfoRequest, TaxRegime,
)

log = structlog.get_logger()

SYSTEM_PROMPT = """Tu es un assistant fiscal ivoirien expert, intégré à la plateforme eGov CI.
Tu aides les entreprises et les citoyens de Côte d'Ivoire à comprendre leurs obligations fiscales.

Tes domaines d'expertise :
- TVA (Taxe sur la Valeur Ajoutée) — taux 18% en CI
- Cotisations CNPS (Caisse Nationale de Prévoyance Sociale)
- Calendrier fiscal DGI (Direction Générale des Impôts)
- Régimes fiscaux CI : Micro-entreprise, RSI, RNI
- Validation des NIF (Numéro d'Identification Fiscale)

Instructions :
- Réponds en français par défaut. Si l'utilisateur écrit en anglais, réponds en anglais.
- Utilise toujours les outils disponibles pour calculer des montants.
- Présente les résultats de façon claire avec les montants en FCFA.
- Sois précis, professionnel, et bienveillant."""

# Définition des outils pour Gemini (format Function Declarations)
GEMINI_TOOLS = [
    genai.protos.Tool(function_declarations=[
        genai.protos.FunctionDeclaration(
            name="outil_calcul_tva",
            description="Calcule la TVA (18%) sur un montant hors taxe en Côte d'Ivoire. Retourne HT, TVA et TTC en FCFA.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "montant_ht": genai.protos.Schema(type=genai.protos.Type.NUMBER, description="Montant hors taxe en FCFA"),
                    "type_operation": genai.protos.Schema(type=genai.protos.Type.STRING, description="vente ou achat"),
                },
                required=["montant_ht"],
            ),
        ),
        genai.protos.FunctionDeclaration(
            name="outil_cotisations_cnps",
            description="Calcule les cotisations sociales CNPS (part employeur + salarié) selon le barème CNPS CI 2024.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "salaire_brut": genai.protos.Schema(type=genai.protos.Type.NUMBER, description="Salaire brut mensuel en FCFA"),
                    "nombre_employes": genai.protos.Schema(type=genai.protos.Type.INTEGER, description="Nombre d'employés"),
                },
                required=["salaire_brut"],
            ),
        ),
        genai.protos.FunctionDeclaration(
            name="outil_verification_nif",
            description="Vérifie si un Numéro d'Identification Fiscale (NIF) ivoirien est valide.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "nif": genai.protos.Schema(type=genai.protos.Type.STRING, description="NIF à vérifier (ex: A1234567B)"),
                },
                required=["nif"],
            ),
        ),
        genai.protos.FunctionDeclaration(
            name="outil_echeances_fiscales",
            description="Retourne le calendrier des échéances fiscales DGI pour un mois et une année donnés.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "mois": genai.protos.Schema(type=genai.protos.Type.INTEGER, description="Mois (1-12)"),
                    "annee": genai.protos.Schema(type=genai.protos.Type.INTEGER, description="Année (ex: 2025)"),
                    "regime": genai.protos.Schema(type=genai.protos.Type.STRING, description="Régime fiscal: MICRO, RSI ou RNI"),
                },
                required=["mois", "annee"],
            ),
        ),
        genai.protos.FunctionDeclaration(
            name="outil_regime_fiscal",
            description="Donne des informations sur un régime fiscal ivoirien (MICRO, RSI, RNI).",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "regime": genai.protos.Schema(type=genai.protos.Type.STRING, description="MICRO, RSI ou RNI"),
                    "chiffre_affaires": genai.protos.Schema(type=genai.protos.Type.NUMBER, description="CA annuel en FCFA (optionnel)"),
                },
                required=["regime"],
            ),
        ),
    ])
]


def execute_tool(name: str, args: dict) -> dict:
    """Exécute un outil MCP par son nom et retourne le résultat."""
    log.info("tool_execution", tool=name, args=args)
    try:
        if name == "outil_calcul_tva":
            return calculate_tva(TVARequest(**args)).model_dump()
        elif name == "outil_cotisations_cnps":
            return calculate_cnps_contributions(CNPSRequest(**args)).model_dump()
        elif name == "outil_verification_nif":
            return verify_nif(NIFValidationRequest(**args)).model_dump()
        elif name == "outil_echeances_fiscales":
            return get_tax_deadlines(**args).model_dump()
        elif name == "outil_regime_fiscal":
            regime_str = args.get("regime", "RNI").upper()
            ca = args.get("chiffre_affaires")
            return get_tax_regime_info(
                TaxRegimeInfoRequest(regime=TaxRegime(regime_str), chiffre_affaires=ca)
            ).model_dump()
        else:
            return {"error": f"Outil inconnu: {name}"}
    except Exception as e:
        log.error("tool_error", tool=name, error=str(e))
        return {"error": str(e)}


def get_gemini_model():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
        tools=GEMINI_TOOLS,
    )


def chat(messages: list[dict]) -> dict:
    """
    Envoie l'historique de conversation à Gemini et retourne la réponse.
    Gère automatiquement l'exécution des outils (function calling).

    messages: liste de {"role": "user"|"model", "parts": ["texte"]}
    """
    model = get_gemini_model()
    chat_session = model.start_chat(history=messages[:-1] if len(messages) > 1 else [])

    # Dernier message de l'utilisateur
    last_message = messages[-1]["parts"][0] if messages else ""

    tool_calls_log = []

    # Envoyer le message
    response = chat_session.send_message(last_message)

    # Boucle d'orchestration — Gemini peut appeler plusieurs outils
    while response.candidates[0].finish_reason.name == "STOP" and \
          any(part.function_call.name for part in response.parts if hasattr(part, "function_call") and part.function_call.name):

        tool_results = []
        for part in response.parts:
            if hasattr(part, "function_call") and part.function_call.name:
                fc = part.function_call
                args = dict(fc.args)
                result = execute_tool(fc.name, args)
                tool_calls_log.append({
                    "name": fc.name,
                    "input": args,
                    "output": result,
                    "status": "error" if "error" in result else "success",
                })
                tool_results.append(
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=fc.name,
                            response={"result": json.dumps(result, ensure_ascii=False)},
                        )
                    )
                )

        if not tool_results:
            break

        response = chat_session.send_message(tool_results)

    # Extraire le texte final
    text = ""
    for part in response.parts:
        if hasattr(part, "text") and part.text:
            text += part.text

    return {
        "content": text or "Je n'ai pas pu générer une réponse.",
        "tool_calls": tool_calls_log,
    }
