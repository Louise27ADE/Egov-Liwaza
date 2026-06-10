"""
Outils fiscaux ivoiriens pour le MCP Server.
Toutes les données sont issues du Code Général des Impôts CI et du barème CNPS officiel.
"""

import re
from datetime import datetime
from app.models.fiscal import (
    TVARequest, TVAResponse,
    CNPSRequest, CNPSResponse,
    NIFValidationRequest, NIFValidationResponse,
    TaxDeadline, TaxDeadlinesResponse,
    TaxRegime, TaxRegimeInfoRequest, TaxRegimeInfoResponse,
)

# ---------------------------------------------------------------------------
# Taux officiels CI (Source: CGI et CNPS)
# ---------------------------------------------------------------------------

TVA_RATE = 0.18  # 18% — taux standard TVA en Côte d'Ivoire

# Taux CNPS 2024 (Source: CNPS Côte d'Ivoire)
CNPS_RATES = {
    "employeur": {
        "retraite": 0.054,          # 5.4%
        "accident_travail": 0.02,   # 2% (taux moyen)
        "prestations_familiales": 0.055,  # 5.5%
    },
    "salarie": {
        "retraite": 0.036,          # 3.6%
        "assurance_maladie": 0.0,   # à la charge de l'employeur
    },
}

# Calendrier fiscal DGI CI (échéances mensuelles standard)
MONTHLY_DEADLINES = {
    "TVA": {"jour": 15, "description": "Déclaration et paiement TVA du mois précédent"},
    "Acompte IS": {"jour": 15, "description": "Acompte Impôt sur les Sociétés"},
    "CNPS": {"jour": 15, "description": "Déclaration et versement cotisations CNPS"},
    "ITS/IGR": {"jour": 15, "description": "Impôt sur Traitements et Salaires / IGR"},
    "Taxe Apprentissage": {"jour": 15, "description": "Contribution à la formation professionnelle"},
}

MOIS_FR = {
    1: "janvier", 2: "février", 3: "mars", 4: "avril",
    5: "mai", 6: "juin", 7: "juillet", 8: "août",
    9: "septembre", 10: "octobre", 11: "novembre", 12: "décembre",
}

REGIME_INFO = {
    TaxRegime.MICRO: {
        "description": "Régime Micro-entreprise — pour les très petites structures",
        "seuil_ca_min": 0,
        "seuil_ca_max": 50_000_000,
        "obligations": [
            "Déclaration annuelle simplifiée",
            "Pas de TVA collectée",
            "Taxe forfaitaire unique",
        ],
        "avantages": [
            "Obligations allégées",
            "Comptabilité simplifiée",
            "Taux d'imposition réduit",
        ],
    },
    TaxRegime.RSI: {
        "description": "Régime Simplifié d'Imposition — PME intermédiaires",
        "seuil_ca_min": 50_000_000,
        "seuil_ca_max": 150_000_000,
        "obligations": [
            "Déclaration TVA mensuelle",
            "Déclaration BIC/BNC annuelle",
            "Acomptes IS trimestriels",
            "Tenue d'une comptabilité simplifiée",
        ],
        "avantages": [
            "Comptabilité moins lourde qu'au RNI",
            "Taux réduit sur certaines opérations",
        ],
    },
    TaxRegime.RNI: {
        "description": "Régime Normal d'Imposition — grandes entreprises",
        "seuil_ca_min": 150_000_000,
        "seuil_ca_max": None,
        "obligations": [
            "Déclaration TVA mensuelle",
            "Déclaration IS annuelle",
            "Acomptes IS mensuels",
            "Comptabilité SYSCOHADA complète",
            "Liasse fiscale annuelle",
        ],
        "avantages": [
            "Déductibilité complète des charges",
            "Crédits de TVA récupérables",
        ],
    },
}


# ---------------------------------------------------------------------------
# Outil 1 : Calcul TVA
# ---------------------------------------------------------------------------

def calculate_tva(request: TVARequest) -> TVAResponse:
    """
    Calcule la TVA applicable sur une opération en Côte d'Ivoire.
    Taux en vigueur : 18% (Art. 339 CGI CI).
    """
    montant_tva = round(request.montant_ht * TVA_RATE, 0)
    montant_ttc = round(request.montant_ht + montant_tva, 0)
    return TVAResponse(
        montant_ht=request.montant_ht,
        taux_tva=TVA_RATE * 100,
        montant_tva=montant_tva,
        montant_ttc=montant_ttc,
        type_operation=request.type_operation,
    )


# ---------------------------------------------------------------------------
# Outil 2 : Calcul cotisations CNPS
# ---------------------------------------------------------------------------

def calculate_cnps_contributions(request: CNPSRequest) -> CNPSResponse:
    """
    Calcule les cotisations sociales CNPS pour un ou plusieurs employés.
    Barème officiel CNPS CI 2024.
    """
    sb = request.salaire_brut

    # Plafond cotisable CNPS : 45× le SMIG (75 000 FCFA) = 3 375 000 FCFA
    plafond_cnps = 3_375_000
    salaire_cotisable = min(sb, plafond_cnps)

    # Part employeur
    retraite_emp = round(salaire_cotisable * CNPS_RATES["employeur"]["retraite"], 0)
    at_emp = round(salaire_cotisable * CNPS_RATES["employeur"]["accident_travail"], 0)
    pf_emp = round(salaire_cotisable * CNPS_RATES["employeur"]["prestations_familiales"], 0)
    total_emp = retraite_emp + at_emp + pf_emp

    # Part salarié
    retraite_sal = round(salaire_cotisable * CNPS_RATES["salarie"]["retraite"], 0)
    total_sal = retraite_sal

    return CNPSResponse(
        salaire_brut=sb * request.nombre_employes,
        part_employeur=total_emp * request.nombre_employes,
        part_salarie=total_sal * request.nombre_employes,
        total_cotisation=(total_emp + total_sal) * request.nombre_employes,
        detail_employeur={
            "retraite (5.4%)": retraite_emp * request.nombre_employes,
            "accident_travail (2%)": at_emp * request.nombre_employes,
            "prestations_familiales (5.5%)": pf_emp * request.nombre_employes,
        },
        detail_salarie={
            "retraite (3.6%)": retraite_sal * request.nombre_employes,
        },
    )


# ---------------------------------------------------------------------------
# Outil 3 : Validation NIF ivoirien
# ---------------------------------------------------------------------------

def verify_nif(request: NIFValidationRequest) -> NIFValidationResponse:
    """
    Valide le format du Numéro d'Identification Fiscale (NIF) ivoirien.
    Format officiel DGI CI : lettre(s) suivies de chiffres (ex: A1234567B).
    """
    nif = request.nif.strip().upper()
    # Format NIF CI: commence par une ou deux lettres, suivi de 7-8 chiffres, optionnellement une lettre finale
    pattern = r'^[A-Z]{1,2}\d{7,8}[A-Z]?$'
    is_valid = bool(re.match(pattern, nif))
    return NIFValidationResponse(
        nif=nif,
        is_valid=is_valid,
        format_attendu="1-2 lettres + 7-8 chiffres + 1 lettre optionnelle (ex: A1234567B)",
        message="NIF valide — format conforme DGI CI" if is_valid else
                "NIF invalide — vérifiez le format. Exemple correct: A1234567B",
    )


# ---------------------------------------------------------------------------
# Outil 4 : Calendrier fiscal (échéances du mois)
# ---------------------------------------------------------------------------

def get_tax_deadlines(mois: int, annee: int, regime: str = "RNI") -> TaxDeadlinesResponse:
    """
    Retourne les échéances fiscales DGI pour un mois donné.
    Source: Calendrier fiscal officiel DGI Côte d'Ivoire.
    """
    if not (1 <= mois <= 12):
        raise ValueError("Le mois doit être entre 1 et 12")
    if annee < 2020:
        raise ValueError("L'année doit être >= 2020")

    mois_precedent = mois - 1 if mois > 1 else 12
    annee_prec = annee if mois > 1 else annee - 1

    echeances = [
        TaxDeadline(
            obligation="Déclaration et paiement TVA",
            echeance=f"{annee}-{str(mois).zfill(2)}-15",
            periode=f"{MOIS_FR[mois_precedent]} {annee_prec}",
            regime="RSI, RNI",
            penalite_retard="25% du montant dû + intérêts de 2% par mois",
        ),
        TaxDeadline(
            obligation="Versement ITS / IGR (salaires)",
            echeance=f"{annee}-{str(mois).zfill(2)}-15",
            periode=f"{MOIS_FR[mois_precedent]} {annee_prec}",
            regime="Tous régimes",
            penalite_retard="25% du montant dû",
        ),
        TaxDeadline(
            obligation="Cotisations CNPS",
            echeance=f"{annee}-{str(mois).zfill(2)}-15",
            periode=f"{MOIS_FR[mois_precedent]} {annee_prec}",
            regime="Tous régimes",
            penalite_retard="Majoration de 10% + pénalités CNPS",
        ),
    ]

    if regime == "RNI":
        echeances.append(TaxDeadline(
            obligation="Acompte IS mensuel",
            echeance=f"{annee}-{str(mois).zfill(2)}-15",
            periode=f"{MOIS_FR[mois_precedent]} {annee_prec}",
            regime="RNI uniquement",
            penalite_retard="25% du montant dû",
        ))

    # Échéance annuelle si janvier
    if mois == 4:
        echeances.append(TaxDeadline(
            obligation="Dépôt liasse fiscale (IS annuel)",
            echeance=f"{annee}-04-30",
            periode=f"Exercice {annee - 1}",
            regime="RSI, RNI",
            penalite_retard="Amende de 500 000 FCFA minimum",
        ))

    return TaxDeadlinesResponse(
        mois=MOIS_FR[mois],
        annee=annee,
        echeances=echeances,
    )


# ---------------------------------------------------------------------------
# Outil 5 : Informations sur un régime fiscal
# ---------------------------------------------------------------------------

def get_tax_regime_info(request: TaxRegimeInfoRequest) -> TaxRegimeInfoResponse:
    """
    Retourne les informations détaillées sur un régime fiscal ivoirien.
    Source: Code Général des Impôts CI, DGI.
    """
    info = REGIME_INFO[request.regime]

    recommendation = None
    if request.chiffre_affaires is not None:
        ca = request.chiffre_affaires
        if ca < 50_000_000:
            recommendation = "MICRO"
        elif ca < 150_000_000:
            recommendation = "RSI"
        else:
            recommendation = "RNI"

    description = info["description"]
    if recommendation and recommendation != request.regime.value:
        description += f" ⚠️ Avec un CA de {ca:,.0f} FCFA, le régime recommandé est {recommendation}."

    return TaxRegimeInfoResponse(
        regime=request.regime.value,
        description=description,
        seuil_ca_min=info["seuil_ca_min"],
        seuil_ca_max=info["seuil_ca_max"],
        obligations_principales=info["obligations"],
        avantages=info["avantages"],
    )
