from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TaxRegime(str, Enum):
    RSI = "RSI"       # Régime Simplifié d'Imposition
    RNI = "RNI"       # Régime Normal d'Imposition
    MICRO = "MICRO"   # Micro-entreprise


class CompanyType(str, Enum):
    SARL = "SARL"
    SA = "SA"
    SAS = "SAS"
    EI = "EI"         # Entreprise Individuelle
    GIE = "GIE"


class TVARequest(BaseModel):
    montant_ht: float = Field(..., gt=0, description="Montant hors taxe en FCFA")
    type_operation: str = Field(default="vente", description="vente ou achat")


class TVAResponse(BaseModel):
    montant_ht: float
    taux_tva: float
    montant_tva: float
    montant_ttc: float
    type_operation: str
    devise: str = "FCFA"


class CNPSRequest(BaseModel):
    salaire_brut: float = Field(..., gt=0, description="Salaire brut mensuel en FCFA")
    nombre_employes: int = Field(default=1, ge=1)


class CNPSResponse(BaseModel):
    salaire_brut: float
    part_employeur: float
    part_salarie: float
    total_cotisation: float
    detail_employeur: dict
    detail_salarie: dict
    devise: str = "FCFA"


class NIFValidationRequest(BaseModel):
    nif: str = Field(..., description="Numéro d'Identification Fiscale à vérifier")


class NIFValidationResponse(BaseModel):
    nif: str
    is_valid: bool
    format_attendu: str
    message: str


class TaxDeadline(BaseModel):
    obligation: str
    echeance: str
    periode: str
    regime: Optional[str] = None
    penalite_retard: str


class TaxDeadlinesResponse(BaseModel):
    mois: str
    annee: int
    echeances: list[TaxDeadline]
    source: str = "DGI Côte d'Ivoire"


class TaxRegimeInfoRequest(BaseModel):
    regime: TaxRegime
    chiffre_affaires: Optional[float] = Field(
        None, description="CA annuel pour vérifier l'éligibilité au régime"
    )


class TaxRegimeInfoResponse(BaseModel):
    regime: str
    description: str
    seuil_ca_min: Optional[float]
    seuil_ca_max: Optional[float]
    obligations_principales: list[str]
    avantages: list[str]
    source: str = "Code Général des Impôts CI"
