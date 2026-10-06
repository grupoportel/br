// Server-only delivery. Never expose the webhook address or either API key to the browser.
export async function forwardSiteLead(values, env = {}, fetcher = fetch) {
  if (!env.MAKE_SITE_WEBHOOK_URL && !env.MAKE_SITE_API_KEY) return 'disabled';
  let url;
  try { url = new URL(env.MAKE_SITE_WEBHOOK_URL); } catch { throw new Error('make-config'); }
  if (url.protocol !== 'https:' || url.hostname !== 'hook.us2.make.com' ||
      url.username || url.password || url.search || url.hash || !env.MAKE_SITE_API_KEY) {
    throw new Error('make-config');
  }
  const payload = {
    nome: values.Empresa,
    decisor: values.Nome,
    email: values.Email,
    whatsapp: values.Telefone,
    nicho: values.Setor,
    mensagem: `Solicitação de avaliação pelo site. Faturamento mensal informado: ${values.Faturamento}. Gargalo percebido: ${values.Gargalo}.`,
    origem: 'site',
  };
  const response = await fetcher(url.href, {
    method: 'POST', redirect: 'error',
    headers: {'Content-Type': 'application/json', 'x-make-apikey': env.MAKE_SITE_API_KEY},
    body: JSON.stringify(payload), signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('make-delivery');
  return 'accepted';
}
