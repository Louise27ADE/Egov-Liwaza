---
title: Egov Liwaza Backend
emoji: 🌍
colorFrom: green
colorTo: orange
sdk: docker
pinned: false
---

# eGov CI - Plateforme Fiscale Intelligente

> Plateforme eGov alimentee par l'IA, permettant aux entreprises et citoyens de Cote d'Ivoire d'interagir avec les services fiscaux en langage naturel.

**Auteure :** Louise ADEDOKUN  
**Stack :** Python - FastAPI - MCP - React - TypeScript - Tailwind CSS v4 - Google Gemini 2.5 Flash Lite  
**Deploiement :** HuggingFace Spaces (backend) - Vercel (frontend)

---

## Liens

| Service | URL |
|---|---|
| Frontend | https://egov-liwaza.vercel.app |
| Backend API | https://louisehuggingface-egov-liwaza-backend.hf.space |
| Health check | https://louisehuggingface-egov-liwaza-backend.hf.space/health |

---

## Apercu du produit

L'utilisateur pose une question en francais ou en anglais :

> *"Calcule la TVA sur 500 000 FCFA pour une vente"*

L'assistant :
1. Comprend la requete grace a Google Gemini 2.5 Flash Lite
2. Identifie l'outil MCP approprie (`outil_calcul_tva`)
3. Execute l'outil sur le MCP Server (backend Python/FastAPI)
4. Retourne un resultat structure et clair

---

## Architecture

```
Utilisateur
    |
    v
React Frontend (MCP Client) — Vercel
    |
    v
Python MCP Server (FastAPI) — HuggingFace Spaces
    |  Google Gemini 2.5 Flash Lite (function calling)
    |
    |-- outil_calcul_tva          -> Calcul TVA 18% CI (Art. 339 CGI)
    |-- outil_cotisations_cnps    -> Bareme CNPS 2024
    |-- outil_verification_nif    -> Validation NIF DGI
    |-- outil_echeances_fiscales  -> Calendrier fiscal DGI
    `-- outil_regime_fiscal       -> Regimes MICRO/RSI/RNI
```

---

## Installation locale

### Prerequis
- Python 3.12+
- Node.js 20+
- Une cle API Google Gemini (gratuit sur https://aistudio.google.com)

### 1. Cloner le depot
```bash
git clone https://github.com/Louise27ADE/Egov-Liwaza.git
cd Egov-Liwaza
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Editez .env et ajoutez votre GEMINI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Ouvrez http://localhost:5173

### Avec Docker
```bash
cp .env.example .env
# Editez .env
docker-compose up --build
```

---

## Tests

```bash
cd backend
export PYTHONPATH=.
python -m pytest tests/ -v
# 19 tests passent
```

---

## Structure du projet

```
Egov-Liwaza/                    <- Monorepo
|-- backend/
|   |-- app/
|   |   |-- main.py             <- Point d'entree FastAPI
|   |   |-- config.py           <- Configuration Pydantic
|   |   |-- services/
|   |   |   `-- chat_service.py <- Orchestration Gemini + MCP
|   |   `-- tools/
|   |       `-- fiscal_tools.py <- 5 outils fiscaux ivoiriens
|   |-- tests/                  <- Tests pytest (19 tests)
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- App.tsx             <- Application principale
|   |   |-- hooks/useChat.ts    <- Gestion conversation
|   |   `-- components/         <- Composants UI
|   `-- package.json
|-- docs/
|   |-- ARCHITECTURE.md         <- Decisions d'architecture
|   |-- AI_STRATEGY.md          <- Strategie LLM
|   `-- AI_USAGE.md             <- Declaration usage IA
|-- .github/workflows/          <- CI/CD GitHub Actions
`-- docker-compose.yml
```

---

## Endpoints API

| Methode | URL | Description |
|---|---|---|
| GET | `/health` | Etat du serveur |
| GET | `/api/tools` | Liste des outils MCP |
| POST | `/api/chat` | Endpoint principal de conversation |

---

## Deploiement

### Backend — HuggingFace Spaces
1. Creer un Space HuggingFace avec SDK Docker
2. Uploader les fichiers via `huggingface_hub` Python
3. Ajouter `GEMINI_API_KEY` dans Settings > Variables and secrets
4. Le Space demarre automatiquement sur le port 7860

### Frontend — Vercel
1. Connecter le repo GitHub a Vercel
2. Root directory : `frontend`
3. Build command : `npm run build`
4. Ajouter `VITE_BACKEND_URL` dans les settings Vercel

---

## Hypotheses et compromis

**Hypotheses :**
- Les donnees fiscales (TVA 18%, baremes CNPS 2024) sont stables sur la duree du test
- Le NIF ivoirien suit le format standardise DGI CI

**Compromis :**
- Gemini 2.5 Flash Lite choisi pour le free tier — en production, Claude Sonnet offrirait une meilleure qualite de raisonnement
- Pas de persistance des conversations — localStorage ou PostgreSQL en amelioration future

**Ameliorations futures :**
- Authentification utilisateurs (JWT/OAuth2)
- Persistance conversations en base de donnees
- Integration directe API DGI CI quand disponible publiquement
- Redis cache pour les calculs frequents (TVA, CNPS)
- Application mobile (React Native)

---

## Outils AI utilises

- **Claude Code** (Anthropic) — assistance au developpement, architecture, documentation
- **Google Gemini 2.5 Flash Lite** — LLM du produit (orchestration MCP, reponses utilisateur)
- Detail complet des prompts et parties verifiees : `docs/AI_USAGE.md`

---

*Construit pour le test technique LIWAZA — juin 2026 — Louise ADEDOKUN*
