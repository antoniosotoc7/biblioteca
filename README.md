# Biblioteca sincronizada

Esta versión guarda cada biblioteca en Netlify Blobs.

## Estructura necesaria
- index.html
- package.json
- netlify.toml
- netlify/functions/library.mjs
- netlify/functions/reviews.mjs
- netlify/functions/recommendations.mjs

## Netlify
- Build command: vacío
- Publish directory: .
- Node: 18 o superior

Al entrar con el mismo nombre desde otro dispositivo, se carga la misma biblioteca.
El nombre actúa como identificador, no como cuenta segura. Dos personas que escriban exactamente el mismo nombre accederán a la misma biblioteca.

- Contador personal por usuario.
- Biblioteca total compartida.
- Función añadida: netlify/functions/total-library.mjs
