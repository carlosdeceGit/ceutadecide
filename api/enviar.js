// Recibe una respuesta. No lee ni guarda IP, navegador, cookies ni hora exacta.
import { preparar, VERSION } from "../preguntas.js";
import { rpc, configurada } from "../lib/db.js";

const TIEMPO_MINIMO = 120; // segundos: por debajo se marca como «rápida»

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  if (!configurada()) return res.status(503).json({ ok: false, motivo: "sin-configurar" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object" || typeof body.r !== "object" || JSON.stringify(body).length > 20000) {
    return res.status(400).json({ ok: false });
  }

  // Campo trampa: una persona no lo ve; un robot lo rellena. Se descarta en silencio.
  if (body.web) return res.status(200).json({ ok: true });

  const { datos, textos, error } = preparar(body.r);
  if (error) return res.status(422).json({ ok: false, error });

  const segundos = Math.max(0, Math.min(86400, Math.round(Number(body.s) || 0)));
  const calidad = segundos < TIEMPO_MINIMO ? "rapida" : "normal";
  // Se barajan los textos para que el orden de inserción no los empareje entre sí.
  textos.sort(() => Math.random() - 0.5);

  try {
    await rpc("cd_enviar", { p_datos: datos, p_textos: textos, p_segundos: segundos, p_calidad: calidad, p_version: VERSION });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false });
  }
}
