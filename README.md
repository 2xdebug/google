# Deploy sur Render

## Fichiers prêts

- `server.js` (serveur Node)
- `package.json` (script `npm start`)
- `render.yaml` (config Render)

## Déploiement

1. Push ce dossier sur GitHub.
2. Sur Render: `New` -> `Blueprint`.
3. Connecte ton repo GitHub.
4. Render lit `render.yaml` et crée le service automatiquement.
5. Ouvre l'URL `https://...onrender.com`.

## Logs (terminal Render)

- Dans Render, ouvre ton service puis onglet `Logs`.
- Les `console.log` de `server.js` y apparaissent en direct.

## Vérification santé

- Endpoint: `/healthz`
- Doit répondre `{ "ok": true }`
