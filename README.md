---
title: Egov Liwaza Backend
emoji: ðŸŒ
colorFrom: green
colorTo: orange
sdk: docker
pinned: false
---

# eGov CI ” Plateforme Fiscale Intelligente

> Plateforme eGov alimentée par l'IA, permettant aux entreprises et citoyens de Cote d'Ivoire d'interagir avec les services fiscaux en langage naturel.

**Auteure :** Louise ADEDOKUN  
**Stack :** Python Â· FastAPI Â· MCP Â· React Â· TypeScript Â· Tailwind Â· Google Gemini 2.5 Flash Lite  
**DÃ©ploiement :** HuggingFace Spaces (backend) Â· Vercel (frontend)

---

## Aperçu du produit

L'utilisateur pose une question en français ou en anglais :

> *"Calcule la TVA sur 500 000 FCFA pour une vente"*

L'assistant :
1. Comprend la requète grace à  Claude
2. Identifie l'outil MCP approprié (`outil_calcul_tva`)
3. Exécute l'outil sur le MCP Server (backend Python)
4. Retourne un résultat structuré et clair

---

## Architecture

```
Utilisateur
    â”‚
    â–¼
React Frontend (MCP Client)
    â”‚  Google Gemini 2.5 Flash Lite (Anthropic API)
    â”‚  Tool use â†’ appels MCP
    â”‚
    â–¼
Python MCP Server (FastAPI)
    â”‚
    â”œâ”€â”€ outil_calcul_tva          â†’ Calcul TVA 18% CI
    â”œâ”€â”€ outil_cotisations_cnps    â†’ BarÃ¨me CNPS 2024
    â”œâ”€â”€ outil_verification_nif    â†’ Validation NIF DGI
    â”œâ”€â”€ outil_echeances_fiscales  â†’ Calendrier fiscal DGI
    â””â”€â”€ outil_regime_fiscal       â†’ RÃ©gimes MICRO/RSI/RNI
```

---

## Installation locale

### Prérequis
- Python 3.12+
- Node.js 20+
- Une clé API Anthropic (https://console.anthropic.com)

### 1. Cloner le dépot
```bash
git clone https://github.com/VOTRE_USERNAME/egov-liwaza.git
cd egov-liwaza
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# éditez .env et ajoutez votre ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
cp ../.env.example .env.local
# éditez .env.local et ajoutez votre VITE_ANTHROPIC_API_KEY
npm install
npm run dev
```

Ouvrez http://localhost:3000

### Avec Docker (option recommandÃ©e)
```bash
cp .env.example .env
# éditez .env
docker-compose up --build
```

---

## Tests

```bash
cd backend
python -m pytest tests/ -v
# â†’ 19 tests passent
```

---

## Structure du projet

```
egov-liwaza/                    â† Monorepo
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ main.py             â† Point d'entrÃ©e FastAPI
â”‚   â”‚   â”œâ”€â”€ mcp_server.py       â† Serveur MCP (5 outils)
â”‚   â”‚   â”œâ”€â”€ config.py           â† Configuration Pydantic
â”‚   â”‚   â”œâ”€â”€ models/fiscal.py    â† ModÃ¨les de donnÃ©es
â”‚   â”‚   â””â”€â”€ tools/fiscal_tools.py â† Logique mÃ©tier fiscale
â”‚   â”œâ”€â”€ tests/                  â† Tests pytest (19 tests)
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â””â”€â”€ requirements.txt
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ App.tsx             â† Application principale
â”‚   â”‚   â”œâ”€â”€ hooks/useChat.ts    â† Orchestration Claude + MCP
â”‚   â”‚   â”œâ”€â”€ lib/mcpClient.ts    â† Client MCP
â”‚   â”‚   â””â”€â”€ components/         â† UI components
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ ARCHITECTURE.md
â”‚   â””â”€â”€ AI_STRATEGY.md
â”œâ”€â”€ .github/workflows/ci.yml    â† CI/CD GitHub Actions
â””â”€â”€ docker-compose.yml
```

---

## Endpoints API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/health` | état du serveur |
| GET | `/docs` | Documentation Swagger |
| `*` | `/mcp/*` | Protocole MCP (SSE) |

---

## DÃ©ploiement

### Backend â€” Render
1. Connecter le repo GitHub à  Render
2. CrÃ©er un "Web Service" â†’ pointer vers `backend/`
3. Build command : `pip install -r requirements.txt`
4. Start command : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Ajouter les variables d'environnement dans le dashboard Render

### Frontend â€” Vercel
1. Connecter le repo GitHub a  Vercel
2. Root directory : `frontend`
3. Build command : `npm run build`
4. Ajouter `VITE_ANTHROPIC_API_KEY` et `VITE_MCP_URL` dans les settings Vercel

---

## Hypothèses et compromis

**Hypothèses :**
- Les données fiscales (taux TVA 18%, barÃ¨mes CNPS) sont stables sur la durée du test
- Le NIF ivoirien suit un format standardisÃ© DGI

**Compromis :**
- La clé Anthropic est utilisée cÃ´tÃ© frontend (dangerouslyAllowBrowser) pour la simplicitÃ© du dÃ©mo â€” en production, il faudrait un proxy backend
- Pas de persistance des conversations (localStorage possible comme amÃ©lioration)

**AmÃ©liorations futures :**
- Authentification utilisateurs (OAuth2)
- Persistance conversations en base de donnÃ©es
- IntÃ©gration directe API DGI quand disponible
- Mode hors-ligne avec cache des donnÃ©es fiscales

---

## Outils AI utilisÃ©s

- **Claude** (Anthropic) â€” gÃ©nÃ©ration de code, revue, documentation
- **Prompts utilisÃ©s** : disponibles dans `docs/AI_USAGE.md`

---

*Construit pour le test technique LIWAZA â€” juin 2025*

