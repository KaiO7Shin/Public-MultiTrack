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

1. Créer un **Static Site** pointant sur ce dépôt / dossier `Public-MultiTrack`.
2. **Avant le build**, définir la variable d’environnement :
   - `VITE_API_URL` = `https://b-mtrack-service.onrender.com/api` (ou l’URL de votre API)
3. Build command : `npm install && npm run build`
4. Publish directory : `dist`
5. (Optionnel) Rewrite SPA : toutes les routes vers `/index.html` pour React Router.

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
