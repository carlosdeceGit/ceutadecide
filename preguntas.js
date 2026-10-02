// =====================================================================
// CEUTA DECIDE · cuestionario v2
// Una sola fuente para la web y para el servidor: lo que se pinta en
// pantalla es lo mismo que se valida al recibir.
// Para cambiar una pregunta se edita aquí y nada más.
// =====================================================================

export const VERSION = "v2";

// Lista facilitada por Ceuta Decide (octubre 2026).
export const BARRIOS = [
  "Almadraba", "Barriada de la Libertad", "Benzú", "Centro", "El Morro", "El Sardinero",
  "Erquicia", "Hadú", "Juan Carlos I", "La Viña", "Loma Colmenar", "Miramar Bajo", "Otero",
  "Parques de Ceuta", "Príncipe Alfonso", "Príncipe Felipe", "Puertas del Campo", "Recinto Sur",
  "Rosales", "San Amaro", "San José", "Terrones", "Villajovita", "Zurrón"
];
export const BARRIO_OTRO = "Otro";
export const BARRIO_NS = "Prefiero no decirlo";

// Preguntas cuyo contenido es texto libre: se guardan aparte, sin unirse
// al resto de respuestas de la persona.
export const TEXTOS = ["p1", "p6", "p12", "p13", "p12s", "p13s", "p19", "p24", "p27", "p33"];

const ACTORES = ["Gobierno de España", "Delegación del Gobierno", "Ciudad Autónoma",
  "Unión Europea", "Marruecos", "Redes de tráfico de personas"];
const QUIEN_RESPONDE = ["Gobierno de España", "Delegación del Gobierno", "Ciudad Autónoma",
  "Asamblea de Ceuta", "Partidos políticos", "Asociaciones vecinales y entidades sociales",
  "Medios de comunicación"];
const SERVICIOS = ["Limpieza y basura", "Calles y aceras", "Alumbrado", "Parques y sombra",
  "Transporte público", "Instalaciones deportivas", "Espacios para jóvenes",
  "Centro de salud cercano", "Aparcamiento"];
const URGENCIAS = ["Empleo", "Vivienda", "Sanidad", "Limpieza y servicios urbanos", "Seguridad",
  "Educación", "Oportunidades para jóvenes", "Transporte y conexión con la Península",
  "Comercio y economía", "Medio ambiente", "Convivencia", "Atención a mayores"];

export const BLOQUES = [
  {
    id: "b1", titulo: "Estos meses",
    preguntas: [
      { id: "p1", tipo: "palabra", obl: true, max: 24,
        texto: "Si tuvieras que describir estos dos meses en Ceuta con una sola palabra, ¿cuál sería?" },
      { id: "p2", tipo: "escala", obl: true, texto: "¿Cuánto ha afectado esta situación a tu vida diaria?",
        opciones: ["Nada", "Poco", "Algo", "Bastante", "Muchísimo"] },
      { id: "p3", tipo: "multiple", obl: true, texto: "¿Qué ha cambiado en tu día a día?",
        ayuda: "Marca todo lo que te haya pasado.",
        opciones: ["Salgo menos de casa", "He cambiado las rutinas de mis hijos",
          "Mi trabajo o mi negocio se ha resentido", "He dejado de ir a sitios a los que iba",
          "Duermo o descanso peor", "No ha cambiado nada", "Otra cosa"],
        excluyente: "No ha cambiado nada" },
      { id: "p4", tipo: "unica", obl: true, texto: "En estos meses, ¿has pensado en irte a vivir fuera de Ceuta?",
        opciones: ["No", "Se me ha pasado por la cabeza", "Lo estoy pensando en serio", "Ya lo estoy preparando"] },
      { id: "p5", tipo: "escala", obl: true, texto: "¿Te has sentido seguro o segura en tu barrio estos meses?",
        opciones: ["Nada", "Poco", "Regular", "Bastante", "Completamente"] },
      { id: "p6", tipo: "abierto", obl: false, max: 600, largo: true,
        texto: "Si quieres, cuéntanos algo que hayas vivido estos meses.",
        ayuda: "No escribas nombres ni datos tuyos o de otras personas." },
      { id: "p7", tipo: "unica", obl: true, si: "p6",
        texto: "¿Podemos citar tu texto en el informe, sin ningún dato tuyo?", opciones: ["Sí", "No"] }
    ]
  },
  {
    id: "b2", titulo: "Quién tiene que responder",
    preguntas: [
      { id: "p8", tipo: "escala", obl: true,
        texto: "Cuando empezó todo, ¿te sentiste informado o informada por las autoridades?",
        opciones: ["Nada", "Poco", "Regular", "Bastante", "Bien informado"] },
      { id: "p9", tipo: "matriz", obl: true, texto: "¿Cuánta responsabilidad tiene cada uno en lo que ha pasado?",
        filas: ACTORES, columnas: ["Ninguna", "Poca", "Bastante", "Mucha", "No lo sé"] },
      { id: "p10", tipo: "matriz", obl: true, texto: "Durante estos meses, ¿ha respondido cada uno?",
        filas: QUIEN_RESPONDE, columnas: ["Sí", "A medias", "No", "No lo sé"] },
      { id: "p11", tipo: "unica", obl: true,
        texto: "¿Crees que esta situación está completamente resuelta a día de hoy?", opciones: ["Sí", "No"] },
      { id: "p11b", tipo: "multiple", obl: true, max: 2, si: { p: "p11", v: "No" },
        texto: "¿Por qué crees que no se ha resuelto todavía?", ayuda: "Hasta dos.",
        opciones: ["Falta de voluntad política", "Falta de medios",
          "Falta de coordinación entre administraciones", "Ceuta pesa poco en Madrid",
          "La relación con Marruecos", "Es un problema difícil de resolver", "No lo sé"] }
    ]
  },
  {
    id: "b3", titulo: "Lo que toca ahora",
    preguntas: [
      { id: "p12", tipo: "abierto", obl: true, max: 140, si: { p: "p11", v: "No" },
        texto: "¿Qué es lo primero que debería hacer el Gobierno de España por Ceuta?" },
      { id: "p13", tipo: "abierto", obl: true, max: 140, si: { p: "p11", v: "No" },
        texto: "¿Y lo primero que debería hacer el Gobierno de la Ciudad?" },
      { id: "p12s", tipo: "abierto", obl: true, max: 140, si: { p: "p11", v: "Sí" },
        texto: "¿Qué cosas clave crees que ha hecho el Gobierno de España para resolverla?" },
      { id: "p13s", tipo: "abierto", obl: true, max: 140, si: { p: "p11", v: "Sí" },
        texto: "¿Y la Ciudad, qué cosas clave crees que ha hecho para resolverla?" },
      { id: "p14", tipo: "multiple", obl: true, max: 2,
        texto: "Ceuta tiene nuevo delegado del Gobierno. ¿Qué debería hacer primero?", ayuda: "Hasta dos.",
        opciones: ["Venir a los barrios a escuchar", "Reconocer públicamente lo que ha pasado este verano",
          "Presentar un calendario con fechas y recursos", "Coordinarse con la Ciudad",
          "Informar cada mes de lo cumplido", "Atender a comercios y familias afectadas", "Otra cosa"] },
      { id: "p15", tipo: "escala10", obl: true, desde: 0,
        texto: "¿Cuánta confianza tienes en que el nuevo delegado mejore las cosas?",
        extremos: ["Ninguna", "Total"] }
    ]
  },
  {
    id: "b4", titulo: "Tu barrio",
    intro: "Ahora hablamos solo de donde vives. De aquí sale lo que hay que arreglar calle por calle.",
    preguntas: [
      { id: "p16", tipo: "barrio", obl: true, texto: "¿En qué barrio vives?" },
      { id: "p17", tipo: "matriz", obl: true, texto: "¿Cómo están estas cosas en tu barrio?",
        filas: SERVICIOS, columnas: ["Muy mal", "Mal", "Regular", "Bien", "Muy bien", "No lo sé"] },
      { id: "p18", tipo: "multiple", obl: true, max: 3, texto: "¿Qué le falta a tu barrio que hoy no tenga?",
        ayuda: "Hasta tres.",
        opciones: ["Centro de salud o más horario", "Espacio para jóvenes", "Zona deportiva",
          "Parque o zona de sombra", "Aceras accesibles", "Más iluminación", "Aparcamiento",
          "Comercio abierto", "Local para asociaciones", "Nada, está bien así"],
        excluyente: "Nada, está bien así" },
      { id: "p19", tipo: "abierto", obl: false, max: 140,
        texto: "¿Hay algún sitio concreto de tu barrio que lleve años esperando?",
        ayuda: "Una calle, una plaza, un edificio, un solar. Cuanto más concreto, mejor." },
      { id: "p20", tipo: "unica", obl: true,
        texto: "Comparado con otros barrios de Ceuta, en los últimos años el tuyo ha recibido…",
        opciones: ["Mucho menos", "Algo menos", "Lo mismo", "Algo más", "Mucho más", "No lo sé"] },
      { id: "p21", tipo: "unica", obl: true,
        texto: "Para hacer gestiones o recibir servicios, ¿tienes que salir de tu barrio?",
        opciones: ["Casi siempre", "A veces", "Casi nunca"] },
      { id: "p22", tipo: "escala", obl: true, texto: "¿Cómo es la convivencia en tu barrio?",
        opciones: ["Muy mala", "Mala", "Regular", "Buena", "Muy buena"] },
      { id: "p23", tipo: "unica", obl: true,
        texto: "¿Hay alguna asociación, club o grupo activo en tu barrio?",
        opciones: ["Sí, y participo", "Sí, pero no participo", "No conozco ninguno"] },
      { id: "p24", tipo: "abierto", obl: false, max: 140, texto: "¿Qué es lo mejor de tu barrio?" }
    ]
  },
  {
    id: "b5", titulo: "La Ceuta que viene",
    preguntas: [
      { id: "p25", tipo: "multiple", obl: true, exacto: 3,
        texto: "De estos asuntos, elige los tres más urgentes para Ceuta.", ayuda: "Exactamente tres.",
        opciones: URGENCIAS },
      { id: "p26", tipo: "unica", obl: true, texto: "¿Qué grupo lo tiene más difícil hoy en Ceuta?",
        opciones: ["Jóvenes", "Mujeres", "Mayores", "Familias con niños", "Autónomos y comercio",
          "Personas con discapacidad", "Personas en paro", "Otro"] },
      { id: "p27", tipo: "abierto", obl: false, max: 140,
        texto: "¿En qué es Ceuta mejor que ninguna otra ciudad?" },
      { id: "p28", tipo: "disyuntivas", obl: true, texto: "Si hubiera que elegir, ¿qué prefieres?",
        ayuda: "Una opción en cada fila.",
        pares: [["Primero el centro", "Primero las barriadas"],
          ["Primero el turismo", "Primero la industria y la logística"],
          ["Primero el empleo público", "Primero ayudar a crear empresas"],
          ["Primero obra nueva", "Primero arreglar lo que hay"]] }
    ]
  },
  {
    id: "b6", titulo: "Sobre ti",
    intro: "Unos pocos datos para comparar tus respuestas con las de toda la ciudad. No sirven para saber quién eres.",
    preguntas: [
      { id: "p29", tipo: "unica", obl: true, texto: "¿En qué tramo de edad estás?",
        opciones: ["18 a 29", "30 a 44", "45 a 64", "65 o más", "Prefiero no decirlo"] },
      { id: "p30", tipo: "unica", obl: true, texto: "Sexo",
        opciones: ["Mujer", "Hombre", "Prefiero no decirlo"] },
      { id: "p30b", tipo: "unica", obl: true, texto: "¿Naciste en Ceuta?",
        opciones: ["Sí", "No", "Prefiero no decirlo"] },
      { id: "p31", tipo: "unica", obl: true, texto: "¿Cuál es tu situación?",
        opciones: ["Trabajo por cuenta ajena", "Autónomo o tengo un negocio", "Estudio",
          "Estoy en paro", "Jubilado o jubilada", "Me dedico a los cuidados", "Otra"] },
      { id: "p32", tipo: "escala10", obl: true, desde: 1, ns: "Prefiero no contestar",
        texto: "Cuando se habla de política se usan las expresiones izquierda y derecha. ¿Dónde te colocarías tú?",
        extremos: ["Izquierda", "Derecha"] },
      { id: "p33", tipo: "abierto", obl: false, max: 600, largo: true, texto: "¿Algo más que quieras decir?" }
    ]
  }
];

export const PREGUNTAS = BLOQUES.flatMap(b => b.preguntas);
export const POR_ID = Object.fromEntries(PREGUNTAS.map(p => [p.id, p]));

export function opcionesBarrio() { return [...BARRIOS, BARRIO_OTRO, BARRIO_NS]; }

// ---------------------------------------------------------------------
// Limpieza de texto libre: quita teléfonos, correos, DNI/NIE y enlaces.
// ---------------------------------------------------------------------
export function limpiar(txt, max) {
  if (typeof txt !== "string") return "";
  let t = txt.normalize("NFC").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[eliminado]");
  t = t.replace(/https?:\/\/\S+|www\.\S+/gi, "[eliminado]");
  t = t.replace(/\b[XYZxyz][\s-]?\d{7}[\s-]?[A-Za-z]\b/g, "[eliminado]");
  t = t.replace(/\b\d{8}[\s-]?[A-Za-z]\b/g, "[eliminado]");
  t = t.replace(/(?:(?:\+|00)\s?)?\d[\d\s.\-()]{7,}\d/g, m => (m.replace(/\D/g, "").length >= 9 ? "[eliminado]" : m));
  t = t.replace(/\s{3,}/g, "  ");
  return t.slice(0, max);
}

export const visible = (p, r) => {
  if (!p.si) return true;
  if (typeof p.si === "object") return r[p.si.p] === p.si.v;
  return typeof r[p.si] === "string" && r[p.si].trim() !== "";
};
// Preguntas que ve quien va por el recorrido más largo (para anunciarlas).
export const N_PREGUNTAS = PREGUNTAS.filter(p => !(p.si && typeof p.si === "object" && p.si.v === "Sí")).length;

// Valida las respuestas de un bloque (o de todos). Devuelve {id: mensaje}.
export function errores(preguntas, r) {
  const e = {};
  for (const p of preguntas) {
    if (!visible(p, r)) continue;
    const v = r[p.id];
    const vacio = v == null || v === "" || (Array.isArray(v) && v.length === 0) ||
      (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
    if (vacio) { if (p.obl) e[p.id] = "Falta por contestar"; continue; }
    switch (p.tipo) {
      case "palabra": case "abierto":
        if (typeof v !== "string") e[p.id] = "Respuesta no válida";
        else if (p.obl && v.trim() === "") e[p.id] = "Falta por contestar";
        break;
      case "escala": case "unica":
        if (!p.opciones.includes(v)) e[p.id] = "Respuesta no válida"; break;
      case "barrio":
        if (!opcionesBarrio().includes(v)) e[p.id] = "Respuesta no válida"; break;
      case "escala10": {
        const ok = (v === p.ns && p.ns) || (Number.isInteger(v) && v >= p.desde && v <= 10);
        if (!ok) e[p.id] = "Respuesta no válida"; break;
      }
      case "multiple": {
        if (!Array.isArray(v) || v.some(x => !p.opciones.includes(x)) || new Set(v).size !== v.length) {
          e[p.id] = "Respuesta no válida"; break;
        }
        if (p.excluyente && v.includes(p.excluyente) && v.length > 1) e[p.id] = `«${p.excluyente}» va sola`;
        else if (p.exacto && v.length !== p.exacto) e[p.id] = `Elige exactamente ${p.exacto}`;
        else if (p.max && v.length > p.max) e[p.id] = `Como mucho ${p.max}`;
        break;
      }
      case "matriz": {
        if (typeof v !== "object" || Array.isArray(v)) { e[p.id] = "Respuesta no válida"; break; }
        const faltan = p.filas.filter(f => !p.columnas.includes(v[f]));
        if (Object.keys(v).some(k => !p.filas.includes(k))) e[p.id] = "Respuesta no válida";
        else if (faltan.length) e[p.id] = faltan.length === 1 ? `Falta «${faltan[0]}»` : `Faltan ${faltan.length} filas`;
        break;
      }
      case "disyuntivas": {
        if (!Array.isArray(v) || v.length !== p.pares.length) { e[p.id] = "Falta alguna fila"; break; }
        if (v.some((x, i) => !p.pares[i].includes(x))) e[p.id] = "Falta alguna fila";
        break;
      }
    }
  }
  return e;
}

// Separa y limpia una respuesta completa para guardarla.
// datos: respuestas cerradas · textos: lista suelta, sin enlace con datos.
export function preparar(r) {
  const e = errores(PREGUNTAS, r);
  if (Object.keys(e).length) return { error: e };
  const datos = {}, textos = [];
  for (const p of PREGUNTAS) {
    if (!visible(p, r) || r[p.id] == null) continue;
    if (TEXTOS.includes(p.id)) {
      const t = limpiar(r[p.id], p.max);
      if (!t) continue;
      const item = { pregunta: p.id, texto: p.id === "p1" ? t.toLowerCase().replace(/[.,;:!¡?¿"«»]/g, "").trim() : t };
      if (p.id === "p6") item.citable = r.p7 === "Sí";
      if (p.id === "p19") item.barrio = r.p16;
      textos.push(item);
    } else if (p.id !== "p7") {
      datos[p.id] = r[p.id];
    }
  }
  return { datos, textos };
}
