# MultiTrack — Classements en direct

Application web **publique** (lecture seule, sans login) pour afficher les classements en direct des courses MultiTrack. Companion de Front-MultiTrack.

## Prérequis

- Node.js 20+
- Accès à l’API backend MultiTrack

## Configuration

Créer un fichier `.env` à la racine (voir `.env.example`) :

```env
VITE_API_URL=https://b-mtrack-service.onrender.com/api
```

`VITE_API_URL` est injectée **au build** par Vite. Sans elle, le client utilise le fallback :

`https://b-mtrack-service.onrender.com/api`

## Lancement local

```bash
npm install
npm run dev
```

L’app démarre sur [http://localhost:5174](http://localhost:5174) (toutes interfaces).

## Build

```bash
npm run build
npm run preview
```

Le dossier de publication est `dist/`.

## Déploiement Render (Static Site)

### Option A — depuis le dashboard (recommandé)

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Static Site**
3. Connecte le dépôt GitHub **`KaiO7Shin/Public-MultiTrack`** (branche `main`)
4. Réglages :
   - **Name** : `public-multitrack` (ou autre)
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
5. **Environment** (avant le premier build) :
   - `VITE_API_URL` = `https://b-mtrack-service.onrender.com/api`
6. **Redirects/Rewrites** (SPA React Router) :
   - Source : `/*`
   - Destination : `/index.html`
   - Action : **Rewrite**
7. **Create Static Site** → attendre le build vert

### Option B — Blueprint

Le fichier `render.yaml` est à la racine. Sur Render : **New** → **Blueprint** → sélectionner ce dépôt.

### Important

`VITE_API_URL` est lue **au moment du build** Vite. Si tu la changes après coup, relance un **Manual Deploy** (Clear build cache + deploy).

## API utilisée (lecture seule)

| Méthode | Chemin |
|---------|--------|
| GET | `/races` |
| GET | `/races/:id/ranking` (TRAIL) |
| GET | `/races/:id/ranking/dh` (DH, `phaseId`) |
| GET | `/races/:id/ranking/xc` (XC, `phaseId`) |
| GET | `/categories` |
| GET | `/phases?courseId=` (sélection de phase DH/XC) |

Aucun token. Aucun interceptor d’authentification.

## UX

1. Choisir une course sur l’accueil  
2. Voir le classement (podium, liste, recherche dossard/nom, filtres Tous / Hommes / Femmes / Catégories)  
3. Optionnel : fiche coureur  

Rafraîchissement automatique toutes les **20 secondes**, avec horodatage « Mis à jour à HH:MM ».

## Hors scope

Login, admin, scan, import, PDF, édition.
