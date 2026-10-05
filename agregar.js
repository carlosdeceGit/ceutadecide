// Agregación pública de resultados. Se usa en el servidor (datos reales)
// y en el navegador (vista de ejemplo). Nunca devuelve filas sueltas.
import { PREGUNTAS, POR_ID, TEXTOS, BARRIO_OTRO, BARRIO_NS } from "./preguntas.js";

export const MINIMO = 15;        // ningún grupo publicado por debajo de esto
export const MINIMO_TOTAL = 30;  // por debajo, solo se publica la participación

const media = xs => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length * 100) / 100 : null;
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;

export function agregar(filas, { palabras = [], modo = "completo", excluidas = 0 } = {}) {
  const n = filas.length;
  const out = { n, excluidas, minimo: MINIMO, modo, actualizado: new Date().toISOString() };

  // Participación por barrio: los de menos de MINIMO se agrupan.
  const cuenta = {};
  for (const f of filas) { const b = f.p16 || BARRIO_NS; cuenta[b] = (cuenta[b] || 0) + 1; }
  const visibles = [], resto = { barrio: "Otros barrios", n: 0, grupos: 0 };
  for (const [b, c] of Object.entries(cuenta)) {
    if (b !== BARRIO_OTRO && b !== BARRIO_NS && c >= MINIMO) visibles.push({ barrio: b, n: c });
    else { resto.n += c; resto.grupos++; }
  }
  visibles.sort((a, b) => b.n - a.n);
  out.barrios = visibles;
  if (resto.n) out.barriosResto = resto.n;

  if (modo !== "completo" || n < MINIMO_TOTAL) { out.modo = n < MINIMO_TOTAL && modo === "completo" ? "pocas" : modo; return out; }

  // Distribución de cada pregunta cerrada.
  const P = {};
  for (const p of PREGUNTAS) {
    if (TEXTOS.includes(p.id) || p.id === "p7" || p.tipo === "barrio") continue;
    const vals = filas.map(f => f[p.id]).filter(v => v != null);
    const base = vals.length;
    if (p.tipo === "escala" || p.tipo === "unica") {
      const d = p.opciones.map(o => ({ op: o, n: vals.filter(v => v === o).length }));
      P[p.id] = { base, d };
      if (p.tipo === "escala") P[p.id].media = media(vals.map(v => p.opciones.indexOf(v) + 1));
    } else if (p.tipo === "escala10") {
      const nums = vals.filter(v => Number.isInteger(v));
      const d = [];
      for (let i = p.desde; i <= 10; i++) d.push({ op: String(i), n: nums.filter(v => v === i).length });
      P[p.id] = { base, d, media: media(nums), ns: base - nums.length };
    } else if (p.tipo === "multiple") {
      P[p.id] = { base, d: p.opciones.map(o => ({ op: o, n: vals.filter(v => v.includes(o)).length })) };
    } else if (p.tipo === "matriz") {
      P[p.id] = {
        base, columnas: p.columnas,
        filas: p.filas.map(fl => ({ fila: fl, d: p.columnas.map(c => vals.filter(v => v[fl] === c).length) }))
      };
    } else if (p.tipo === "disyuntivas") {
      P[p.id] = { base, pares: p.pares.map((par, i) => ({ par, d: par.map(o => vals.filter(v => v[i] === o).length) })) };
    }
  }
  out.preguntas = P;

  // Indicadores por barrio (solo barrios con MINIMO o más).
  const servicioMedio = f => {
    const v = f.p17 ? Object.values(f.p17).map(x => POR_ID.p17.columnas.indexOf(x) + 1).filter(x => x >= 1 && x <= 5) : [];
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  out.porBarrio = visibles.map(({ barrio, n: nb }) => {
    const fs = filas.filter(f => f.p16 === barrio);
    const esc = (id) => media(fs.map(f => POR_ID[id].opciones.indexOf(f[id]) + 1).filter(x => x > 0));
    const urg = {};
    fs.forEach(f => (f.p25 || []).forEach(u => { urg[u] = (urg[u] || 0) + 1; }));
    const top = Object.entries(urg).sort((a, b) => b[1] - a[1])[0];
    return {
      barrio, n: nb,
      afectacion: esc("p2"), seguridad: esc("p5"), convivencia: esc("p22"),
      servicios: media(fs.map(servicioMedio).filter(x => x != null)),
      recibidoMenos: pct(fs.filter(f => ["Mucho menos", "Algo menos"].includes(f.p20)).length, nb),
      piensaIrse: pct(fs.filter(f => f.p4 && f.p4 !== "No").length, nb),
      notaCiudad: media(fs.map(f => f.g5).filter(Number.isInteger)),
      urgencia: top ? top[0] : null
    };
  });

  // Ideología en tres bloques y un par de cruces si cada bloque llega al mínimo.
  const bloque = v => !Number.isInteger(v) ? "No contesta" : v <= 4 ? "Izquierda (1-4)" : v <= 6 ? "Centro (5-6)" : "Derecha (7-10)";
  const grupos = {};
  filas.forEach(f => { const b = bloque(f.p32); (grupos[b] = grupos[b] || []).push(f); });
  out.ideologia = ["Izquierda (1-4)", "Centro (5-6)", "Derecha (7-10)", "No contesta"]
    .map(g => ({ grupo: g, n: (grupos[g] || []).length }));
  out.porIdeologia = out.ideologia.filter(g => g.n >= MINIMO).map(({ grupo, n: ng }) => {
    const fs = grupos[grupo];
    return {
      grupo, n: ng,
      confianza: media(fs.map(f => f.p15).filter(Number.isInteger)),
      notaEspanaCeuta: media(fs.map(f => f.g1).filter(Number.isInteger)),
      notaEspana: media(fs.map(f => f.g2).filter(Number.isInteger)),
      notaCiudad: media(fs.map(f => f.g5).filter(Number.isInteger)),
      piensaIrse: pct(fs.filter(f => f.p4 && f.p4 !== "No").length, ng),
      afectacion: media(fs.map(f => POR_ID.p2.opciones.indexOf(f.p2) + 1).filter(x => x > 0))
    };
  });

  out.palabras = palabras.filter(p => p.n >= 5).slice(0, 40);
  return out;
}
