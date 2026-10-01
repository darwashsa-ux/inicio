# Darwash · Inicio — contexto para Claude Code

Launcher estático (sin build) del Grupo Darwash (Darwash SA, Pecuaria El Garabí, Bulltrade). Lo usan Leo y sus compañeros. Se usa como:
- Sitio en GitHub Pages: https://darwashsa-ux.github.io/inicio/ (repo darwashsa-ux/inicio, rama main)
- Extensión Chrome MV3 (pestaña nueva) cargada "descomprimida" desde C:\Darwash\darwash-inicio
- PWA en tablet
- `extension-equipo/`: extensión mínima para compañeros; su pestaña nueva redirige a la URL de GitHub Pages (se actualiza sola con cada push).

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
- Secciones con `soloAdmin: true` solo se ven en equipos con localStorage `dw.admin=1` (se activa abriendo la URL con `?admin=1`, se desactiva con `?admin=0`).
- El saludo usa el nombre de cada usuario (localStorage `dw.nombre`), no hay nombre fijo en config.
- Logos en `img/`: logo-white/drw-teal (Darwash), garabi-color/white, bulltrade-color/white.
- Fotos de tarjetas: campo `foto` en cada app de config.js → archivos en `img/cards/` (JPG ~640x270, <60KB; achicar con Pillow antes de commitear). Sin foto, la tarjeta muestra un degradé del color de la sección con el ícono. Los usuarios también pueden subir una foto personal desde Editar (localStorage `dw.fotos`, no se comparte).
- Orden y ocultar secciones: preferencia de cada usuario en localStorage (`dw.secOrden`, `dw.secOcultas`), botones ↑ ↓ 👁 en modo Editar. El orden por defecto es el de config.js.
- Probar abriendo `index.html` en el navegador antes de pushear.

## Publicar
```
git add . ; git commit -m "mensaje" ; git push
```
Después: `chrome://extensions` → ⟳ en la extensión "Grupo Darwash · Inicio" (solo la de Leo, la cargada desde el repo; la de `extension-equipo` no lo necesita).
