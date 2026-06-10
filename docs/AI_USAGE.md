# Déclaration d'usage de l'IA

Conformément aux exigences du test LIWAZA, voici la liste complète des outils IA utilisés.

---

## Outils utilisés
- **Claude** (Anthropic) — génération de code, architecture, documentation

## Parties générées par IA
- Structure du projet et fichiers de configuration
- Code des outils fiscaux (logique validée manuellement sur le CGI CI)
- Composants React et styles Tailwind
- Documentation (README, Architecture, AI Strategy)
- Tests pytest

## Parties vérifiées et validées manuellement
- **Taux TVA 18%** — vérifié sur le Code Général des Impôts CI (Art. 339)
- **Taux CNPS** — vérifiés sur le barème officiel CNPS 2024 (5.4% + 2% + 5.5% employeur, 3.6% salarié)
- **Plafond cotisable CNPS** — 45× SMIG = 3 375 000 FCFA vérifié
- **Format NIF ivoirien** — validé via exemples officiels DGI CI
- **Régimes fiscaux** (MICRO/RSI/RNI) et seuils de CA — vérifiés sur le CGI CI
- Tous les 19 tests passent et couvrent les cas limites

## Ce qui a été écrit sans IA
- La compréhension et validation des données fiscales ivoiriennes
- Les décisions d'architecture (monorepo, choix de stack)
- Le raisonnement sur le choix des modèles LLM
- Les compromis et hypothèses dans la documentation
