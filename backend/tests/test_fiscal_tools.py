"""
Tests unitaires pour les outils fiscaux ivoiriens.
On teste la logique métier indépendamment du serveur HTTP.
"""

import pytest
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


class TestCalculTVA:
    def test_tva_standard(self):
        result = calculate_tva(TVARequest(montant_ht=100_000))
        assert result.taux_tva == 18.0
        assert result.montant_tva == 18_000
        assert result.montant_ttc == 118_000

    def test_tva_grand_montant(self):
        result = calculate_tva(TVARequest(montant_ht=1_000_000))
        assert result.montant_tva == 180_000
        assert result.montant_ttc == 1_180_000

    def test_tva_achat(self):
        result = calculate_tva(TVARequest(montant_ht=50_000, type_operation="achat"))
        assert result.type_operation == "achat"
        assert result.devise == "FCFA"

    def test_tva_montant_invalide(self):
        with pytest.raises(Exception):
            calculate_tva(TVARequest(montant_ht=-1000))


class TestCotisationsCNPS:
    def test_cotisations_employe_unique(self):
        result = calculate_cnps_contributions(CNPSRequest(salaire_brut=300_000))
        # Taux employeur total: 5.4% + 2% + 5.5% = 12.9%
        assert result.part_employeur == pytest.approx(300_000 * 0.129, abs=1)
        # Taux salarié: 3.6%
        assert result.part_salarie == pytest.approx(300_000 * 0.036, abs=1)

    def test_cotisations_plusieurs_employes(self):
        result = calculate_cnps_contributions(CNPSRequest(salaire_brut=200_000, nombre_employes=3))
        result_1 = calculate_cnps_contributions(CNPSRequest(salaire_brut=200_000, nombre_employes=1))
        assert result.total_cotisation == pytest.approx(result_1.total_cotisation * 3, abs=1)

    def test_plafond_cnps(self):
        # Salaire au-dessus du plafond (3 375 000 FCFA) — cotisation plafonnée
        result_haut = calculate_cnps_contributions(CNPSRequest(salaire_brut=5_000_000))
        result_plafond = calculate_cnps_contributions(CNPSRequest(salaire_brut=3_375_000))
        assert result_haut.total_cotisation == result_plafond.total_cotisation


class TestVerificationNIF:
    def test_nif_valide(self):
        result = verify_nif(NIFValidationRequest(nif="A1234567B"))
        assert result.is_valid is True

    def test_nif_valide_sans_lettre_finale(self):
        result = verify_nif(NIFValidationRequest(nif="A12345678"))
        assert result.is_valid is True

    def test_nif_invalide_trop_court(self):
        result = verify_nif(NIFValidationRequest(nif="A123"))
        assert result.is_valid is False

    def test_nif_invalide_format(self):
        result = verify_nif(NIFValidationRequest(nif="123456789"))
        assert result.is_valid is False

    def test_nif_minuscules_acceptees(self):
        # Le NIF est normalisé en majuscules
        result = verify_nif(NIFValidationRequest(nif="a1234567b"))
        assert result.is_valid is True


class TestEcheancesFiscales:
    def test_echeances_janvier(self):
        result = get_tax_deadlines(mois=1, annee=2025)
        assert result.mois == "janvier"
        assert len(result.echeances) >= 3

    def test_echeances_avril_liasse(self):
        # Avril = mois de dépôt de la liasse fiscale
        result = get_tax_deadlines(mois=4, annee=2025)
        obligations = [e.obligation for e in result.echeances]
        assert any("liasse" in o.lower() for o in obligations)

    def test_mois_invalide(self):
        with pytest.raises(ValueError):
            get_tax_deadlines(mois=13, annee=2025)

    def test_rni_acompte_is(self):
        result = get_tax_deadlines(mois=6, annee=2025, regime="RNI")
        obligations = [e.obligation for e in result.echeances]
        assert any("IS" in o for o in obligations)


class TestRegimeFiscal:
    def test_regime_rni(self):
        result = get_tax_regime_info(TaxRegimeInfoRequest(regime=TaxRegime.RNI))
        assert result.regime == "RNI"
        assert result.seuil_ca_min == 150_000_000

    def test_recommendation_micro(self):
        result = get_tax_regime_info(
            TaxRegimeInfoRequest(regime=TaxRegime.RNI, chiffre_affaires=30_000_000)
        )
        assert "MICRO" in result.description

    def test_regime_adapte(self):
        result = get_tax_regime_info(
            TaxRegimeInfoRequest(regime=TaxRegime.RSI, chiffre_affaires=80_000_000)
        )
        # CA entre 50M et 150M → RSI est correct, pas de warning
        assert "⚠️" not in result.description
