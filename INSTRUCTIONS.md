# INSTRUCTIONS — SaaS Pronostics Football IA

> **Document de référence du projet**  
> Ce fichier constitue la source de vérité pour tout travail sur ce dépôt.  
> L'agent IA doit le consulter et s'y conformer à chaque session.

---

## Table des matières

1. [Vision & Proposition de valeur](#1-vision--proposition-de-valeur)
2. [État actuel du MVP](#2-état-actuel-du-mvp)
3. [Arborescence & Fichiers](#3-arborescence--fichiers)
4. [Stack technique](#4-stack-technique)
5. [Pipeline de données](#5-pipeline-de-données)
6. [Moteur IA & Prompt Engineering](#6-moteur-ia--prompt-engineering)
7. [Interface Streamlit (MVP)](#7-interface-streamlit-mvp)
8. [Objectifs immédiats — Feuille de route](#8-objectifs-immédiats--feuille-de-route)
9. [Architecture future & Scalabilité](#9-architecture-future--scalabilité)
10. [Règles de code strictes](#10-règles-de-code-strictes)
11. [Conventions & Glossaire](#11-conventions--glossaire)

---

## 1. Vision & Proposition de valeur

### 1.1 Concept

SaaS de **pronostics et d'analyses de matchs de football** assisté par intelligence artificielle.  
Inspiration produit : **Visifoot** (analyse tactique premium + aide à la décision paris sportifs).

### 1.2 Focus initial

| Paramètre | Valeur |
|-----------|--------|
| Compétition cible | **Coupe du Monde FIFA** |
| Saison de test actuelle | **2022** |
| API compétition | `league=1`, `season=2022` (api-sports.io) |

### 1.3 Proposition de valeur (3 piliers)

1. **Analyse tactique textuelle approfondie** — Rapport structuré généré par IA (compositions, forme, blessures, scénario de jeu).
2. **Value Bet** — Comparaison entre la **probabilité estimée par l'IA** et les **cotes des bookmakers** pour identifier les paris à valeur positive.
3. **Coefficient de fiabilité / certitude** — Indice explicite de confiance de l'analyse (affiché via `st.metric` dans la refonte UI).

### 1.4 Utilisateur cible (MVP → Produit)

- Parieur informé cherchant une analyse qualitative au-delà des statistiques brutes.
- Utilisateur francophone (rapports en **français** prioritairement ; bilingue FR/EN acceptable).

---

## 2. État actuel du MVP

### 2.1 Statut fonctionnel

| Composant | Statut | Description |
|-----------|--------|-------------|
| Collecte API | ✅ Fonctionnel | Script `debut.py` interroge api-sports.io |
| Stockage local | ✅ Fonctionnel | CSV des matchs CDM 2022 |
| Moteur IA | ✅ Fonctionnel | Gemini 2.5 Flash via SDK officiel `google.genai` |
| UI Streamlit | ✅ Fonctionnel | `app.py` — sélection match + bouton analyse |
| Value Bet | ❌ Non implémenté | Objectif produit, pas encore codé |
| Cache DB | ❌ Non implémenté | Architecture future |
| Dashboard premium | ❌ Non implémenté | Objectif immédiat |

### 2.2 Flux actuel (bout en bout)

```
debut.py
  └─► GET https://v3.football.api-sports.io/fixtures?league=1&season=2022
        └─► Extraction : id, domicile, exterieur, statut, score_dom, score_ext
              └─► Sauvegarde CSV absolu

app.py / genere_prono.py
  └─► Lecture CSV
        └─► Sélection match (UI ou hardcodé)
              └─► Construction prompt basique
                    └─► client.models.generate_content(model='gemini-2.5-flash')
                          └─► Affichage texte (Streamlit ou stdout)
```

### 2.3 Limitations connues du MVP

- Prompt minimal (4 lignes max, pas de sections structurées).
- Pas de cotes bookmakers dans le CSV ni dans le prompt.
- Pas de filtrage matchs amicaux / haute intensité.
- Clés API en dur dans le code (à migrer vers variables d'environnement).
- Layout Streamlit linéaire (`layout="centered"`), pas de dashboard face-à-face.
- `genere_prono.py` utilise un chemin CSV relatif (incohérent avec `app.py`).

---

## 3. Arborescence & Fichiers

```
Foot/
├── INSTRUCTIONS.md      ← Ce document (référence projet)
├── app.py               ← Application Streamlit (UI principale)
├── genere_prono.py      ← Script CLI de test IA (1er match du CSV)
└── debut.py             ← Script de collecte api-sports.io → CSV
```

### 3.1 Fichier de données externe

| Propriété | Valeur |
|-----------|--------|
| Chemin absolu | `/Users/martinbrunet-lecomte/Downloads/matchs_cdm_2022.csv` |
| Format | CSV UTF-8, séparateur virgule |
| Colonnes | `id`, `domicile`, `exterieur`, `statut`, `score_dom`, `score_ext` |

> **Règle** : Toute lecture/écriture de ce fichier doit utiliser le **chemin absolu** ci-dessus.

---

## 4. Stack technique

| Couche | Technologie | Version / Détail |
|--------|-------------|------------------|
| Langage | Python | 3.x |
| Manipulation données | Pandas | `read_csv`, `DataFrame` |
| UI | Streamlit | `st.set_page_config`, `st.cache_data`, widgets |
| IA | Google GenAI SDK | `from google import genai` — **SDK officiel actuel** |
| Modèle LLM | Gemini | `gemini-2.5-flash` |
| Collecte sportive | api-sports.io | API v3 Football |
| HTTP client | requests | Collecte uniquement (`debut.py`) |

### 4.1 Dépendances implicites

```
pandas
streamlit
google-genai          # PAS google-generativeai
requests
```

---

## 5. Pipeline de données

### 5.1 Source API

| Paramètre | Valeur |
|-----------|--------|
| Endpoint | `https://v3.football.api-sports.io/fixtures` |
| Header auth | `x-apisports-key: <API_KEY>` |
| Query params (test) | `league=1`, `season=2022` |
| Script responsable | `debut.py` |

### 5.2 Schéma de données match (actuel)

```python
{
    "id": int,           # fixture id api-sports
    "domicile": str,     # teams.home.name
    "exterieur": str,    # teams.away.name
    "statut": str,       # fixture.status.short (ex: FT, NS, LIVE)
    "score_dom": int,    # goals.home (nullable si non joué)
    "score_ext": int,    # goals.away (nullable si non joué)
}
```

### 5.3 Schéma de données cible (roadmap)

Colonnes additionnelles à prévoir :

| Colonne | Source | Usage |
|---------|--------|-------|
| `date_kickoff` | fixture.date | Cache invalidation, phases J-2 / H-1 |
| `cote_dom` | Odds API | Value Bet |
| `cote_nul` | Odds API | Value Bet |
| `cote_ext` | Odds API | Value Bet |
| `proba_ia_dom` | Sortie IA parsée | Value Bet |
| `confiance_ia` | Sortie IA parsée | st.metric |
| `lineups_officielles` | API lineups | Phase critique H-1 |

### 5.4 Script de collecte — comportement attendu

```python
# debut.py — pattern de sauvegarde obligatoire
df.to_csv("/Users/martinbrunet-lecomte/Downloads/matchs_cdm_2022.csv", index=False)
```

---

## 6. Moteur IA & Prompt Engineering

### 6.1 SDK & modèle (obligatoire)

```python
from google import genai

client = genai.Client(api_key=CLE_API_LLM)

reponse = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)
```

### 6.2 Interdictions IA

| ❌ Interdit | ✅ Obligatoire |
|------------|---------------|
| `import google.generativeai` | `from google import genai` |
| `genai.configure()` | `genai.Client(api_key=...)` |
| `model.generate_content()` (ancienne API) | `client.models.generate_content()` |
| Modèles deprecated non validés | `gemini-2.5-flash` (sauf décision explicite) |

### 6.3 Structure du prompt cible (refonte immédiate)

Le prompt doit demander un **rapport Markdown structuré en français** (bilingue FR/EN acceptable) avec **exactement ces sections** :

```markdown
## 1. Compositions probables ou officielles
[Détails des XI probables ou confirmés, systèmes de jeu]

## 2. État de forme des forces en présence
[Forme récente — EXCLURE les matchs amicaux, ne conserver que compétitions à haute intensité :
 CDM, éliminatoires, compétitions continentales, Liga/PL/etc.]

## 3. Infirmerie
[Blessures et suspensions clés des deux effectifs]

## 4. Scénario tactique du match
[Physionomie attendue : possession, bloc bas/haut, transitions, zones clés]

## 5. Verdict final
[Prédiction + formulation EXPLICITE de la confiance, ex :
 "L'IA est très confiante (87%) en une victoire de l'équipe X..."]
```

### 6.4 Directives prompt supplémentaires

- **Ne pas spoiler** le score réel même s'il est présent dans les données contextuelles.
- Ton : professionnel, analytique, direct.
- Longueur : rapport détaillé (pas limité à 4 lignes — l'ancienne contrainte MVP est obsolète).
- Sortie parsable : prévoir extraction future de `confiance_ia` et probabilités pour Value Bet.
- Filtrage amicaux : instruction explicite dans le prompt jusqu'à filtrage côté données.

### 6.5 Fonction de construction du prompt (pattern cible)

Centraliser la logique dans une fonction dédiée (ex. `creer_prompt_pour_match()` dans `genere_prono.py`, à enrichir et partager avec `app.py`) :

```python
def creer_prompt_pour_match(match: pd.Series) -> str:
    """Construit le prompt structuré pour Gemini."""
    ...
```

---

## 7. Interface Streamlit (MVP)

### 7.1 État actuel (`app.py`)

- `st.set_page_config(page_title="SaaS Pronostics IA", layout="centered")`
- `@st.cache_data` sur `charger_donnees()`
- `st.selectbox` pour choisir le match (`domicile vs exterieur`)
- `st.button` → spinner → `st.success` + `st.info(reponse.text)`

### 7.2 Refonte UI/UX cible (objectif immédiat)

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  ⚽ Tableau de Bord - Pronostics          [mode sombre]  │
├──────────────┬─────────────────────┬──────────────────────┤
│              │                     │                      │
│  ÉQUIPE      │   ANALYSE IA        │     ÉQUIPE           │
│  DOMICILE    │   (Markdown zones)  │     EXTÉRIEUR        │
│              │                     │                      │
│  [logo/nom]  │  Section 1..5       │  [logo/nom]          │
│              │                     │                      │
├──────────────┴─────────────────────┴──────────────────────┤
│  MÉTRIQUES : Cote dom │ Cote nul │ Cote ext │ Confiance  │
└─────────────────────────────────────────────────────────┘
```

#### Composants Streamlit à utiliser

| Composant | Usage |
|-----------|-------|
| `st.columns([1, 2, 1])` | Layout 3 colonnes face-à-face |
| `st.metric` | Cotes bookmakers + indice confiance IA |
| `st.markdown` | Rendu des 5 sections du rapport IA |
| `st.spinner` | Feedback pendant génération |
| CSS custom (`st.markdown(unsafe_allow_html=True)`) | Mode sombre, accents sportifs |

#### Charte graphique

| Élément | Spécification |
|---------|---------------|
| Thème | **Mode sombre** (fond `#0e1117` ou équivalent Streamlit dark) |
| Accents | Vert pelouse `#00c853`, blanc `#ffffff`, gris `#b0b0b0` |
| Typographie | Sans-serif, titres en gras, hiérarchie claire |
| Densité | Épurée — pas de surcharge visuelle |

#### Configuration page recommandée

```python
st.set_page_config(
    page_title="SaaS Pronostics IA",
    layout="wide",          # ← passer de "centered" à "wide"
    initial_sidebar_state="collapsed"
)
```

---

## 8. Objectifs immédiats — Feuille de route

### 8.1 Priorité 1 — Refonte UI/UX Streamlit

- [ ] Passer `layout="wide"`
- [ ] Implémenter `st.columns` : équipe domicile | analyse | équipe extérieur
- [ ] Afficher métriques cotes + confiance via `st.metric`
- [ ] Appliquer charte sombre + accents sportifs
- [ ] Parser et afficher les 5 sections Markdown séparément

### 8.2 Priorité 2 — Enrichissement Prompt Engineering

- [ ] Réécrire `creer_prompt_pour_match()` avec les 5 sections strictes
- [ ] Ajouter filtre amicaux (prompt + future donnée)
- [ ] Formulation explicite confiance dans section Verdict
- [ ] Factoriser prompt partagé entre `app.py` et `genere_prono.py`

### 8.3 Priorité 3 — Préparation Value Bet (foundation)

- [ ] Définir format de sortie parsable (confiance %, probabilités 1X2)
- [ ] Préparer placeholders `st.metric` pour cotes (données futures)

---

## 9. Architecture future & Scalabilité

### 9.1 Stratégie de caching (analyses IA)

**Objectif** : Affichage servi en **< 50 ms** pour les matchs déjà analysés.

```
Requête analyse(match_id)
  │
  ├─ Cache DB hit ? ──► Retourner texte stocké (< 50ms)
  │
  └─ Cache miss ──► Appel Gemini ──► Persister ──► Retourner
```

#### Modèle de données cache (proposition)

```sql
-- Table: analyses_match
match_id          INT PRIMARY KEY
contenu_markdown  TEXT
confiance_ia      FLOAT        -- 0.0 à 1.0
proba_dom         FLOAT
proba_nul         FLOAT
proba_ext         FLOAT
genere_a          TIMESTAMP
verrouille        BOOLEAN      -- true après phase H-1
version           INT          -- incrémenté à chaque regénération
```

### 9.2 Cycle de vie du cache — Invalidation

#### Phase 1 : Attente (J-2 → H-2 avant coup d'envoi)

| Paramètre | Valeur |
|-----------|--------|
| Durée | De J-2 à H-2 |
| Fréquence refresh | **Toutes les 6 heures** |
| Raison | Suivre l'évolution des cotes et de la forme |
| Verrouillage | Non |

#### Phase 2 : Critique (H-1 → coup d'envoi)

| Événement | Action |
|-----------|--------|
| Compositions officielles publiées (API lineups) | **Invalider** cache existant |
| Post-invalidation | Générer analyse finale ultra-précise |
| Post-génération | **Verrouiller** cache jusqu'au coup d'envoi |
| Pendant verrouillage | Aucune regénération, servir cache figé |

```
Timeline
──────────────────────────────────────────────────────────►
     J-2          J-1          H-2          H-1       KO
      │             │             │             │        │
      └─ Refresh 6h ──────────────┘             │        │
                    └─ Refresh 6h ──────────────┘        │
                              Lineups OK ─► INVALIDATE   │
                                         └─ FINAL LOCK ──┘
```

### 9.3 Évolutions infrastructure prévues

| Composant | Technologie suggérée | Phase |
|-----------|---------------------|-------|
| Base de données | PostgreSQL ou SQLite (dev) | Post-MVP |
| ORM | SQLAlchemy | Post-MVP |
| Scheduler refresh | APScheduler ou Celery Beat | Post-MVP |
| Secrets | Variables d'environnement / `.env` | Court terme |
| Déploiement | Streamlit Cloud ou Docker | Moyen terme |
| Auth utilisateurs | Streamlit-Authenticator ou OAuth | Long terme |

### 9.4 Value Bet — Formule cible

```
Value = (Probabilité_IA × Cote_Bookmaker) - 1

Si Value > 0 → Value Bet identifié
Afficher : probabilité IA, cote, value %, confiance globale
```

---

## 10. Règles de code strictes

### 10.1 SDK Google GenAI

```python
# ❌ INTERDIT — Bibliothèque obsolète
import google.generativeai as genai
genai.configure(api_key=...)
model = genai.GenerativeModel('gemini-pro')
model.generate_content(...)

# ✅ OBLIGATOIRE — SDK officiel actuel
from google import genai
client = genai.Client(api_key=CLE_API_LLM)
reponse = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)
```

### 10.2 Chemins de fichiers

```python
# ❌ INTERDIT — Chemins relatifs pour les fichiers système
pd.read_csv("matchs_cdm_2022.csv")
df.to_csv("matchs_cdm_2022.csv")

# ✅ OBLIGATOIRE — Chemins absolus
CSV_MATCHS = "/Users/martinbrunet-lecomte/Downloads/matchs_cdm_2022.csv"
pd.read_csv(CSV_MATCHS)
df.to_csv(CSV_MATCHS, index=False)
```

> Centraliser les chemins absolus en **constantes en tête de fichier** ou dans un module `config.py` futur.

### 10.3 Sécurité des clés API

- Ne **jamais** committer de clés API en clair (migration vers `.env` recommandée).
- Utiliser `os.environ.get("GEMINI_API_KEY")` et `os.environ.get("APISPORTS_KEY")`.
- Ne pas dupliquer les clés dans ce document ni dans les commentaires publics.

### 10.4 Qualité & cohérence

| Règle | Détail |
|-------|--------|
| DRY | Partager `creer_prompt_pour_match()` entre scripts |
| Typage | Ajouter type hints sur les fonctions publiques |
| Cache Streamlit | `@st.cache_data` pour lecture CSV |
| Gestion erreurs | `try/except FileNotFoundError` avec message UI clair |
| Langue UI | Français pour tous les labels Streamlit |
| Langue rapports IA | Français (bilingue acceptable) |

### 10.5 Interdictions générales

- Ne pas introduire de frameworks UI alternatifs (React, Flask) sans décision explicite.
- Ne pas changer de modèle Gemini sans validation.
- Ne pas supprimer les scores réels du contexte IA (utiles en dev/test) — mais toujours instruire le modèle de ne pas les spoiler.
- Ne pas créer de commits sauf demande explicite de l'utilisateur.

---

## 11. Conventions & Glossaire

### 11.1 Naming conventions (Python)

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | snake_case | `match_choisi`, `cle_api_llm` |
| Fonctions | snake_case | `charger_donnees()`, `creer_prompt_pour_match()` |
| Constantes | UPPER_SNAKE | `CSV_MATCHS`, `CLE_API_LLM` |
| Colonnes CSV | snake_case FR | `domicile`, `exterieur`, `score_dom` |

### 11.2 Glossaire métier

| Terme | Définition |
|-------|------------|
| **Value Bet** | Pari dont la probabilité réelle estimée > probabilité implicite de la cote |
| **Confiance IA** | Score 0–100% exprimant la certitude du modèle sur son verdict |
| **Phase attente** | J-2 à H-2 : refresh analyse toutes les 6h |
| **Phase critique** | H-1 : invalidation cache à la sortie des compos, analyse finale verrouillée |
| **Haute intensité** | Matchs officiels (CDM, éliminatoires, compétitions majeures) — exclut amicaux |
| **Spoiler** | Révéler le score réel dans l'analyse (interdit en production) |

### 11.3 Commandes de lancement

```bash
# Collecte données
python debut.py

# Test IA CLI (1er match)
python genere_prono.py

# Application Streamlit
streamlit run app.py
```

---

## Annexe A — Checklist agent IA

Avant toute modification, vérifier :

- [ ] SDK `from google import genai` (pas `google.generativeai`)
- [ ] Modèle `gemini-2.5-flash`
- [ ] Chemins absolus pour CSV
- [ ] Prompt structuré 5 sections (si touchant l'analyse)
- [ ] UI wide + columns (si touchant Streamlit)
- [ ] Pas de clés API exposées dans les diffs
- [ ] Cohérence avec la feuille de route (Priorité 1 / 2 / 3)

---

*Dernière mise à jour : généré à partir de l'état MVP du projet — CDM 2022, Streamlit, Gemini 2.5 Flash.*
