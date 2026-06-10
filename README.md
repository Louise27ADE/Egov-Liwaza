# eGov CI — Plateforme Fiscale Intelligente

> Plateforme eGov alimentée par l'IA, permettant aux entreprises et citoyens de Côte d'Ivoire d'interagir avec les services fiscaux en langage naturel.

**Auteure :** Louise ADEDOKUN  
**Stack :** Python · FastAPI · MCP · React · TypeScript · Tailwind · Claude claude-sonnet-4-6  
**Déploiement :** Render (backend) · Vercel (frontend)

---

## Aperçu du produit

L'utilisateur pose une question en français ou en anglais :

> *"Calcule la TVA sur 500 000 FCFA pour une vente"*

L'assistant :
1. Comprend la requête grâce à Claude
2. Identifie l'outil MCP approprié (`outil_calcul_tva`)
3. Exécute l'outil sur le MCP Server (backend Python)
4. Retourne un résultat structuré et clair

---

## Architecture

```
Utilisateur
    │
    ▼
React Frontend (MCP Client)
    │  Claude claude-sonnet-4-6 (Anthropic API)
    │  Tool use → appels MCP
    │
    ▼
Python MCP Server (FastAPI)
    │
    ├── outil_calcul_tva          → Calcul TVA 18% CI
    ├── outil_cotisations_cnps    → Barème CNPS 2024
    ├── outil_verification_nif    → Validation NIF DGI
    ├── outil_echeances_fiscales  → Calendrier fiscal DGI
    └── outil_regime_fiscal       → Régimes MICRO/RSI/RNI
```

---

## Installation locale

### Prérequis
- Python 3.12+
- Node.js 20+
- Une clé API Anthropic (https://console.anthropic.com)

### 1. Cloner le dépôt
```bash
git clone https://github.com/VOTRE_USERNAME/egov-liwaza.git
cd egov-liwaza
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Éditez .env et ajoutez votre ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
cp ../.env.example .env.local
# Éditez .env.local et ajoutez votre VITE_ANTHROPIC_API_KEY
npm install
npm run dev
```

Ouvrez http://localhost:3000

### Avec Docker (option recommandée)
```bash
cp .env.example .env
# Éditez .env
docker-compose up --build
```

---

## Tests

```bash
cd backend
python -m pytest tests/ -v
# → 19 tests passent
```

---

## Structure du projet

```
egov-liwaza/                    ← Monorepo
├── backend/
│   ├── app/
│   │   ├── main.py             ← Point d'entrée FastAPI
│   │   ├── mcp_server.py       ← Serveur MCP (5 outils)
│   │   ├── config.py           ← Configuration Pydantic
│   │   ├── models/fiscal.py    ← Modèles de données
│   │   └── tools/fiscal_tools.py ← Logique métier fiscale
│   ├── tests/                  ← Tests pytest (19 tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx             ← Application principale
│   │   ├── hooks/useChat.ts    ← Orchestration Claude + MCP
│   │   ├── lib/mcpClient.ts    ← Client MCP
│   │   └── components/         ← UI components
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── AI_STRATEGY.md
├── .github/workflows/ci.yml    ← CI/CD GitHub Actions
└── docker-compose.yml
```

---

## Endpoints API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/health` | État du serveur |
| GET | `/docs` | Documentation Swagger |
| `*` | `/mcp/*` | Protocole MCP (SSE) |

---

## Déploiement

### Backend — Render
1. Connecter le repo GitHub à Render
2. Créer un "Web Service" → pointer vers `backend/`
3. Build command : `pip install -r requirements.txt`
4. Start command : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Ajouter les variables d'environnement dans le dashboard Render

### Frontend — Vercel
1. Connecter le repo GitHub à Vercel
2. Root directory : `frontend`
3. Build command : `npm run build`
4. Ajouter `VITE_ANTHROPIC_API_KEY` et `VITE_MCP_URL` dans les settings Vercel

---

## Hypothèses et compromis

**Hypothèses :**
- Les données fiscales (taux TVA 18%, barèmes CNPS) sont stables sur la durée du test
- Le NIF ivoirien suit un format standardisé DGI

**Compromis :**
- La clé Anthropic est utilisée côté frontend (dangerouslyAllowBrowser) pour la simplicité du démo — en production, il faudrait un proxy backend
- Pas de persistance des conversations (localStorage possible comme amélioration)

**Améliorations futures :**
- Authentification utilisateurs (OAuth2)
- Persistance conversations en base de données
- Intégration directe API DGI quand disponible
- Mode hors-ligne avec cache des données fiscales

---

## Outils AI utilisés

- **Claude** (Anthropic) — génération de code, revue, documentation
- **Prompts utilisés** : disponibles dans `docs/AI_USAGE.md`

---

*Construit pour le test technique LIWAZA — juin 2025*
