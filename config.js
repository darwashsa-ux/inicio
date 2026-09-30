// ============================================================
//  DARWASH · INICIO — configuración de apps
//  Editá este archivo (o usá el modo edición del launcher y
//  después "Exportar config.js") y hacé push. Listo.
//
//  icono: cualquier nombre de https://lucide.dev/icons (kebab-case)
//  ping:  true = chequea si la app responde (punto verde/rojo)
//  url:   "" = queda marcada como "falta URL"
// ============================================================
window.DW_CONFIG = {
  version: 3, // subilo cuando cambies este archivo: pisa los cambios locales hechos con "Editar"
  empresa: "Darwash SA",
  usuario: "Leo",
  ubicacion: { nombre: "Vicuña Mackenna", lat: -34.415, lon: -64.389 },
  // Próximos remates: aparece "Próximo remate en X días" en el parte del día.
  // Ej: { fecha: "2026-10-08", lugar: "Vicuña Mackenna", tipo: "Invernada" }
  remates: [],
  secciones: [
    {
      id: "sistemas",
      nombre: "Sistemas Darwash",
      icono: "layout-grid",
      color: "#008995",
      apps: [
        { id: "operaciones", nombre: "Darwash Operaciones", desc: "Consignación, remates y feedlot", url: "https://darwash-operaciones.vercel.app/", icono: "handshake", ping: true },
        { id: "remates-app", nombre: "Remates Darwash", desc: "App operativa de remate de hacienda", url: "https://remates-app-three.vercel.app/", icono: "gavel", ping: true },
        { id: "anotaciones-admin", nombre: "Anotaciones Feria", desc: "Admin · remates, comisionistas y links de carga", url: "https://darwashsa-ux.github.io/darwash-anotaciones/admin.html", icono: "notebook-pen", ping: true },
        { id: "tablero-dte", nombre: "Tablero DTE", desc: "SIGSA · por remate y por consignataria", url: "https://darwashsa-ux.github.io/darwash-dte/", icono: "truck", ping: true },
        { id: "boletin-remate", nombre: "Boletín de Remate", desc: "Catálogo mobile para compradores", url: "https://darwashsa-ux.github.io/remate/", icono: "book-open", ping: true }
      ]
    },
    {
      id: "mercados",
      nombre: "Mercados y Clima",
      icono: "trending-up",
      color: "#A8741A",
      apps: [
        { id: "mag", nombre: "Mercado Agroganadero", desc: "Precios Cañuelas (MAG)", url: "https://www.mercadoagroganadero.com.ar", icono: "beef" },
        { id: "rosgan", nombre: "Rosgan", desc: "Remates televisados e invernada", url: "https://www.rosgan.com.ar", icono: "tv" },
        { id: "ipcva", nombre: "IPCVA", desc: "Precios, faena y exportación", url: "https://www.ipcva.com.ar", icono: "bar-chart-3" },
        { id: "bcr", nombre: "Bolsa de Rosario", desc: "Pizarra de granos · maíz", url: "https://www.bcr.com.ar", icono: "wheat" },
        { id: "a3", nombre: "A3 Mercados", desc: "Futuros agro (ex Matba Rofex)", url: "https://a3mercados.com.ar/info-de-mercado/visor-de-precios", icono: "candlestick-chart" },
        { id: "windy", nombre: "Radar de lluvia", desc: "Windy · zona Vicuña Mackenna", url: "https://www.windy.com/-34.415/-64.389?radar,-34.415,-64.389,8", icono: "cloud-rain-wind" },
        { id: "smn", nombre: "Alertas SMN", desc: "Servicio Meteorológico Nacional", url: "https://www.smn.gob.ar/alertas", icono: "triangle-alert" }
      ]
    },
    {
      id: "organismos",
      nombre: "Organismos y Banco",
      icono: "landmark",
      color: "#8A4B2A",
      apps: [
        { id: "sigsa", nombre: "SIGSA", desc: "SENASA · DTE y RENSPA", url: "https://aps2.senasa.gov.ar/sigsa/home.seam", icono: "shield-check" },
        { id: "mi-senasa", nombre: "Mi SENASA", desc: "Trámites y servicios en línea", url: "https://www.argentina.gob.ar/senasa/mi-senasa", icono: "stethoscope" },
        { id: "arca", nombre: "ARCA", desc: "Clave fiscal", url: "https://auth.afip.gob.ar/contribuyente_/login.xhtml", icono: "landmark" },
        { id: "galicia", nombre: "Galicia Office", desc: "Banca empresas · eCheq y transferencias", url: "https://www.galicia.ar/empresas", icono: "banknote" }
      ]
    },
    {
      id: "datos",
      nombre: "Datos e Infraestructura",
      icono: "database",
      color: "#1F4E5F",
      apps: [
        { id: "supabase", nombre: "Supabase", desc: "Base de datos", url: "https://supabase.com/dashboard/projects", icono: "database" },
        { id: "vercel", nombre: "Vercel", desc: "Deploys", url: "https://vercel.com/dashboard", icono: "triangle" },
        { id: "cloudflare", nombre: "Cloudflare", desc: "Pages y DNS", url: "https://dash.cloudflare.com", icono: "cloud" },
        { id: "github", nombre: "GitHub", desc: "darwashsa-ux", url: "https://github.com/darwashsa-ux", icono: "github" },
        { id: "make", nombre: "Make", desc: "Automatizaciones", url: "https://www.make.com/en/login", icono: "workflow" },
        { id: "looker", nombre: "Looker Studio", desc: "Reportes", url: "https://lookerstudio.google.com", icono: "pie-chart" }
      ]
    },
    {
      id: "oficina",
      nombre: "Oficina",
      icono: "briefcase",
      color: "#5E6B3A",
      apps: [
        { id: "gmail", nombre: "Gmail", desc: "", url: "https://mail.google.com", icono: "mail" },
        { id: "whatsapp", nombre: "WhatsApp Web", desc: "Grupos de pesadas y feria", url: "https://web.whatsapp.com", icono: "message-circle" },
        { id: "drive", nombre: "Drive", desc: "", url: "https://drive.google.com", icono: "hard-drive" },
        { id: "sheets", nombre: "Sheets", desc: "", url: "https://docs.google.com/spreadsheets", icono: "sheet" },
        { id: "calendar", nombre: "Calendar", desc: "", url: "https://calendar.google.com", icono: "calendar" }
      ]
    },
    {
      id: "desarrollo",
      nombre: "En desarrollo",
      icono: "hammer",
      color: "#7A7266",
      apps: [
        { id: "control-dte-physis", nombre: "Control DTE ↔ Physis", desc: "Pendientes de liquidar", url: "", icono: "git-compare-arrows", ping: true },
        { id: "mapa-corrales", nombre: "Mapa de Corrales", desc: "153 corrales · Feria Washington", url: "", icono: "map", ping: true },
        { id: "feria-en-vivo", nombre: "Feria en Vivo", desc: "Seguimiento del remate", url: "", icono: "radio", ping: true },
        { id: "revision-gastos", nombre: "Revisión de Gastos", desc: "Cierre de gestión", url: "", icono: "receipt", ping: true },
        { id: "pesadas", nombre: "Pesadas Balanza", desc: "Tickets báscula pública", url: "", icono: "scale", ping: true },
        { id: "field-ops", nombre: "Field Ops", desc: "AppSheet · gastos de campo", url: "", icono: "tractor" }
      ]
    }
  ]
};
