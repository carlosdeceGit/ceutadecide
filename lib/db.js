// Llamadas a Supabase desde el servidor. El navegador nunca habla con
// Supabase: así su registro solo ve la IP de Vercel, no la del vecino.
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY;
const CLAVE = process.env.CD_CLAVE;

export const configurada = () => Boolean(URL && KEY && CLAVE);

export async function rpc(fn, args = {}) {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_clave: CLAVE, ...args })
  });
  if (!r.ok) throw new Error(`rpc ${fn} ${r.status}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
