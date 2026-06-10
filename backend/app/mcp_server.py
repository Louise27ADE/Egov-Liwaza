"""
Serveur MCP eGov Liwaza — expose les outils fiscaux ivoiriens via MCP.
Architecture: React Frontend (MCP Client) → Ce serveur → Logique fiscale CI
"""

import structlog
from mcp.server.fastmcp import FastMCP
from app.tools.fiscal_tools import (
    calculate_tva,
    calculate_cnps_contributions,
    verify_nif,
    get_tax_deadlines,
    get_tax_regime_info,
)
from app.models.fiscal import (
    TVARequest, CNPSRequest, NIFValidationRequest,
    TaxRegimeInfoRequest, TaxRegime,
)

log = structlog.get_logger()

mcp = FastMCP(
    name="egov-liwaza",
    instructions=(
        "Tu es un assistant fiscal ivoirien. "
        "Tu aides les entreprises et les citoyens à comprendre leurs obligations fiscales "
        "en Côte d'Ivoire. Utilise les outils disponibles pour répondre aux questions "
        "sur la TVA, les cotisations CNPS, les échéances DGI, et les régimes fiscaux. "
        "Réponds en français par défaut, en anglais si l'utilisateur le demande."
    ),
)


@mcp.tool()
def outil_calcul_tva(montant_ht: float, type_operation: str = "vente") -> dict:
    """
    Calcule la TVA (18%) sur un montant hors taxe en Côte d'Ivoire.
    Utilisable pour les ventes, achats, ou prestations de services.
    Retourne le montant HT, la TVA, et le montant TTC en FCFA.
    """
    log.info("tool_called", tool="calculate_tva", montant_ht=montant_ht)
    result = calculate_tva(TVARequest(montant_ht=montant_ht, type_operation=type_operation))
    return result.model_dump()


@mcp.tool()
def outil_cotisations_cnps(salaire_brut: float, nombre_employes: int = 1) -> dict:
    """
    Calcule les cotisations sociales CNPS (part employeur + part salarié).
    Basé sur le barème officiel CNPS Côte d'Ivoire 2024.
    Retourne le détail des cotisations par type (retraite, AT, prestations familiales).
    """
    log.info("tool_called", tool="calculate_cnps", salaire_brut=salaire_brut)
    result = calculate_cnps_contributions(
        CNPSRequest(salaire_brut=salaire_brut, nombre_employes=nombre_employes)
    )
    return result.model_dump()


@mcp.tool()
def outil_verification_nif(nif: str) -> dict:
    """
    Vérifie si un Numéro d'Identification Fiscale (NIF) ivoirien est valide.
    Contrôle le format officiel DGI Côte d'Ivoire.
    """
    log.info("tool_called", tool="verify_nif", nif=nif)
    result = verify_nif(NIFValidationRequest(nif=nif))
    return result.model_dump()


@mcp.tool()
def outil_echeances_fiscales(mois: int, annee: int, regime: str = "RNI") -> dict:
    """
    Retourne le calendrier des échéances fiscales DGI pour un mois et une année donnés.
    Inclut TVA, ITS/IGR, CNPS, acomptes IS selon le régime fiscal.
    Le régime peut être: MICRO, RSI, ou RNI.
    """
    log.info("tool_called", tool="get_tax_deadlines", mois=mois, annee=annee)
    result = get_tax_deadlines(mois=mois, annee=annee, regime=regime)
    return result.model_dump()


@mcp.tool()
def outil_regime_fiscal(regime: str, chiffre_affaires: float = None) -> dict:
    """
    Donne des informations détaillées sur un régime fiscal ivoirien.
    Régimes disponibles: MICRO, RSI (Régime Simplifié), RNI (Régime Normal).
    Si le chiffre d'affaires est fourni, indique si le régime est adapté.
    """
    log.info("tool_called", tool="get_regime_info", regime=regime)
    regime_enum = TaxRegime(regime.upper())
    result = get_tax_regime_info(
        TaxRegimeInfoRequest(regime=regime_enum, chiffre_affaires=chiffre_affaires)
    )
    return result.model_dump()
