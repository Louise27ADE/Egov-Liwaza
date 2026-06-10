# Document de Décision d'Architecture

**Projet :** eGov CI — Plateforme Fiscale Intelligente  
**Auteure :** Louise ADEDOKUN  
**Date :** Juin 2025

---

## Architecture actuelle

### Diagramme

```
┌─────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                           │
│              (navigateur web — mobile ou desktop)            │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel)                          │
│                React + TypeScript + Tailwind                 │
│                                                              │
│   ┌──────────────┐    ┌───────────────────────────────┐     │
│   │  Interface   │    │        useChat Hook            │     │
│   │conversation- │◄──►│  Anthropic claude-sonnet-4-6  │     │
│   │  nelle UI    │    │  Tool use orchestration        │     │
│   └──────────────┘    └──────────────┬────────────────┘     │
└─────────────────────────────────────-│─────────────────────┘
                                       │ HTTP POST /mcp/call-tool
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Render)                           │
│                Python + FastAPI + MCP                        │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  MCP Server (FastMCP)                │   │
│   │                                                      │   │
│   │  outil_calcul_tva        → TVA 18% CI               │   │
│   │  outil_cotisations_cnps  → Barème CNPS 2024         │   │
│   │  outil_verification_nif  → Format NIF DGI           │   │
│   │  outil_echeances_fiscales → Calendrier DGI          │   │
│   │  outil_regime_fiscal     → MICRO / RSI / RNI        │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Interactions entre services

1. L'utilisateur envoie un message en langage naturel
2. Le hook `useChat` envoie le message à Claude (Anthropic API) avec les outils MCP disponibles
3. Claude analyse la requête et décide quel(s) outil(s) appeler
4. Le frontend appelle `/mcp/call-tool` sur le backend
5. Le backend exécute l'outil (calcul, validation, recherche)
6. Le résultat remonte à Claude qui formule une réponse claire
7. La réponse s'affiche dans l'interface

### Topologie de déploiement

| Composant | Service | Région | URL |
|-----------|---------|--------|-----|
| Frontend | Vercel | Global CDN | `https://egov-ci.vercel.app` |
| Backend | Render | Frankfurt | `https://egov-backend.onrender.com` |

---

## Décisions architecturales

### Monorepo vs Multi-repo

**Choix : Monorepo**

**Justification :**
- Projet de taille réduite (1 backend + 1 frontend)
- Partage de types TypeScript entre frontend et backend possible
- CI/CD unifié dans un seul workflow GitHub Actions
- Un seul `git clone` pour l'onboarding de nouveaux développeurs

**Avantages :**
- Cohérence des versions et des dépendances
- Refactoring cross-service simplifié
- Visibilité totale du projet

**Inconvénients :**
- Si le projet grossit (10+ services), le repo devient lourd
- Les permissions Git ne peuvent pas être granulaires par service
- Les builds peuvent devenir lents sans optimisation (Nx, Turborepo)

**Verdict :** Pour ce projet, le monorepo est clairement le bon choix. À 5+ services, je passerais à un multi-repo avec une couche de partage de types via npm packages privés.

---

### Python + FastAPI vs Node.js pour le backend

**Choix : Python + FastAPI**

**Justification :**
- L'écosystème IA/ML de Python est incomparable (LangChain, transformers, etc.)
- FastAPI génère automatiquement la documentation OpenAPI
- Pydantic offre une validation robuste des données en entrée
- La bibliothèque MCP officielle d'Anthropic est d'abord disponible en Python

---

### Architecture MCP

**Choix : React comme MCP Client, Python comme MCP Server**

Le protocole MCP sépare clairement les responsabilités :
- Le frontend **ne contient pas de logique métier** — il orchestre uniquement
- Le backend **expose des outils** avec une interface contractuelle claire
- Cette séparation facilite les tests, le remplacement de modèle LLM, et l'évolution

---

## Scalabilité : de 100 à 100 000 utilisateurs

### 100 utilisateurs (état actuel)
- Architecture simple, un seul serveur backend
- Pas de cache nécessaire
- Base de données non requise (données fiscales statiques)
- Coût : ~$0/mois (tiers gratuits Vercel + Render)

### 10 000 utilisateurs
**Changements nécessaires :**
- **Cache Redis** : mettre en cache les calculs fréquents (ex: "TVA sur 500 000 FCFA" est calculé des centaines de fois par jour — le résultat peut être mis en cache 1h)
- **Base de données PostgreSQL** : persister les conversations utilisateurs
- **Authentification JWT** : identifier les utilisateurs
- **Rate limiting** : protéger l'API contre les abus
- **Monitoring** : Sentry pour les erreurs, Prometheus + Grafana pour les métriques

**Coût estimé :** ~$50-100/mois

### 100 000 utilisateurs
**Changements nécessaires :**
- **Scaling horizontal** : plusieurs instances backend derrière un load balancer
- **Queue de messages** (Redis Queue ou Celery) : les calculs longs en arrière-plan
- **CDN** pour les assets statiques : déjà géré par Vercel
- **Base de données scalable** : PostgreSQL avec read replicas
- **Streaming LLM** : responses en streaming pour réduire le temps perçu
- **Optimisation coûts API** : cache agressif des réponses Claude identiques (prompt caching Anthropic)

**Coût estimé :** ~$500-2000/mois selon l'usage de l'API Anthropic

### Considérations RGPD/données
- Les données fiscales des utilisateurs sont sensibles
- Hébergement en Europe recommandé (Frankfurt, Paris)
- Pas de stockage des clés API utilisateurs en clair
- Logs anonymisés
