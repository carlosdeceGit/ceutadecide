import { BLOQUES, PREGUNTAS, POR_ID, errores, opcionesBarrio, BARRIOS } from "./preguntas.js";
import { agregar, MINIMO } from "./agregar.js";

/* ==================================================================
   CONFIG · lo que hay que rellenar antes de abrir
   ================================================================== */
const CONFIG = {
  promotor: "[pendiente: entidad que promueve la consulta]",
  correo: "",                 // correo de contacto
  canalWhatsApp: "",          // enlace del canal de WhatsApp de avisos
  objetivo: 2000,
  contadorDesde: 500,         // el contador solo se enseña a partir de esta cifra
  minutos: 7
};
/* ================================================================== */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const es = n => Number(n).toLocaleString("es-ES");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const guardar = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const leer = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };

const PREVIEW = !!document.querySelector('meta[name="cd-preview"]');
const URL_PUBLICA = PREVIEW ? "https://ceutadecide.es" : location.origin;
let estado = leer("cd_borrador") || { r: {}, paso: 0, inicio: null };
let numerada = 0;
const NUM = Object.fromEntries(PREGUNTAS.map(p => [p.id, ++numerada]));

/* ---------------- arranque ---------------- */
function textosFijos() {
  $$("[data-promotor]").forEach(e => { e.textContent = CONFIG.promotor; });
  $$("[data-correo]").forEach(e => {
    if (CONFIG.correo) { e.textContent = CONFIG.correo; e.href = "mailto:" + CONFIG.correo; }
    else e.textContent = "[pendiente]";
  });
  $$("[data-n-preguntas]").forEach(e => { e.textContent = PREGUNTAS.length; });
  $$("[data-enlace]").forEach(e => { e.textContent = URL_PUBLICA.replace(/^https?:\/\//, ""); });
  const msg = `Ceuta decide. Una consulta anónima sobre cómo hemos pasado estos meses y lo que necesita cada barrio. Sin nombre ni teléfono, unos ${CONFIG.minutos} minutos: ${URL_PUBLICA}`;
  $$("[data-wa]").forEach(a => { a.href = "https://wa.me/?text=" + encodeURIComponent(msg); });
  $$("[data-copiar]").forEach(b => b.addEventListener("click", () => {
    const avisar = t => { b.textContent = t; setTimeout(() => { b.textContent = "Copiar enlace"; }, 2200); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(URL_PUBLICA).then(() => avisar("Copiado"), () => avisar("Selecciónalo y copia"));
    else avisar("Selecciónalo y copia");
  }));
  if (CONFIG.canalWhatsApp) { $("#canal").href = CONFIG.canalWhatsApp; $("#canal-wrap").hidden = false; }
  $("#f-linea").textContent = `Objetivo: ${es(CONFIG.objetivo)} vecinos de Ceuta · unos ${CONFIG.minutos} minutos`;
}

$("#arranque").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#palabra").value.trim();
  if (v) { estado.r.p1 = v; guardarBorrador(); }
  location.hash = "#consulta";
});

/* ---------------- vistas ---------------- */
function mostrar() {
  const h = location.hash.replace("#", "") || "inicio";
  let [vista, sub] = h.split("/");
  if (vista === "ejemplo") { vista = "resultados"; sub = "ejemplo"; }
  const valida = ["inicio", "consulta", "gracias", "resultados", "metodo"].includes(vista) ? vista : "inicio";
  $$(".vista").forEach(v => { v.hidden = v.dataset.vista !== valida; });
  if (valida === "consulta") pintarPaso();
  if (valida === "resultados") cargarResultados(sub === "ejemplo" || PREVIEW);
  if (h !== "inicio" || document.activeElement === document.body) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", mostrar);

/* ---------------- borrador ---------------- */
function guardarBorrador() { guardar("cd_borrador", estado); }

/* ---------------- cuestionario ---------------- */
const TOTAL_PASOS = BLOQUES.length; // paso 0 = filtro de entrada

function pintarPaso() {
  const cont = $("#paso");
  $("#error-general").hidden = true;
  const enviado = leer("cd_enviado");
  if (enviado && !estado.otraPersona) {
    $("#progreso").style.width = "100%";
    $("#paso-de").textContent = "";
    cont.innerHTML = `<div class="filtro"><h2 class="bloque-titulo">Ya has participado desde aquí</h2>
      <p class="bloque-intro">Tu respuesta está guardada. Si otra persona de tu casa quiere contestar desde este mismo dispositivo, puede hacerlo.</p></div>`;
    $("#atras").hidden = true;
    $("#siguiente").textContent = "Otra persona de casa quiere contestar";
    $("#siguiente").onclick = () => { estado = { r: {}, paso: 0, inicio: null, otraPersona: true }; guardarBorrador(); pintarPaso(); };
    return;
  }
  $("#siguiente").onclick = null;
  const paso = Math.min(estado.paso || 0, TOTAL_PASOS);
  $("#progreso").style.width = `${Math.round(paso / (TOTAL_PASOS + 1) * 100)}%`;
  $("#atras").hidden = paso === 0;

  if (paso === 0) {
    $("#paso-de").textContent = "Antes de empezar";
    cont.innerHTML = `<div class="filtro">
      <h2 class="bloque-titulo">Antes de empezar</h2>
      <ul>
        <li>Son ${PREGUNTAS.length} preguntas, unos ${CONFIG.minutos} minutos.</li>
        <li>No te pedimos nombre, teléfono ni correo. No guardamos tu IP.</li>
        <li>Puedes dejarlo a medias y seguir luego desde este mismo móvil.</li>
      </ul>
      <label class="op" id="q-filtro"><input type="checkbox" id="filtro" ${estado.filtro ? "checked" : ""}><span class="marca-op"></span>
        Vivo en Ceuta y tengo 18 años o más</label>
      <p class="msg-error" id="filtro-error" hidden>Esta consulta es solo para mayores de edad que viven en Ceuta.</p>
    </div>`;
    $("#filtro").addEventListener("change", e => { estado.filtro = e.target.checked; guardarBorrador(); $("#filtro-error").hidden = true; });
    $("#siguiente").textContent = "Empezar";
    return;
  }

  const b = BLOQUES[paso - 1];
  $("#paso-de").textContent = `Parte ${paso} de ${TOTAL_PASOS}`;
  $("#siguiente").textContent = paso === TOTAL_PASOS ? "Enviar mis respuestas" : "Siguiente";
  cont.innerHTML = `<h2 class="bloque-titulo">${esc(b.titulo)}</h2>` +
    (b.intro ? `<p class="bloque-intro">${esc(b.intro)}</p>` : "") +
    b.preguntas.map(htmlPregunta).join("");
  b.preguntas.forEach(p => conectar(p));
  actualizarCondicionales();
}

function cab(p, comoLegend = true) {
  const t = `<span class="num">${NUM[p.id]}.</span>${esc(p.texto)}${p.obl ? '<span class="obl" aria-hidden="true">*</span>' : ""}`;
  const ay = p.ayuda ? `<span class="ayuda">${esc(p.ayuda)}</span>` : (!p.obl ? `<span class="ayuda">Opcional.</span>` : "");
  return comoLegend ? `<legend>${t}</legend>${ay}` : `<label class="enunciado" for="i-${p.id}">${t}</label>${ay}`;
}

function op(tipo, name, valor, texto, marcado, clase = "") {
  return `<label class="op ${clase}"><input type="${tipo}" name="${name}" value="${esc(valor)}" ${marcado ? "checked" : ""}><span class="marca-op"></span><span>${esc(texto)}</span></label>`;
}

function htmlPregunta(p) {
  const v = estado.r[p.id];
  const id = `q-${p.id}`;
  switch (p.tipo) {
    case "palabra": case "abierto": {
      const campo = p.largo
        ? `<textarea id="i-${p.id}" maxlength="${p.max}" rows="4">${esc(v || "")}</textarea>`
        : `<input id="i-${p.id}" type="text" maxlength="${p.max}" autocomplete="off" value="${esc(v || "")}">`;
      return `<div class="pregunta" id="${id}">${cab(p, false)}${campo}<p class="contador" id="c-${p.id}">${(v || "").length}/${p.max}</p></div>`;
    }
    case "barrio":
      return `<div class="pregunta" id="${id}">${cab(p, false)}<select id="i-${p.id}"><option value="">Elige tu barrio</option>
        ${opcionesBarrio().map(o => `<option ${v === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
    case "escala":
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="opciones fila" style="--n:${p.opciones.length}">${p.opciones.map(o => op("radio", p.id, o, o, v === o, "escala")).join("")}</div></fieldset>`;
    case "unica":
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="opciones">${p.opciones.map(o => op("radio", p.id, o, o, v === o)).join("")}</div></fieldset>`;
    case "multiple":
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="opciones">${p.opciones.map(o => op("checkbox", p.id, o, o, Array.isArray(v) && v.includes(o))).join("")}</div></fieldset>`;
    case "escala10": {
      const nums = []; for (let i = p.desde; i <= 10; i++) nums.push(i);
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="diez ${p.desde ? "sin-cero" : ""}">${nums.map(n => op("radio", p.id, n, n, v === n, "num10")).join("")}</div>
        <div class="extremos"><span>${p.desde} · ${esc(p.extremos[0])}</span><span>${esc(p.extremos[1])} · 10</span></div>
        ${p.ns ? `<div class="ns">${op("radio", p.id, p.ns, p.ns, v === p.ns)}</div>` : ""}</fieldset>`;
    }
    case "matriz":
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="matriz">${p.filas.map((f, i) => `
        <div class="matriz-fila" role="radiogroup" aria-label="${esc(f)}"><p class="rotulo">${esc(f)}</p>
        <div class="opciones" style="--n:${p.columnas.length}">${p.columnas.map(c => op("radio", `${p.id}__${i}`, c, c, v && v[f] === c)).join("")}</div></div>`).join("")}</div></fieldset>`;
    case "disyuntivas":
      return `<fieldset class="pregunta" id="${id}">${cab(p)}<div class="matriz">${p.pares.map((par, i) => `
        <div class="par" role="radiogroup" aria-label="Opción ${i + 1}">${par.map(o => op("radio", `${p.id}__${i}`, o, o, Array.isArray(v) && v[i] === o)).join("")}</div>`).join("")}</div></fieldset>`;
  }
  return "";
}

function conectar(p) {
  const caja = $(`#q-${p.id}`);
  if (!caja) return;
  const cambiado = () => { limpiarError(p.id); guardarBorrador(); };
  if (["palabra", "abierto", "barrio"].includes(p.tipo)) {
    const i = $(`#i-${p.id}`);
    i.addEventListener("input", () => {
      estado.r[p.id] = i.value;
      const c = $(`#c-${p.id}`); if (c) c.textContent = `${i.value.length}/${p.max}`;
      if (p.id === "p6") actualizarCondicionales();
      cambiado();
    });
    return;
  }
  caja.addEventListener("change", e => {
    const t = e.target;
    if (p.tipo === "escala" || p.tipo === "unica") estado.r[p.id] = t.value;
    else if (p.tipo === "escala10") estado.r[p.id] = t.value === p.ns ? p.ns : Number(t.value);
    else if (p.tipo === "multiple") {
      let sel = $$(`input[name="${p.id}"]:checked`, caja).map(x => x.value);
      if (p.excluyente && t.checked) {
        sel = t.value === p.excluyente ? [p.excluyente] : sel.filter(x => x !== p.excluyente);
        $$(`input[name="${p.id}"]`, caja).forEach(x => { x.checked = sel.includes(x.value); });
      }
      const tope = p.exacto || p.max;
      if (tope && sel.length > tope) { t.checked = false; sel = sel.filter(x => x !== t.value); mostrarError(p.id, `Como mucho ${tope}. Quita una para elegir otra.`); guardarBorrador(); estado.r[p.id] = sel; return; }
      estado.r[p.id] = sel;
    } else if (p.tipo === "matriz") {
      const i = Number(t.name.split("__")[1]);
      estado.r[p.id] = { ...(estado.r[p.id] || {}), [p.filas[i]]: t.value };
    } else if (p.tipo === "disyuntivas") {
      const i = Number(t.name.split("__")[1]);
      const arr = Array.isArray(estado.r[p.id]) ? [...estado.r[p.id]] : new Array(p.pares.length).fill(null);
      arr[i] = t.value; estado.r[p.id] = arr;
    }
    cambiado();
  });
}

function actualizarCondicionales() {
  PREGUNTAS.filter(p => p.si).forEach(p => {
    const caja = $(`#q-${p.id}`);
    const ver = typeof estado.r[p.si] === "string" && estado.r[p.si].trim() !== "";
    if (caja) caja.hidden = !ver;
    if (!ver) delete estado.r[p.id];
  });
}

function mostrarError(id, msg) {
  const caja = $(`#q-${id}`); if (!caja) return;
  caja.classList.add("con-error");
  let m = $(".msg-error", caja);
  if (!m) { m = document.createElement("p"); m.className = "msg-error"; m.setAttribute("role", "alert"); caja.appendChild(m); }
  m.textContent = msg;
}
function limpiarError(id) {
  const caja = $(`#q-${id}`); if (!caja) return;
  caja.classList.remove("con-error"); $(".msg-error", caja)?.remove();
}

function limpiarRespuestas() {
  // quita valores nulos de disyuntivas a medias para validar bien
  const r = { ...estado.r };
  for (const p of PREGUNTAS) {
    if (p.tipo === "disyuntivas" && Array.isArray(r[p.id]) && r[p.id].some(x => x == null)) r[p.id] = r[p.id].map(x => x ?? "");
    if ((p.tipo === "abierto" || p.tipo === "palabra") && typeof r[p.id] === "string" && !r[p.id].trim()) delete r[p.id];
    if (p.tipo === "barrio" && r[p.id] === "") delete r[p.id];
  }
  return r;
}

$("#atras").addEventListener("click", () => {
  estado.paso = Math.max(0, (estado.paso || 0) - 1); guardarBorrador(); pintarPaso(); window.scrollTo(0, 0);
});

$("#formulario").addEventListener("submit", async e => {
  e.preventDefault();
  if (leer("cd_enviado") && !estado.otraPersona) return;
  const paso = estado.paso || 0;
  if (paso === 0) {
    if (!estado.filtro) { $("#filtro-error").hidden = false; return; }
    if (!estado.inicio) estado.inicio = Date.now();
    estado.paso = 1; guardarBorrador(); pintarPaso(); window.scrollTo(0, 0); return;
  }
  const b = BLOQUES[paso - 1];
  const r = limpiarRespuestas();
  const errs = errores(b.preguntas, r);
  b.preguntas.forEach(p => limpiarError(p.id));
  const ids = Object.keys(errs);
  if (ids.length) {
    ids.forEach(id => mostrarError(id, errs[id]));
    const primero = $(`#q-${ids[0]}`);
    primero?.scrollIntoView({ behavior: "smooth", block: "center" });
    primero?.querySelector("input,select,textarea")?.focus({ preventScroll: true });
    return;
  }
  if (paso < TOTAL_PASOS) { estado.paso = paso + 1; guardarBorrador(); pintarPaso(); window.scrollTo(0, 0); return; }
  await enviar(r);
});

async function enviar(r) {
  const boton = $("#siguiente"), aviso = $("#error-general");
  boton.disabled = true; boton.textContent = "Enviando…"; aviso.hidden = true;
  try {
    const s = estado.inicio ? Math.round((Date.now() - estado.inicio) / 1000) : 0;
    if (PREVIEW) {
      guardar("cd_enviado", true); guardar("cd_borrador", null);
      estado = { r: {}, paso: 0, inicio: null }; location.hash = "#gracias"; return;
    }
    const resp = await fetch("/api/enviar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ r, s, web: $("#web").value })
    });
    const j = await resp.json().catch(() => ({}));
    if (resp.ok && j.ok) {
      guardar("cd_enviado", true); guardar("cd_borrador", null);
      estado = { r: {}, paso: 0, inicio: null };
      location.hash = "#gracias"; return;
    }
    if (resp.status === 422 && j.error) {
      aviso.textContent = "Hay alguna respuesta que revisar. Vuelve atrás para comprobarla.";
    } else if (j.motivo === "sin-configurar") {
      aviso.textContent = "La consulta todavía no está abierta. Tus respuestas siguen guardadas en este dispositivo.";
    } else {
      aviso.textContent = "No se ha podido enviar. Tus respuestas siguen guardadas: inténtalo de nuevo en un momento.";
    }
  } catch {
    aviso.textContent = "Sin conexión. Tus respuestas siguen guardadas: inténtalo de nuevo cuando tengas cobertura.";
  }
  aviso.hidden = false; boton.disabled = false; boton.textContent = "Enviar mis respuestas";
}

/* ---------------- resultados ---------------- */
const pc = (a, b) => b ? Math.round(a / b * 100) : 0;
const pcTxt = (a, b) => `${pc(a, b)} %`;

function barras(items, base, { ordenar = false } = {}) {
  const lista = ordenar ? [...items].sort((a, b) => b.n - a.n) : items;
  const max = Math.max(1, ...lista.map(x => x.n));
  return `<div class="barras">${lista.map(x => `
    <div class="b" title="${esc(x.op)}: ${es(x.n)} de ${es(base)} (${pcTxt(x.n, base)})">
      <span class="et">${esc(x.op)}</span><span class="pista"><i style="width:${x.n / max * 100}%"></i></span><span class="v">${pcTxt(x.n, base)}</span>
    </div>`).join("")}</div>`;
}

function graf(titulo, sub, cuerpo) {
  return `<div class="graf"><h3>${esc(titulo)}</h3>${sub ? `<p class="sub">${sub}</p>` : ""}${cuerpo}</div>`;
}

function grafPregunta(id, opts = {}) {
  const p = POR_ID[id], d = window.__res.preguntas[id];
  if (!d) return "";
  const sub = opts.sub ?? `${es(d.base)} respuestas${d.media != null && p.tipo === "escala" ? ` · media ${String(d.media).replace(".", ",")} sobre 5` : ""}`;
  return graf(p.texto, sub, barras(d.d, d.base, opts));
}

function grafMatriz(id, columnasClave, rotulo) {
  const p = POR_ID[id], d = window.__res.preguntas[id];
  const items = d.filas.map(f => ({ op: f.fila, n: columnasClave.reduce((s, c) => s + f.d[p.columnas.indexOf(c)], 0) }));
  return graf(p.texto, `${rotulo} · ${es(d.base)} respuestas`, barras(items, d.base, { ordenar: true }));
}

function grafServicios() {
  const p = POR_ID.p17, d = window.__res.preguntas.p17;
  const items = d.filas.map(f => {
    let s = 0, c = 0; f.d.slice(0, 5).forEach((n, i) => { s += n * (i + 1); c += n; });
    return { fila: f.fila, m: c ? s / c : 0, c };
  }).sort((a, b) => a.m - b.m);
  return graf(p.texto, "Nota media de 1 (muy mal) a 5 (muy bien), sin contar «No lo sé». Primero lo peor valorado.",
    `<div class="barras">${items.map(x => `<div class="b" title="${esc(x.fila)}: ${x.m.toFixed(2).replace(".", ",")} (${es(x.c)} valoraciones)">
      <span class="et">${esc(x.fila)}</span><span class="pista"><i style="width:${x.m / 5 * 100}%"></i></span><span class="v">${x.m.toFixed(1).replace(".", ",")}</span></div>`).join("")}</div>`);
}

function grafDiez(id) {
  const p = POR_ID[id], d = window.__res.preguntas[id];
  const max = Math.max(1, ...d.d.map(x => x.n));
  const validas = d.base - (d.ns || 0);
  return graf(p.texto, `${es(validas)} respuestas · media ${String(d.media ?? "–").replace(".", ",")}${d.ns ? ` · ${es(d.ns)} prefieren no contestar` : ""}`,
    `<div class="histo">${d.d.map(x => `<div class="col" title="${x.op}: ${es(x.n)} (${pcTxt(x.n, validas)})"><span>${pc(x.n, validas)}</span><i style="height:${x.n / max * 100}%"></i></div>`).join("")}</div>
     <div class="histo-pie"><span>${p.desde} · ${esc(p.extremos[0])}</span><span>%</span><span>${esc(p.extremos[1])} · 10</span></div>`);
}

function grafDisyuntivas() {
  const p = POR_ID.p28, d = window.__res.preguntas.p28;
  return graf(p.texto, `${es(d.base)} respuestas`, `<div class="dis">${d.pares.map(x => {
    const t = x.d[0] + x.d[1];
    return `<div class="fila" title="${esc(x.par[0])}: ${pcTxt(x.d[0], t)} · ${esc(x.par[1])}: ${pcTxt(x.d[1], t)}">
      <div class="lados"><span>${esc(x.par[0])} <b>${pcTxt(x.d[0], t)}</b></span><span><b>${pcTxt(x.d[1], t)}</b> ${esc(x.par[1])}</span></div>
      <div class="pista2"><i style="width:${pc(x.d[0], t)}%"></i><i style="width:${100 - pc(x.d[0], t)}%"></i></div></div>`;
  }).join("")}</div>`);
}

function tabla(cols, filas) {
  return `<div class="tabla-wrap"><table><thead><tr>${cols.map((c, i) => `<th data-col="${i}" scope="col">${esc(c.t)}</th>`).join("")}</tr></thead>
    <tbody>${filas.map(f => `<tr>${cols.map(c => `<td data-v="${esc(c.v(f) ?? "")}">${c.f ? c.f(f) : esc(c.v(f) ?? "–")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function tablasOrdenables(raiz) {
  $$("table", raiz).forEach(t => $$("th", t).forEach(th => th.addEventListener("click", () => {
    const i = Number(th.dataset.col), asc = th.getAttribute("aria-sort") === "descending";
    $$("th", t).forEach(x => x.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", asc ? "ascending" : "descending");
    const filas = $$("tbody tr", t);
    filas.sort((a, b) => {
      const x = a.children[i].dataset.v, y = b.children[i].dataset.v;
      const nx = parseFloat(x), ny = parseFloat(y);
      const c = isNaN(nx) || isNaN(ny) ? x.localeCompare(y, "es") : nx - ny;
      return asc ? c : -c;
    });
    filas.forEach(f => t.tBodies[0].appendChild(f));
  })));
}
const coma = (v, dec = 1) => v == null ? "–" : Number(v).toFixed(dec).replace(".", ",");

function pintarResultados(R, demo) {
  window.__res = R;
  const cont = $("#res");
  const actualizado = new Date(R.actualizado).toLocaleString("es-ES", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  $("#res-entradilla").textContent = R.modo === "completo"
    ? `Lo que ha contestado Ceuta hasta ahora. Datos sin ponderar, actualizados el ${actualizado}.`
    : `La consulta sigue abierta. Para no influir en quien aún no ha contestado, de momento solo publicamos cuánta gente ha participado y desde dónde.`;

  let h = demo ? `<p class="aviso-demo">Datos de ejemplo generados al azar. No son respuestas reales.</p>` : "";
  h += `<div class="cifras">
    <div class="cifra"><b>${es(R.n)}</b><span>respuestas válidas</span></div>
    <div class="cifra"><b>${pc(R.n, CONFIG.objetivo)} %</b><span>del objetivo de ${es(CONFIG.objetivo)}</span></div>
    <div class="cifra"><b>${es(R.barrios.length)}</b><span>barrios con ${MINIMO} respuestas o más</span></div>
  </div>`;

  const partBarrios = graf("Respuestas por barrio", `Solo aparecen los barrios con ${MINIMO} respuestas o más.${R.barriosResto ? ` El resto suman ${es(R.barriosResto)}.` : ""}`,
    R.barrios.length ? barras(R.barrios.map(b => ({ op: b.barrio, n: b.n })), R.n) : `<p class="nota">Aún ningún barrio llega a ${MINIMO} respuestas.</p>`);

  if (R.modo !== "completo") {
    h += `<div class="res-grid">${partBarrios}</div>`;
    if (R.modo === "pocas") h += `<p class="vacio">Los resultados se publican a partir de 30 respuestas.</p>`;
    cont.innerHTML = h; return;
  }

  if (R.palabras?.length) {
    const max = Math.max(...R.palabras.map(p => p.n));
    h += `<section class="res-bloque"><h2>Estos dos meses, en una palabra</h2><p class="nota">Solo palabras que han escrito al menos cinco personas.</p>
      <div class="graf" style="margin-top:12px"><div class="palabras">${R.palabras.map(p =>
        `<span style="font-size:${(15 + 13 * p.n / max).toFixed(1)}px">${esc(p.w)}<small>${es(p.n)}</small></span>`).join("")}</div></div></section>`;
  }

  h += `<section class="res-bloque"><h2>Cómo lo hemos vivido</h2><div class="res-grid">
    ${grafPregunta("p2")}${grafPregunta("p4")}${grafPregunta("p3", { ordenar: true, sub: "Porcentaje de personas que marcan cada opción" })}${grafPregunta("p5")}
  </div></section>`;

  h += `<section class="res-bloque"><h2>Quién tiene que responder</h2><div class="res-grid">
    ${grafPregunta("p8")}
    ${grafMatriz("p9", ["Mucha", "Bastante"], "Porcentaje que le atribuye mucha o bastante responsabilidad")}
    ${grafMatriz("p10", ["No"], "Porcentaje que dice que no ha respondido")}
    ${grafPregunta("p11", { ordenar: true, sub: "Porcentaje de personas que marcan cada opción (hasta dos)" })}
  </div></section>`;

  h += `<section class="res-bloque"><h2>Qué hay que hacer ya</h2><div class="res-grid">
    ${grafPregunta("p14", { ordenar: true, sub: "Porcentaje de personas que marcan cada opción (hasta dos)" })}${grafDiez("p15")}
  </div></section>`;

  h += `<section class="res-bloque"><h2>Los barrios</h2><div class="res-grid">${partBarrios}${grafServicios()}
    ${grafPregunta("p18", { ordenar: true, sub: "Porcentaje de personas que marcan cada opción (hasta tres)" })}${grafPregunta("p20")}${grafPregunta("p21")}${grafPregunta("p22")}${grafPregunta("p23")}
  </div>`;
  if (R.porBarrio?.length) {
    h += `<h3 style="margin-top:22px;font-size:19px">Barrio a barrio</h3>` + tabla([
      { t: "Barrio", v: f => f.barrio },
      { t: "Respuestas", v: f => f.n, f: f => es(f.n) },
      { t: "Afectación (1-5)", v: f => f.afectacion, f: f => coma(f.afectacion) },
      { t: "Seguridad (1-5)", v: f => f.seguridad, f: f => coma(f.seguridad) },
      { t: "Convivencia (1-5)", v: f => f.convivencia, f: f => coma(f.convivencia) },
      { t: "Servicios (1-5)", v: f => f.servicios, f: f => coma(f.servicios) },
      { t: "Ha recibido menos", v: f => f.recibidoMenos, f: f => coma(f.recibidoMenos, 0) + " %" },
      { t: "Ha pensado irse", v: f => f.piensaIrse, f: f => coma(f.piensaIrse, 0) + " %" },
      { t: "Lo más urgente", v: f => f.urgencia }
    ], R.porBarrio) + `<p class="nota">Pulsa una columna para ordenar. Solo barrios con ${MINIMO} respuestas o más.</p>`;
  }
  h += `</section>`;

  h += `<section class="res-bloque"><h2>La Ceuta que viene</h2><div class="res-grid">
    ${grafPregunta("p25", { ordenar: true, sub: "Porcentaje de personas que lo eligen entre sus tres" })}${grafPregunta("p26", { ordenar: true })}${grafDisyuntivas()}
  </div></section>`;

  h += `<section class="res-bloque"><h2>Quién ha contestado</h2><p class="nota">Sirve para comparar con el padrón y con el CIS. En el informe final se pondera por edad, sexo y zona.</p><div class="res-grid">
    ${grafPregunta("p29")}${grafPregunta("p30")}${grafPregunta("p31", { ordenar: true })}${grafDiez("p32")}
  </div>`;
  if (R.porIdeologia?.length) {
    h += `<h3 style="margin-top:22px;font-size:19px">Lo mismo, visto desde cada lado</h3>` + tabla([
      { t: "Autoubicación", v: f => f.grupo },
      { t: "Respuestas", v: f => f.n, f: f => es(f.n) },
      { t: "Afectación (1-5)", v: f => f.afectacion, f: f => coma(f.afectacion) },
      { t: "Confianza en el delegado (0-10)", v: f => f.confianza, f: f => coma(f.confianza) },
      { t: "Ha pensado irse", v: f => f.piensaIrse, f: f => coma(f.piensaIrse, 0) + " %" }
    ], R.porIdeologia);
  }
  h += `</section>`;
  if (R.excluidas) h += `<p class="nota">${es(R.excluidas)} respuestas contestadas en menos de dos minutos se han apartado de estos resultados. <a href="#metodo">Por qué</a>.</p>`;
  cont.innerHTML = h;
  tablasOrdenables(cont);
}

function filasDeEjemplo(n = 1400) {
  const azar = arr => arr[Math.floor(Math.random() ** 1.3 * arr.length)];
  const pesoBarrio = BARRIOS.map((b, i) => Math.max(1, 30 - i));
  const totalPeso = pesoBarrio.reduce((a, b) => a + b, 0);
  const barrio = () => { let x = Math.random() * totalPeso; for (let i = 0; i < BARRIOS.length; i++) { x -= pesoBarrio[i]; if (x <= 0) return BARRIOS[i]; } return BARRIOS[0]; };
  const filas = [];
  for (let k = 0; k < n; k++) {
    const f = {};
    for (const p of PREGUNTAS) {
      if (["palabra", "abierto"].includes(p.tipo) || p.id === "p7") continue;
      if (p.tipo === "barrio") f[p.id] = barrio();
      else if (p.tipo === "escala" || p.tipo === "unica") f[p.id] = azar(p.opciones);
      else if (p.tipo === "escala10") f[p.id] = Math.random() < .08 && p.ns ? p.ns : Math.min(10, Math.max(p.desde, Math.round(p.desde + (10 - p.desde) * (Math.random() + Math.random()) / 2)));
      else if (p.tipo === "multiple") {
        const k2 = p.exacto || Math.max(1, Math.floor(Math.random() * (p.max || 3)) + 1);
        const pool = p.opciones.filter(o => o !== p.excluyente);
        f[p.id] = [...new Set(Array.from({ length: k2 * 2 }, () => azar(pool)))].slice(0, k2);
        if (p.exacto) while (f[p.id].length < p.exacto) { const o = pool[Math.floor(Math.random() * pool.length)]; if (!f[p.id].includes(o)) f[p.id].push(o); }
      } else if (p.tipo === "matriz") f[p.id] = Object.fromEntries(p.filas.map(fl => [fl, azar(p.columnas)]));
      else if (p.tipo === "disyuntivas") f[p.id] = p.pares.map(par => par[Math.random() < .5 ? 0 : 1]);
    }
    filas.push(f);
  }
  const palabras = ["miedo", "incertidumbre", "abandono", "cansancio", "tensión", "rabia", "tristeza", "esperanza", "olvido", "caos"]
    .map((w, i) => ({ w, n: Math.round(220 / (i + 1)) }));
  return { filas, palabras };
}

async function cargarResultados(demo) {
  const cont = $("#res");
  if (demo) {
    const { filas, palabras } = filasDeEjemplo();
    pintarResultados(agregar(filas, { palabras, modo: "completo", excluidas: 37 }), true);
    return;
  }
  cont.innerHTML = "";
  try {
    const r = await fetch("/api/resultados");
    if (!r.ok) throw new Error();
    pintarResultados(await r.json(), false);
  } catch {
    $("#res-entradilla").textContent = "Todavía no hay resultados que enseñar.";
    cont.innerHTML = `<p class="vacio">La consulta aún no ha empezado a recibir respuestas, o no se han podido cargar. Vuelve en un rato.</p>`;
  }
}

async function contador() {
  try {
    const r = await fetch("/api/resultados"); if (!r.ok) return;
    const { n } = await r.json();
    if (n >= CONFIG.contadorDesde) {
      const faltan = Math.max(0, CONFIG.objetivo - n);
      $("#f-titular").textContent = `Ya han contestado ${es(n)} vecinos de Ceuta`;
      $("#f-linea").textContent = faltan ? `Faltan ${es(faltan)} para llegar al objetivo` : "Objetivo cumplido y la consulta sigue abierta";
      $("#f-barra").hidden = false;
      $("#f-barra i").style.width = Math.min(100, Math.round(n / CONFIG.objetivo * 100)) + "%";
    }
  } catch {}
}

textosFijos();
mostrar();
contador();
