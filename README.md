# Darwash · Inicio

Launcher de todas las apps de Darwash. Estático, sin build, cero dependencias externas
(Lucide vendorizado). La misma carpeta sirve como **sitio web**, **extensión de Chrome**
(nueva pestaña) y **PWA** (tablet/celu).

## Archivos
| Archivo | Qué es |
|---|---|
| `config.js` | **La lista de apps.** Lo único que tocás a mano. |
| `index.html` / `app.js` / `styles.css` | El launcher |
| `lucide.min.js` | Íconos (local, no CDN → compatible con extensión) |
| `manifest.json` | Manifest de la extensión Chrome (override de nueva pestaña) |
| `site.webmanifest` | Manifest PWA (instalar en tablet) |

## 1) Deploy en GitHub Pages
```bash
cd darwash-inicio
git init && git add . && git commit -m "Darwash Inicio v1"
gh repo create darwashsa-ux/inicio --public --source=. --push
gh api -X POST repos/darwashsa-ux/inicio/pages -f "source[branch]=main" -f "source[path]=/"
```
Queda en `https://darwashsa-ux.github.io/inicio/`.
(Alternativa: `vercel --prod` en la carpeta, o Cloudflare Pages igual que el tablero DTE.)

## 2) Que sea la página de inicio de Chrome
`chrome://settings/onStartup` → *Abrir una página específica* → pegá la URL.
Para el botón Home: `chrome://settings/appearance` → *Mostrar botón de inicio* → misma URL.

## 3) Que sea la nueva pestaña (Ctrl+T) — sin extensiones de terceros
1. `chrome://extensions` → activá **Modo de desarrollador**
2. **Cargar descomprimida** → elegí la carpeta `darwash-inicio`
3. Abrí una pestaña nueva → te pregunta si querés mantener el cambio → **Mantener**

Abre instantáneo (es local). Si cambiás `config.js`: `git pull` + botón ⟳ en la extensión.

## 4) Tablet / celu
Abrí la URL de Pages en Chrome → menú ⋮ → **Agregar a pantalla principal**. Queda como app.

## Cómo agregar/editar apps
- **Rápido:** botón *Editar* abajo → click en cualquier tile o *+ Agregar* → Guardar.
  Los cambios quedan en ese navegador. Para hacerlos permanentes: *Exportar config.js*,
  reemplazá el del repo y pusheá.
- **Directo:** editá `config.js`. Íconos: cualquier nombre de https://lucide.dev/icons

Nota: la versión extensión y la web guardan sus cambios locales por separado; la fuente de verdad es `config.js`.

## Qué trae
- Panel con foto de hacienda + logo Darwash (cambiá `img/hero.jpg` por cualquier foto vertical)
- **Parte del día**: clima, lluvia de ayer, pronóstico, dólar y **próximo remate** (cargá fechas en `remates` de `config.js`)
- Tipografía Marcellus (serif tipo logo) + Inter, vendorizadas en `fonts/`
- Reloj, fecha y saludo
- Clima Vicuña Mackenna (Open-Meteo): actual, viento, humedad, **lluvia de ayer en mm** y pronóstico 4 días
- Dólar oficial / MEP / blue (dolarapi.com), cache 15 min
- Buscador: tipeás en cualquier lado y filtra; `Enter` abre la primera, `Shift+Enter` busca en Google, pegar una URL la abre
- `Alt+1..9` abre favoritas · `/` foco al buscador · `Esc` limpia
- Favoritas + "Más usadas" automático (cuenta clicks)
- Punto verde/rojo: si tus apps responden (ping no-cors, apps con `ping: true`)
- Tema claro/oscuro/auto, abrir en misma pestaña o nueva
