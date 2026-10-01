// Resultados públicos. Solo agregados; nada por debajo del mínimo.
// RESULTADOS=completos publica todo; cualquier otro valor, solo participación.
import { agregar } from "../agregar.js";
import { rpc, configurada } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  if (!configurada()) return res.status(503).json({ ok: false, motivo: "sin-configurar" });
  const modo = process.env.RESULTADOS === "completos" ? "completo" : "participacion";
  try {
    const d = await rpc("cd_datos");
    const palabras = modo === "completo" ? await rpc("cd_palabras") : [];
    const filas = (d.filas || []).filter(f => f._c !== "rapida").map(({ _c, ...f }) => f);
    const out = agregar(filas, { palabras: palabras || [], modo, excluidas: (d.filas || []).length - filas.length });
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json(out);
  } catch {
    return res.status(502).json({ ok: false });
  }
}
