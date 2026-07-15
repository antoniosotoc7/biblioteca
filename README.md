# Biblioteca compartida

## Publicar en Netlify

Esta versión necesita Netlify Functions y Netlify Blobs para compartir recomendaciones.

1. Sube esta carpeta completa a un repositorio de GitHub.
2. En Netlify, elige **Add new project > Import an existing project**.
3. Conecta el repositorio.
4. Deja vacío el comando de build.
5. Usa `.` como directorio de publicación.
6. Publica el proyecto.

No subas solo `index.html`: las carpetas `netlify/functions`, `package.json` y `netlify.toml` son necesarias.

## Funcionamiento

- La biblioteca personal se guarda en localStorage, separada por nombre.
- Cada valoración se envía a Netlify Blobs.
- La sección Recomendaciones agrega las valoraciones de todos los usuarios.
- El nombre es un perfil local, no una cuenta segura con contraseña.

- La valoración ahora es de 1 a 5 estrellas. Solo 5 estrellas cuenta como recomendación.
