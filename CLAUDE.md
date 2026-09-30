# Darwash · Inicio — contexto para Claude Code

Launcher estático (sin build) de las apps de Darwash SA. Se usa como:
- Sitio en GitHub Pages: https://darwashsa-ux.github.io/inicio/ (repo darwashsa-ux/inicio, rama main)
- Extensión Chrome MV3 (pestaña nueva) cargada "descomprimida" desde C:\Darwash\darwash-inicio
- PWA en tablet

## Archivos
- `config.js` → lista de apps/secciones, fuente de remates (Supabase), ubicación del clima. **Casi todo cambio de contenido va acá.**
- `app.js` → lógica (render tiles, búsqueda, clima Open-Meteo, dólar dolarapi.com, remates, modo edición)
- `styles.css` / `index.html` → diseño. Paleta Darwash: teal #008995, navy #122A42, gold #C9A227. Serif Marcellus, sans Inter.
- `lucide.min.js`, `fonts/`, `img/` → todo local (vendorizado).

## Reglas (importantes)
- **Nada de scripts inline ni `onclick=` en el HTML**: la CSP de extensiones MV3 los bloquea. Todo JS va en archivos .js.
- **Nada de CDNs**: todo recurso tiene que estar en el repo (la extensión corre offline).
- Íconos: nombres de https://lucide.dev/icons (kebab-case). Verificar que existan en la versión vendorizada (0.469).
- **Al cambiar `config.js`, subir `version`** (si no, los navegadores con cambios locales del modo Editar no ven la config nueva).
- Remates: tabla `calendario_remates` (id, fecha, lugar) en el Supabase de Anotaciones Feria. Lectura pública; alta/baja SOLO vía RPC `cal_agregar` / `cal_borrar` con PIN (ver `supabase/calendario_remates.sql`). El PIN se guarda en localStorage (`dw.calpin`). Plazas rápidas en `config.plazas`.
- Probar abriendo `index.html` en el navegador antes de pushear.

## Publicar
```
git add . ; git commit -m "mensaje" ; git push
```
Después: `chrome://extensions` → ⟳ en la extensión "Darwash · Inicio".
