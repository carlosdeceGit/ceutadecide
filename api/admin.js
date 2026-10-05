// Panel de administración: resultados completos y textos libres.
// Acceso con la contraseña ADMIN_CLAVE (variable de entorno en Vercel).
import { timingSafeEqual, createHash } from "node:crypto";
import { agregar } from "../agregar.js";
import { rpc, configurada } from "../lib/db.js";

const igual = (a, b) => {
  const h = x => createHash("sha256").update(String(x)).digest();
  return timingSafeEqual(h(a), h(b));
};
const espera = ms => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  if (!configurada() || !process.env.ADMIN_CLAVE) return res.status(503).json({ ok: false, motivo: "sin-configurar" });
  const dada = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!dada || !igual(dada, process.env.ADMIN_CLAVE)) { await espera(800); return res.status(401).json({ ok: false }); }
  try {
    const [d, palabras, textos] = await Promise.all([rpc("cd_datos"), rpc("cd_palabras"), rpc("cd_textos")]);
    const todas = d.filas || [];
    const filas = todas.filter(f => f._c !== "rapida").map(({ _c, ...f }) => f);
    const out = agregar(filas, { palabras: palabras || [], modo: "completo", excluidas: todas.length - filas.length });
    out.textos = textos || [];
    return res.status(200).json(out);
  } catch {
    return res.status(502).json({ ok: false });
  }
}
