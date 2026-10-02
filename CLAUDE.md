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
- **Capa personal**: config.js es la base compartida; lo que cada usuario agrega/edita/borra/marca favorito en modo Editar se guarda aparte en localStorage `dw.personal` ({mias, cambios, borradas, favs}) y se aplica encima en `buildCfg()`. Un push NUNCA borra lo personal. No volver a guardar la config entera en localStorage.
- `version` en config.js: subirla igual en cada cambio (la usa el export). `IDS_HISTORICOS` en app.js lista ids que alguna vez estuvieron en config.js: si sacás una app del repo, agregá su id ahí.
- "Exportar config.js" (Leo) = config del repo + sus cambios personales, con version+1 → reemplazar config.js del repo y pushear; después "Restaurar" para limpiar su capa personal.
- Remates: tabla `calendario_remates` (id, fecha, lugar) en el Supabase de Anotaciones Feria. Lectura pública; alta/baja SOLO vía RPC `cal_agregar` / `cal_borrar` con PIN (ver `supabase/calendario_remates.sql`). El PIN se guarda en localStorage (`dw.calpin`). Plazas rápidas en `config.plazas`.
- Secciones con `soloAdmin: true` solo se ven en equipos con localStorage `dw.admin=1` (se activa abriendo la URL con `?admin=1`, se desactiva con `?admin=0`).
- El saludo usa el nombre de cada usuario (localStorage `dw.nombre`), no hay nombre fijo en config.
- Logos en `img/`: logo-white/drw-teal (Darwash), garabi-color/white, bulltrade-color/white.
- Fotos de tarjetas: campo `foto` en cada app de config.js → archivos en `img/cards/` (JPG ~640x270, <60KB; achicar con Pillow antes de commitear). Sin foto, la tarjeta muestra un degradé del color de la sección con el ícono. Los usuarios también pueden subir una foto personal desde Editar (localStorage `dw.fotos`, no se comparte).
- Orden y ocultar secciones: preferencia de cada usuario en localStorage (`dw.secOrden`, `dw.secOcultas`), botones ↑ ↓ 👁 en modo Editar. El orden por defecto es el de config.js.
- Frase del día: `frases.js` (`DW_FRASES` [frase, autor], misma frase para todos por día; `DW_MENSAJES` = avisos según el día: remate hoy/mañana, lluvia ≥5 mm, helada, calor ≥33°, lunes/viernes, cumpleaños de `config.cumples` con fecha "MM-DD"). Solo citas verificadas; si no hay autor seguro, va sin autor ("Grupo Darwash").
- Probar abriendo `index.html` en el navegador antes de pushear.

## Publicar
```
git add . ; git commit -m "mensaje" ; git push
```
Después: `chrome://extensions` → ⟳ en la extensión "Grupo Darwash · Inicio" (solo la de Leo, la cargada desde el repo; la de `extension-equipo` no lo necesita).
