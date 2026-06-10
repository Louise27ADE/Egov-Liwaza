# Stratégie AI & LLM — eGov CI

**Auteure :** Louise ADEDOKUN  
**Date :** Juin 2025

---

## Contexte produit

Notre plateforme eGov CI est un produit conversationnel à usage fiscal. Les contraintes spécifiques :
- **Précision critique** : une erreur de calcul fiscal peut entraîner des pénalités pour l'utilisateur
- **Latence visible** : l'utilisateur attend la réponse dans une interface de chat
- **Données sensibles** : informations fiscales des entreprises ivoiriennes
- **Multilangue** : français (primaire) + anglais

---

## Comparatif des modèles

### GPT-4.1 (OpenAI)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐⭐ Excellente — très bon en raisonnement structuré |
| Coût | $2/M tokens input, $8/M output (élevé) |
| Latence | ~1-3s pour une réponse |
| Confidentialité | Données envoyées aux serveurs US OpenAI |

**Pour notre produit :** Bon choix de fallback, mais coût élevé pour un usage intensif.

---

### GPT-4o (OpenAI)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐ Bonne — multimodal, plus rapide que 4.1 |
| Coût | $2.50/M tokens input, $10/M output |
| Latence | ~0.5-1.5s — meilleure que 4.1 |
| Confidentialité | Données envoyées aux serveurs US OpenAI |

**Pour notre produit :** Plus adapté pour une UX rapide, mais la confidentialité reste un enjeu pour les données fiscales.

---

### Claude claude-sonnet-4-6 (Anthropic) ← **Notre choix actuel**
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐⭐ Excellente — très précis en français, excellent en tool use |
| Coût | $3/M tokens input, $15/M output |
| Latence | ~1-2s |
| Confidentialité | Politique de confidentialité stricte Anthropic, option Zero Data Retention |

**Pourquoi Claude Sonnet pour ce projet :**
- Le **tool use** de Claude est particulièrement fiable — il appelle les outils MCP avec les bons paramètres
- Excellent support du **français africain** (contexte Côte d'Ivoire)
- La politique "Constitutional AI" d'Anthropic réduit les hallucinations sur les données factuelles
- Option **prompt caching** : si le system prompt est identique entre les requêtes, on économise jusqu'à 90% des coûts

---

### Claude Opus 4.8 (Anthropic)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐⭐ La meilleure qualité disponible |
| Coût | $15/M tokens input, $75/M output (très élevé) |
| Latence | ~3-5s |
| Confidentialité | Identique à Sonnet |

**Pour notre produit :** Réservé aux tâches critiques (ex: générer une liasse fiscale complète, analyser un bilan). Trop coûteux pour chaque message de chat.

---

### Gemini 2.5 (Google)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐ Très bonne — excellent contexte long (1M tokens) |
| Coût | Gratuit (tier) puis $0.15/M tokens |
| Latence | ~1-2s |
| Confidentialité | Données traitées par Google — à éviter pour données fiscales sensibles |

**Pour notre produit :** Excellent rapport qualité/prix pour les tâches non-sensibles. Problématique pour les données fiscales d'entreprises (compliance RGPD).

---

### Llama 3.x (Meta — open source)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐ Bonne pour les tâches standard |
| Coût | **Gratuit** en self-hosting |
| Latence | Dépend de l'infrastructure |
| Confidentialité | ⭐⭐⭐⭐⭐ Maximale — données jamais envoyées à un tiers |

**Pour notre produit :** **Option recommandée à moyen terme** pour les entreprises ivoiriennes soucieuses de souveraineté des données. Un Llama fine-tuné sur le Code Général des Impôts CI serait idéal. Nécessite une infrastructure GPU (coût initial élevé).

---

### Mistral (Mistral AI — européen)
| Critère | Évaluation |
|---------|-----------|
| Qualité | ⭐⭐⭐⭐ Très bonne — excellent en français |
| Coût | $2/M tokens |
| Latence | ~0.5-1s — très rapide |
| Confidentialité | Hébergement EU — conforme RGPD |

**Pour notre produit :** **Fort candidat** pour la conformité RGPD. Excellent en français. Mistral Large est notre second choix après Claude Sonnet.

---

## Recommandation par cas d'usage

| Cas d'usage | Modèle recommandé | Justification |
|-------------|-------------------|---------------|
| Chat fiscal standard | Claude claude-sonnet-4-6 | Précision + tool use + français |
| Génération liasse fiscale | Claude Opus 4.8 | Tâche critique, qualité maximale |
| Autocomplete rapide | Mistral Medium | Latence faible, coût réduit |
| Self-hosting (données sensibles) | Llama 3.3 70B | Confidentialité totale |
| Volume très élevé | GPT-4o-mini | Coût réduit pour requêtes simples |

---

## Considérations RGPD et conformité

1. **Zero Data Retention** : Nous utilisons l'option ZDR d'Anthropic — les données ne sont pas utilisées pour entraîner les modèles
2. **Pas de PII dans les prompts** : Nous n'envoyons jamais de nom, SIRET, ou NIF dans le prompt — seulement des montants et des types d'opérations
3. **Chiffrement en transit** : HTTPS obligatoire sur tous les endpoints
4. **Audit trail** : Tous les appels d'outils sont loggués (sans données personnelles) pour la traçabilité

---

## Opportunités de self-hosting

À 50 000+ utilisateurs mensuels actifs, le coût API Anthropic devient significatif (~$3 000-10 000/mois). À ce stade :

1. **Fine-tuning Llama 3.3 70B** sur le Code Général des Impôts CI et les procédures DGI
2. **Déploiement sur GPU cloud** (Lambda Labs, Vast.ai) — ~$0.50-1.50/h pour A100
3. **Économie estimée** : -70% de coût API vs Claude Sonnet

Cette évolution permettrait aussi une **meilleure confidentialité des données** — enjeu majeur pour les entreprises ivoiriennes qui gèrent des informations fiscales sensibles.
