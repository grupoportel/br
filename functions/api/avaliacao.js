// Public intake only. Administrative CRM credentials never belong in browser code.
import { forwardSiteLead } from '../_lib/site-lead.js';
const MAX_BYTES = 8192;
const limits = {Nome:120, Email:254, Telefone:32, Empresa:160, Setor:80, Faturamento:80, Gargalo:120, website:200};
const options = {
  Setor:['Serviços B2B','Indústria','Tecnologia','Varejo','Agronegócio','Outros'],
  Faturamento:['Até R$ 50k','R$ 51k a R$ 200k','R$ 201k a R$ 500k','Acima de R$ 500k'],
  Gargalo:['Posicionamento ou oferta','Aquisição','Funil ou CRM','Conversão comercial','Retenção ou recompra','Sem clareza'],
};
function reply(request, status, success=false) {
  const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Strict-Transport-Security':'max-age=86400'};
  if(request.headers.get('accept')?.includes('application/json')) {
    return new Response(JSON.stringify({success}), {status, headers:{...headers,'Content-Type':'application/json; charset=utf-8'}});
  }
  const message = success ? 'Solicitação recebida. Nossa equipe entrará em contato pelos dados informados.' : 'Não foi possível enviar. Volte ao formulário e confira os campos ou fale conosco pelo WhatsApp.';
  return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Solicitação | Grupo Portel</title><main><h1>${success?'Solicitação recebida':'Confira sua solicitação'}</h1><p>${message}</p><a href="/#contato">Voltar ao Grupo Portel</a></main></html>`, {status,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
}
async function limitedBody(request) {
  if(Number(request.headers.get('content-length') || 0)>MAX_BYTES) throw new Error('body-limit');
  const reader=request.body?.getReader(); if(!reader)return new Uint8Array();
  const chunks=[];let size=0;
  try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();throw new Error('body-limit');}chunks.push(value);}}
  finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export async function onRequest(context) {
  const {request, env = {}} = context;
  if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}});
  const origin=request.headers.get('origin');
  if(origin!=='https://grupoportel.com')return reply(request,403);
  const type=request.headers.get('content-type') || '';
  if(!/^(multipart\/form-data;|application\/x-www-form-urlencoded(?:;|$))/i.test(type))return reply(request,415);
  let fields;
  try {
    const bytes=await limitedBody(request);
    fields=await new Response(bytes,{headers:{'Content-Type':type}}).formData();
  }catch(error){return reply(request,error.message==='body-limit'?413:400);}
  const values={};
  for(const [name,max] of Object.entries(limits)){
    const all=fields.getAll(name);
    if(all.length>1 || all.some(v=>typeof v!=='string'))return reply(request,400);
    const value=String(all[0] || '').trim();
    if(value.length>max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value))return reply(request,400);
    values[name]=value;
  }
  if(values.website)return reply(request,200,true); // No provider call for the bot trap.
  if(Object.keys(limits).filter(name=>name!=='website').some(name=>!values[name]))return reply(request,400);
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.Email))return reply(request,400);
  if(!/^[+()\d\s.-]+$/.test(values.Telefone) || !/^\d{10,15}$/.test(values.Telefone.replace(/\D/g,'')))return reply(request,400);
  if(Object.entries(options).some(([name,allowed])=>!allowed.includes(values[name])))return reply(request,400);
  const payload=new FormData();
  for(const [key,value] of Object.entries({Nome:values.Nome,email:values.Email,WhatsApp:values.Telefone,Empresa:values.Empresa,Setor:values.Setor,Faturamento:values.Faturamento,Gargalo:values.Gargalo,_subject:'Nova solicitação de avaliação — Grupo Portel'}))payload.append(key,value);
  try {
    const response=await fetch('https://formspree.io/f/xkgbwglk',{method:'POST',headers:{Accept:'application/json'},body:payload,signal:AbortSignal.timeout(8000)});
    if(!response.ok)return reply(request,502);
    // The email receipt remains the record if the automation is unavailable.
    // Dispatch after acceptance; no CRM delivery claim is made in the browser response.
    const delivery = forwardSiteLead(values, env).then(status => {
      console.info(`[site-lead] Automation ${status}.`);
    }).catch(error => {
      const reason = /^make-(config|delivery-\d{3})$/.test(error.message) ? error.message : 'network';
      console.error(`[site-lead] Automation delivery failed (${reason}); review Formspree Inbox.`);
    });
    if (context.waitUntil) context.waitUntil(delivery);
    else await delivery;
    return reply(request,200,true);
  }catch{return reply(request,502);}
}
