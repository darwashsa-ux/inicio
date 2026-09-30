/* DARWASH · INICIO — lógica del launcher (sin dependencias, compatible con extensión MV3) */
(() => {
  "use strict";

  // ---------- storage seguro ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const K = { cfg: "dw.cfg", prefs: "dw.prefs", uso: "dw.uso", cache: "dw.cache" };

  const clone = o => JSON.parse(JSON.stringify(o));
  const DEFAULT = clone(window.DW_CONFIG || { secciones: [] });
  let cfg = LS.get(K.cfg, null);
  if (!cfg || (cfg.version || 0) < (DEFAULT.version || 0)) cfg = clone(DEFAULT); // config del repo más nueva gana
  let prefs = Object.assign({ newTab: false, theme: "auto" }, LS.get(K.prefs, {}));
  let uso = LS.get(K.uso, {});
  let editing = false;
  const pingState = {};

  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "app-" + Date.now();
  const icons = () => { try { window.lucide && lucide.createIcons(); } catch {} };

  // ---------- perfil: admin (secciones soloAdmin) y nombre por usuario ----------
  try {
    const qs = new URLSearchParams(location.search);
    if (qs.get("admin") === "1") LS.set("dw.admin", "1");
    if (qs.get("admin") === "0") LS.del("dw.admin");
  } catch {}
  const esAdmin = () => LS.get("dw.admin", "") === "1";
  const secciones = () => cfg.secciones.filter(s => !s.soloAdmin || esAdmin());
  const allApps = () => secciones().flatMap(s => s.apps.map(a => ({ ...a, _sec: s })));
  const saveCfg = () => LS.set(K.cfg, cfg);

  // ---------- tema ----------
  function applyTheme() {
    const r = document.documentElement;
    if (prefs.theme === "auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", prefs.theme);
    $("#btnTheme span").textContent = { auto: "Auto", dark: "Oscuro", light: "Claro" }[prefs.theme];
    $("#btnTab span").textContent = prefs.newTab ? "Pestaña nueva" : "Misma pestaña";
  }

  // ---------- reloj ----------
  const fmtHora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  const fmtFecha = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  function tick() {
    const now = new Date();
    $("#clock").textContent = fmtHora.format(now);
    const f = fmtFecha.format(now); $("#date").textContent = f[0].toUpperCase() + f.slice(1);
    const h = now.getHours();
    const saludo = h < 6 ? "Buenas noches" : h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches";
    const dia = now.getDay();
    const extra = dia === 1 ? " · arrancamos la semana" : dia === 5 ? " · último empujón" : "";
    const nombre = LS.get("dw.nombre", "");
    const html = nombre
      ? `${saludo}, <em class="nombre" title="Cambiar nombre">${esc(nombre)}</em>${extra}`
      : `${saludo}${extra} <button class="pedir" type="button">¿cómo te llamás?</button>`;
    if (html !== lastGreet) { $("#greet").innerHTML = html; lastGreet = html; }
  }
  let lastGreet = "";
  $("#greet").addEventListener("click", e => {
    if (!e.target.closest(".nombre, .pedir")) return;
    const n = prompt("¿Cómo te llamás?", LS.get("dw.nombre", ""));
    if (n === null) return;
    n.trim() ? LS.set("dw.nombre", n.trim().slice(0, 30)) : LS.del("dw.nombre");
    tick();
  });

  // ---------- tiles ----------
  function tileHTML(a, n) {
    const has = !!a.url;
    const color = a.color || a._sec?.color || "#008995";
    const tgt = prefs.newTab ? ' target="_blank" rel="noopener"' : "";
    const ico = a.icono ? `<i data-lucide="${esc(a.icono)}"></i>` : `<span class="letter">${esc((a.nombre || "?")[0])}</span>`;
    const st = pingState[a.id];
    const dot = a.ping && has ? `<span class="dot ${st || "wait"}" title="${st === "ok" ? "Responde" : st === "ko" ? "No responde" : "Chequeando…"}"></span>` : "";
    const badge = has ? "" : `<span class="badge">Falta URL</span>`;
    const num = n ? `<kbd class="num">${n}</kbd>` : "";
    return `<a class="tile${has ? "" : " nourl"}" style="--c:${esc(color)}" data-id="${esc(a.id)}" href="${has ? esc(a.url) : "#"}"${has ? tgt : ""}>
      <span class="ico">${ico}</span>
      <span class="txt"><b>${esc(a.nombre)}</b>${a.desc ? `<small>${esc(a.desc)}</small>` : ""}</span>
      ${dot}${badge}${num}
      <span class="tools">
        <button class="tbtn fav${a.fav ? " on" : ""}" data-act="fav" title="Favorita"><i data-lucide="star"></i></button>
        <button class="tbtn" data-act="edit" title="Editar"><i data-lucide="pencil"></i></button>
      </span>
    </a>`;
  }

  function render() {
    const q = norm($("#q").value.trim());
    const out = [];
    const apps = allApps();

    if (q) {
      const res = apps
        .map(a => ({ a, s: score(a, q) }))
        .filter(x => x.s > 0)
        .sort((x, y) => y.s - x.s || (uso[y.a.id] || 0) - (uso[x.a.id] || 0));
      if (res.length) {
        out.push(section({ nombre: "Resultados", icono: "search", color: "#008995" }, res.map(x => x.a), { compact: false, numbered: true }));
      }
      out.push(`<div class="empty">Enter ${res.length ? `abre <b>${esc(res[0]?.a.nombre)}</b>` : `busca <b>“${esc($("#q").value)}”</b> en Google`} · Shift+Enter busca en Google</div>`);
    } else {
      const favs = apps.filter(a => a.fav);
      if (favs.length) out.push(section({ nombre: "Favoritas", icono: "star", color: "#C9A227" }, favs, { compact: true, numbered: true }));
      const top = apps.filter(a => (uso[a.id] || 0) > 0 && !a.fav && a.url)
        .sort((x, y) => uso[y.id] - uso[x.id]).slice(0, 6);
      if (top.length >= 2) out.push(section({ nombre: "Más usadas", icono: "flame", color: "#F97316" }, top, { compact: true }));
      secciones().forEach(s => out.push(section(s, s.apps.map(a => ({ ...a, _sec: s })), { secId: s.id, numbered: out.length === 0 })));
    }
    $("#content").innerHTML = out.join("");
    icons();
  }

  function section(s, list, o = {}) {
    let i = 0;
    const tiles = list.map(a => tileHTML(a, o.numbered && ++i <= 9 ? i : 0)).join("");
    const add = o.secId ? `<button class="tile add-tile" data-add="${esc(o.secId)}"><i data-lucide="plus"></i> Agregar</button>` : "";
    return `<section class="sec">
      <h2 class="sec-h" style="--c:${esc(s.color || "#008995")}">
        <span class="sw"><i data-lucide="${esc(s.icono || "folder")}"></i></span>${esc(s.nombre)}<span class="line"></span>
      </h2>
      <div class="grid${o.compact ? " compact" : ""}">${tiles}${add}</div>
    </section>`;
  }

  function score(a, q) {
    const n = norm(a.nombre), d = norm(a.desc), s = norm(a._sec?.nombre), u = norm(a.url);
    if (n.startsWith(q)) return 100;
    if (n.split(/\s+/).some(w => w.startsWith(q))) return 80;
    if (n.includes(q)) return 60;
    if (d.includes(q)) return 40;
    if (s.includes(q)) return 25;
    if (u.includes(q)) return 15;
    // iniciales: "td" -> Tablero DTE
    const ini = n.split(/\s+/).map(w => w[0]).join("");
    if (ini.startsWith(q)) return 50;
    return 0;
  }

  // ---------- navegación ----------
  function registrarUso(id) { uso[id] = (uso[id] || 0) + 1; LS.set(K.uso, uso); }
  function abrir(a, nueva) {
    if (!a?.url) return editar(a);
    registrarUso(a.id);
    if (nueva || prefs.newTab) window.open(a.url, "_blank", "noopener"); else location.href = a.url;
  }
  const findApp = id => allApps().find(a => a.id === id);

  $("#content").addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { e.preventDefault(); return editar(null, add.dataset.add); }
    const t = e.target.closest(".tile[data-id]");
    if (!t) return;
    const a = findApp(t.dataset.id);
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "fav") { e.preventDefault(); toggleFav(a.id); return; }
    if (act === "edit" || editing || !a.url) { e.preventDefault(); return editar(a); }
    registrarUso(a.id); // deja que el <a> navegue (respeta Ctrl/click medio)
  });
  $("#content").addEventListener("auxclick", e => {
    const t = e.target.closest(".tile[data-id]"); if (t && e.button === 1) registrarUso(t.dataset.id);
  });

  // ---------- búsqueda y teclado ----------
  const q = $("#q");
  q.addEventListener("input", render);
  q.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const txt = q.value.trim(); if (!txt) return;
      if (/^https?:\/\//i.test(txt) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(txt)) {
        location.href = /^https?:/i.test(txt) ? txt : "https://" + txt; return;
      }
      const first = $("#content .tile[data-id]");
      if (first && !e.shiftKey) return abrir(findApp(first.dataset.id), e.ctrlKey || e.metaKey);
      const g = "https://www.google.com/search?q=" + encodeURIComponent(txt);
      (e.ctrlKey || e.metaKey) ? window.open(g, "_blank", "noopener") : (location.href = g);
    }
    if (e.key === "Escape") { q.value = ""; render(); }
    if (e.key === "ArrowDown") { e.preventDefault(); $("#content .tile[data-id]")?.focus(); }
  });
  document.addEventListener("keydown", e => {
    if ($("#dlg").open || $("#dlgCal").open) return;
    const typing = document.activeElement?.tagName === "INPUT";
    if (e.key === "/" && !typing) { e.preventDefault(); q.focus(); q.select(); }
    if (e.altKey && /^[1-9]$/.test(e.key)) {
      const tiles = [...document.querySelectorAll("#content .sec:first-child .tile[data-id]")];
      const t = tiles[+e.key - 1]; if (t) { e.preventDefault(); abrir(findApp(t.dataset.id), e.shiftKey); }
    }
    if (!typing && e.key.length === 1 && /[a-z0-9]/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      q.focus(); // empezar a tipear = buscar
    }
  });

  // ---------- ping de estado ----------
  async function ping(a) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 6000);
    try {
      await fetch(a.url, { mode: "no-cors", cache: "no-store", signal: ctl.signal });
      pingState[a.id] = "ok";
    } catch { pingState[a.id] = "ko"; }
    clearTimeout(to);
    document.querySelectorAll(`.tile[data-id="${CSS.escape(a.id)}"] .dot`).forEach(d => {
      d.className = "dot " + pingState[a.id];
      d.title = pingState[a.id] === "ok" ? "Responde" : "No responde";
    });
  }
  const pingAll = () => allApps().filter(a => a.ping && a.url).forEach(ping);

  // ---------- clima (Open-Meteo, sin key) ----------
  const WMO = c =>
    c === 0 ? ["Despejado", "sun"] : c <= 2 ? ["Algo nublado", "cloud-sun"] : c === 3 ? ["Nublado", "cloud"] :
    c <= 48 ? ["Niebla", "cloud-fog"] : c <= 57 ? ["Llovizna", "cloud-drizzle"] : c <= 67 ? ["Lluvia", "cloud-rain"] :
    c <= 77 ? ["Nieve", "snowflake"] : c <= 82 ? ["Chaparrones", "cloud-rain-wind"] : ["Tormenta", "cloud-lightning"];
  const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  async function cached(key, ttlMin, fn) {
    const c = LS.get(K.cache, {});
    if (c[key] && Date.now() - c[key].t < ttlMin * 60000) return c[key].v;
    const v = await fn(); c[key] = { t: Date.now(), v }; LS.set(K.cache, c); return v;
  }

  async function clima() {
    const u = cfg.ubicacion; if (!u) return;
    try {
      const d = await cached("clima", 20, async () => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${u.lat}&longitude=${u.lon}` +
          `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
          `&past_days=1&forecast_days=4&timezone=America%2FArgentina%2FCordoba`;
        const r = await fetch(url); if (!r.ok) throw 0; return r.json();
      });
      const c = d.current, [txt, ic] = WMO(c.weather_code);
      $("#weatherChip").innerHTML = `<i data-lucide="${ic}"></i><span class="big">${Math.round(c.temperature_2m)}°</span><small>${txt}</small>
        <span class="sep"></span><i data-lucide="wind"></i><small>${Math.round(c.wind_speed_10m)} km/h</small>
        <span class="sep"></span><i data-lucide="droplets"></i><small>${c.relative_humidity_2m}%</small>`;
      $("#weatherChip").title = `${u.nombre} · ráfagas ${Math.round(c.wind_gusts_10m)} km/h`;

      const dd = d.daily; const cells = [];
      const ayer = dd.precipitation_sum[0];
      cells.push(`<div class="fc ayer" title="Lluvia acumulada ayer"><i data-lucide="cloud-rain"></i>Ayer<b class="rain">${ayer.toFixed(1)} mm</b></div>`);
      for (let i = 1; i < dd.time.length; i++) {
        const dt = new Date(dd.time[i] + "T12:00:00");
        const [, ic2] = WMO(dd.weather_code[i]);
        const lab = i === 1 ? "Hoy" : DIAS[dt.getDay()];
        const mm = dd.precipitation_sum[i], pp = dd.precipitation_probability_max[i];
        cells.push(`<div class="fc" title="Prob. lluvia ${pp ?? "-"}%">${lab}<i data-lucide="${ic2}"></i>
          <span><b>${Math.round(dd.temperature_2m_max[i])}°</b> ${Math.round(dd.temperature_2m_min[i])}°</span>
          ${mm > 0.2 ? `<span class="rain">${mm.toFixed(0)} mm</span>` : `<span>${pp ?? 0}%</span>`}</div>`);
      }
      $("#forecast").innerHTML = cells.join("");
      icons();
    } catch { $("#weatherChip").innerHTML = `<i data-lucide="cloud-off"></i><small>Sin clima</small>`; icons(); }
  }

  // ---------- dólar (dolarapi.com) ----------
  async function dolar() {
    try {
      const arr = await cached("dolar", 15, async () => {
        const r = await fetch("https://dolarapi.com/v1/dolares"); if (!r.ok) throw 0; return r.json();
      });
      const pick = c => arr.find(x => x.casa === c);
      const f = n => n == null ? "—" : "$" + Math.round(n).toLocaleString("es-AR");
      const of = pick("oficial"), mep = pick("bolsa"), bl = pick("blue");
      $("#dolarChip").innerHTML = `<i data-lucide="dollar-sign"></i>
        <small>Oficial</small><b>${f(of?.venta)}</b><span class="sep"></span>
        <small>MEP</small><b>${f(mep?.venta)}</b><span class="sep"></span>
        <small>Blue</small><b>${f(bl?.venta)}</b>`;
      const upd = of?.fechaActualizacion ? new Date(of.fechaActualizacion) : null;
      $("#dolarChip").title = "Venta · " + (upd ? "act. " + upd.toLocaleString("es-AR") : "");
      icons();
    } catch { $("#dolarChip").innerHTML = `<i data-lucide="dollar-sign"></i><small>Sin cotización</small>`; icons(); }
  }

  // ---------- edición ----------
  const dlg = $("#dlg"), frm = $("#frm");
  let editId = null;

  function editar(a, secId) {
    editId = a?.id || null;
    $("#dlgTitle").textContent = a ? "Editar app" : "Nueva app";
    $("#secList").innerHTML = cfg.secciones.map(s => `<option value="${esc(s.nombre)}">`).join("");
    const sec = a ? cfg.secciones.find(s => s.apps.some(x => x.id === a.id)) : cfg.secciones.find(s => s.id === secId);
    frm.nombre.value = a?.nombre || ""; frm.url.value = a?.url || ""; frm.desc.value = a?.desc || "";
    frm.icono.value = a?.icono || ""; frm.seccion.value = sec?.nombre || cfg.secciones[0]?.nombre || "";
    frm.fav.checked = !!a?.fav; frm.ping.checked = a ? !!a.ping : true;
    $("#btnDelete").hidden = !a;
    previewIcon(); dlg.showModal(); frm.nombre.focus();
  }
  function previewIcon() {
    $("#iconPreview").innerHTML = frm.icono.value ? `<i data-lucide="${esc(frm.icono.value.trim())}"></i>` : "";
    icons();
  }
  frm.icono.addEventListener("input", previewIcon);
  $("#btnCancel").addEventListener("click", () => dlg.close());
  $("#btnDelete").addEventListener("click", () => {
    cfg.secciones.forEach(s => s.apps = s.apps.filter(x => x.id !== editId));
    saveCfg(); dlg.close(); render();
  });
  frm.addEventListener("submit", e => {
    e.preventDefault();
    const data = {
      id: editId || slug(frm.nombre.value), nombre: frm.nombre.value.trim(), desc: frm.desc.value.trim(),
      url: frm.url.value.trim(), icono: frm.icono.value.trim(), ping: frm.ping.checked, fav: frm.fav.checked
    };
    if (!data.fav) delete data.fav;
    const secName = frm.seccion.value.trim();
    let sec = cfg.secciones.find(s => norm(s.nombre) === norm(secName));
    if (!sec) { sec = { id: slug(secName), nombre: secName, icono: "folder", color: "#64748B", apps: [] }; cfg.secciones.push(sec); }
    const prev = cfg.secciones.find(s => s.apps.some(x => x.id === editId));
    if (prev && prev !== sec) prev.apps = prev.apps.filter(x => x.id !== editId);
    const idx = sec.apps.findIndex(x => x.id === data.id);
    if (idx >= 0) sec.apps[idx] = { ...sec.apps[idx], ...data }; else sec.apps.push(data);
    cfg.secciones = cfg.secciones.filter(s => s.apps.length);
    saveCfg(); dlg.close(); render();
    if (data.ping && data.url) ping(data);
  });

  function toggleFav(id) {
    cfg.secciones.forEach(s => s.apps.forEach(a => { if (a.id === id) a.fav = !a.fav || undefined; }));
    saveCfg(); render();
  }

  $("#btnEdit").addEventListener("click", () => {
    editing = !editing;
    document.body.classList.toggle("editing", editing);
    $("#btnEdit").classList.toggle("active", editing);
    $("#btnEdit span").textContent = editing ? "Listo" : "Editar";
    $("#editActions").hidden = !editing;
  });
  $("#btnTheme").addEventListener("click", () => {
    prefs.theme = { auto: "dark", dark: "light", light: "auto" }[prefs.theme]; LS.set(K.prefs, prefs); applyTheme();
  });
  $("#btnTab").addEventListener("click", () => { prefs.newTab = !prefs.newTab; LS.set(K.prefs, prefs); applyTheme(); render(); });

  $("#btnExport").addEventListener("click", () => {
    const body = "// Exportado desde Darwash · Inicio — " + new Date().toLocaleString("es-AR") +
      "\nwindow.DW_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
    const aEl = document.createElement("a");
    aEl.href = URL.createObjectURL(new Blob([body], { type: "text/javascript" }));
    aEl.download = "config.js"; aEl.click(); setTimeout(() => URL.revokeObjectURL(aEl.href), 2000);
  });
  $("#fileImport").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const txt = await f.text();
      const json = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
      if (!Array.isArray(json.secciones)) throw 0;
      cfg = json; saveCfg(); render(); pingAll();
    } catch { alert("Archivo inválido: tiene que ser un config.js exportado o un JSON con 'secciones'."); }
    e.target.value = "";
  });
  $("#btnReset").addEventListener("click", () => {
    if (!confirm("¿Volver a la config del repo (config.js)? Se pierden los cambios locales.")) return;
    LS.del(K.cfg); cfg = clone(DEFAULT); render(); pingAll();
  });

  // ---------- calendario de remates ----------
  // Tabla calendario_remates (Supabase): lectura pública, alta/baja por RPC con PIN.
  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const MESES_L = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const DIAS_L = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const toD = f => new Date(f + "T00:00:00");
  const PLAZA_COLORES = ["#C9A227", "#4FB3BA", "#D08A5B", "#9DB06A", "#B99AD6", "#E0B872"];
  const colorPlaza = p => { let h = 0; for (const c of norm(p)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PLAZA_COLORES[h % PLAZA_COLORES.length]; };
  const K_PIN = "dw.calpin";
  let remLista = [];      // [{id, fecha, lugar, d}]
  let remError = false;

  const sbHeaders = f => ({ apikey: f.key, Authorization: "Bearer " + f.key, "Content-Type": "application/json" });
  async function sbCargar() {
    const f = cfg.remateFuente; if (!f?.url) return [];
    const desde = new Date(); desde.setMonth(desde.getMonth() - 3);
    const r = await fetch(`${f.url}/rest/v1/calendario_remates?select=id,fecha,lugar&fecha=gte.${ymd(desde)}&order=fecha.asc&limit=1000`, { headers: sbHeaders(f) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }
  async function sbRpc(fn, body) {
    const f = cfg.remateFuente;
    const r = await fetch(`${f.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: sbHeaders(f), body: JSON.stringify(body) });
    if (!r.ok) { let m = "Error " + r.status; try { m = (await r.json()).message || m; } catch {} throw new Error(m); }
  }

  async function remates(forzar) {
    try {
      if (forzar) { const c = LS.get(K.cache, {}); delete c.remates2; LS.set(K.cache, c); }
      const remoto = await cached("remates2", 10, sbCargar);
      remError = false;
      remLista = remoto.map(x => ({ id: x.id, fecha: String(x.fecha).slice(0, 10), lugar: x.lugar }));
    } catch { remError = true; }
    const manual = (cfg.remates || []).map(r => ({ id: null, fecha: r.fecha, lugar: r.lugar || r.nombre || "Remate" }));
    remLista = [...remLista, ...manual].map(r => ({ ...r, d: toD(r.fecha) })).filter(r => !isNaN(r.d)).sort((a, b) => a.d - b.d);
    pintarTira();
    if ($("#dlgCal").open) pintarCal();
  }

  function pintarTira() {
    const cal = $("#calRemates");
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const lim = new Date(hoy); lim.setDate(lim.getDate() + 30);
    const futuros = remLista.filter(r => r.d >= hoy);
    const prox30 = futuros.filter(r => r.d <= lim).length;
    const corto = n => n === 0 ? "HOY" : n === 1 ? "mañana" : `en ${n} d`;
    const cells = futuros.slice(0, 5).map((r, i) => {
      const n = Math.round((r.d - hoy) / 86400000);
      return `<button class="rc${n === 0 ? " hoy" : i === 0 ? " prox" : ""}" data-fecha="${r.fecha}" style="--pc:${colorPlaza(r.lugar)}" title="${esc(r.lugar)}">
        <span class="rc-dia">${DIAS_L[r.d.getDay()].slice(0, 3)}</span>
        <b class="rc-fecha">${r.d.getDate()} ${MESES[r.d.getMonth()]}</b>
        <span class="rc-lug">${esc(r.lugar)}</span>
        <span class="rc-cuando">${corto(n)}</span>
      </button>`;
    });
    const vacio = `<button class="rc-vacio" data-fecha="">${remError ? "No pude leer el calendario" : "Sin remates próximos"} · <b>+ agregar</b></button>`;
    cal.innerHTML = `
      <div class="parte-h"><span>Remates</span><small>${prox30} en 30 días · <button class="linkbtn" data-fecha="">+ calendario</button></small></div>
      <div class="cal-grid">${cells.length ? cells.join("") : vacio}</div>`;
    cal.hidden = false;
    icons();
  }

  // ----- modal calendario -----
  const dlgCal = $("#dlgCal");
  let calMes = new Date(); calMes.setDate(1); calMes.setHours(0, 0, 0, 0);
  let calSel = ymd(new Date());

  function abrirCal(fecha) {
    if (fecha) { calSel = fecha; const d = toD(fecha); calMes = new Date(d.getFullYear(), d.getMonth(), 1); }
    pintarCal(); dlgCal.showModal();
    setTimeout(() => $("#calLugar")?.focus(), 30);
  }

  function pintarCal() {
    const hoyS = ymd(new Date());
    const y = calMes.getFullYear(), m = calMes.getMonth();
    const primero = new Date(y, m, 1), offset = (primero.getDay() + 6) % 7; // lunes primero
    const diasMes = new Date(y, m + 1, 0).getDate();
    const porDia = {};
    remLista.forEach(r => (porDia[r.fecha] = porDia[r.fecha] || []).push(r));
    let celdas = "";
    for (let i = 0; i < offset; i++) celdas += `<span class="cd vacia"></span>`;
    for (let dd = 1; dd <= diasMes; dd++) {
      const f = ymd(new Date(y, m, dd)), rs = porDia[f] || [];
      const cls = ["cd", f === hoyS ? "hoy" : "", f === calSel ? "sel" : "", f < hoyS ? "pasado" : "", rs.length ? "tiene" : ""].join(" ");
      celdas += `<button type="button" class="${cls}" data-f="${f}"><span class="cd-n">${dd}</span>
        ${rs.slice(0, 2).map(r => `<span class="cd-p" style="--pc:${colorPlaza(r.lugar)}">${esc(r.lugar)}</span>`).join("")}
        ${rs.length > 2 ? `<span class="cd-mas">+${rs.length - 2}</span>` : ""}</button>`;
    }
    const sd = toD(calSel), delDia = porDia[calSel] || [];
    const pin = LS.get(K_PIN, "");
    const lugares = [...new Set([...(cfg.plazas || []), ...remLista.map(r => r.lugar)])];
    $("#calBody").innerHTML = `
      <div class="cal-top">
        <h3>Calendario de remates</h3>
        <div class="cal-nav">
          <button type="button" class="tbtn" data-nav="-1" title="Mes anterior"><i data-lucide="chevron-left"></i></button>
          <b>${MESES_L[m]} ${y}</b>
          <button type="button" class="tbtn" data-nav="1" title="Mes siguiente"><i data-lucide="chevron-right"></i></button>
          <button type="button" class="btn ghost sm" data-nav="0">Hoy</button>
        </div>
        <button type="button" class="tbtn" data-cerrar title="Cerrar"><i data-lucide="x"></i></button>
      </div>
      <div class="cal-wrap">
        <div class="cal-mes">
          ${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => `<span class="cd-h">${d}</span>`).join("")}
          ${celdas}
        </div>
        <div class="cal-dia">
          <div class="cal-dia-t">${DIAS_L[sd.getDay()]} ${sd.getDate()} de ${MESES_L[sd.getMonth()].toLowerCase()}</div>
          <div class="cal-dia-l">
            ${delDia.length ? delDia.map(r => `<div class="cal-it" style="--pc:${colorPlaza(r.lugar)}"><i class="pdot"></i><span>${esc(r.lugar)}</span>
              ${r.id ? `<button type="button" class="tbtn" data-borrar="${r.id}" title="Borrar"><i data-lucide="trash-2"></i></button>` : `<small>config.js</small>`}</div>`).join("")
              : `<div class="cal-nada">Sin remates este día</div>`}
          </div>
          <form id="calForm" class="cal-form" autocomplete="off">
            <label>Lugar<input id="calLugar" list="calLugares" placeholder="Ej: Washington" maxlength="60" required></label>
            <datalist id="calLugares">${lugares.map(l => `<option value="${esc(l)}">`).join("")}</datalist>
            <div class="chips">${(cfg.plazas || []).map(p => `<button type="button" class="chip-p" style="--pc:${colorPlaza(p)}" data-plaza="${esc(p)}">${esc(p)}</button>`).join("")}</div>
            ${pin ? "" : `<label>PIN del calendario<input id="calPin" type="password" inputmode="numeric" placeholder="Se pide una sola vez" required></label>`}
            <button type="submit" class="btn primary"><i data-lucide="plus"></i><span>Agregar remate</span></button>
            <div class="cal-msg" id="calMsg"></div>
            ${pin ? `<button type="button" class="linkbtn mut" data-olvidar>Olvidar PIN en este equipo</button>` : ""}
          </form>
        </div>
      </div>`;
    icons();
  }

  const msg = (t, ok) => { const el = $("#calMsg"); if (el) { el.textContent = t; el.className = "cal-msg" + (ok ? " ok" : " err"); } };

  dlgCal.addEventListener("click", async e => {
    if (e.target === dlgCal) return dlgCal.close(); // click en el fondo
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.f) { calSel = t.dataset.f; pintarCal(); $("#calLugar")?.focus(); return; }
    if (t.dataset.nav) {
      const n = +t.dataset.nav;
      if (n === 0) { calMes = new Date(); calMes.setDate(1); calSel = ymd(new Date()); } else calMes = new Date(calMes.getFullYear(), calMes.getMonth() + n, 1);
      pintarCal(); return;
    }
    if ("cerrar" in t.dataset) return dlgCal.close();
    if (t.dataset.plaza) { $("#calLugar").value = t.dataset.plaza; $("#calForm").requestSubmit(); return; }
    if ("olvidar" in t.dataset) { LS.del(K_PIN); pintarCal(); return; }
    if (t.dataset.borrar) {
      const pin = LS.get(K_PIN, ""); if (!pin) return msg("Cargá el PIN primero (agregando un remate).");
      t.disabled = true;
      try { await sbRpc("cal_borrar", { p_id: +t.dataset.borrar, p_pin: pin }); await remates(true); }
      catch (err) { t.disabled = false; msg(err.message); if (/pin/i.test(err.message)) { LS.del(K_PIN); } }
    }
  });
  dlgCal.addEventListener("submit", async e => {
    e.preventDefault();
    const lugar = $("#calLugar").value.trim(); if (!lugar) return;
    const pin = LS.get(K_PIN, "") || $("#calPin")?.value.trim();
    if (!pin) return msg("Falta el PIN");
    const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      await sbRpc("cal_agregar", { p_fecha: calSel, p_lugar: lugar, p_pin: pin });
      LS.set(K_PIN, pin);
      await remates(true);
      msg(`Agregado: ${lugar}`, true);
    } catch (err) {
      btn.disabled = false;
      if (/pin/i.test(err.message)) LS.del(K_PIN);
      msg(err.message.includes("Failed to fetch") ? "Sin conexión con la base" : err.message);
    }
  });

  $("#calRemates").addEventListener("click", e => {
    const t = e.target.closest("[data-fecha]"); if (!t) return;
    abrirCal(t.dataset.fecha || null);
  });

  // ---------- init ----------
  $("#lugar").textContent = cfg.ubicacion?.nombre || "";
  remates();
  applyTheme(); tick(); render();
  setInterval(tick, 1000);
  clima(); dolar(); pingAll();
  setInterval(() => { clima(); dolar(); remates(); }, 15 * 60000);
  setTimeout(() => q.focus({ preventScroll: true }), 50);
})();
