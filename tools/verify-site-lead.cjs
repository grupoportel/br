const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const source=fs.readFileSync(path.join(__dirname,'../functions/_lib/site-lead.js'),'utf8');
  const {forwardSiteLead}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const values={Nome:'Decisor de teste',Empresa:'Empresa de teste',Email:'teste@example.com',Telefone:'00000000000',Setor:'Outros',Faturamento:'Até R$ 50k',Gargalo:'Sem clareza'};
  const env={MAKE_SITE_WEBHOOK_URL:'https://hook.us2.make.com/test-only',MAKE_SITE_API_KEY:'local-test-only'};
  let calls=0;
  const mock=async(url,options)=>{
    calls++;
    assert.equal(url,env.MAKE_SITE_WEBHOOK_URL);
    assert.equal(options.headers['x-make-apikey'],env.MAKE_SITE_API_KEY);
    assert.equal(options.redirect,'error');
    const payload=JSON.parse(options.body);
    assert.equal(payload.nome,values.Empresa);
    assert.equal(payload.decisor,values.Nome);
    assert.equal(payload.email,values.Email);
    assert.equal(payload.whatsapp,values.Telefone);
    assert.equal(payload.nicho,values.Setor);
    assert.match(payload.mensagem,/Até R\$ 50k/);
    assert.match(payload.mensagem,/Sem clareza/);
    assert.equal(payload.origem,'site');
    assert.equal(payload.MAKE_SITE_API_KEY,undefined);
    return new Response('Accepted',{status:200});
  };
  assert.equal(await forwardSiteLead(values,{},mock),'disabled');
  assert.equal(calls,0);
  for(const bad of ['http://hook.us2.make.com/test-only','https://evil.example/test','https://hook.us2.make.com/test?secret=x','https://hook.us2.make.com/test#x']) {
    await assert.rejects(forwardSiteLead(values,{...env,MAKE_SITE_WEBHOOK_URL:bad},mock),/make-config/);
  }
  await assert.rejects(forwardSiteLead(values,{MAKE_SITE_WEBHOOK_URL:env.MAKE_SITE_WEBHOOK_URL},mock),/make-config/);
  assert.equal(calls,0);
  assert.equal(await forwardSiteLead(values,env,mock),'accepted');
  assert.equal(calls,1);
  await assert.rejects(forwardSiteLead(values,env,async()=>new Response('',{status:401})),/make-delivery/);
  await assert.rejects(forwardSiteLead(values,env,async()=>{throw new Error('network');}),/network/);
  const libraryUrl='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
  const intake=fs.readFileSync(path.join(__dirname,'../functions/api/avaliacao.js'),'utf8').replace('../_lib/site-lead.js',libraryUrl);
  const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(intake).toString('base64'));
  const originalFetch=global.fetch, originalError=console.error;
  let emailStatus=200, automationStatus=200, requests=[], logs=[], pending=[];
  global.fetch=async(url,options)=>{
    const target=String(url);
    requests.push(target);
    if(target==='https://formspree.io/f/xkgbwglk')return new Response('{}',{status:emailStatus});
    assert.equal(target,env.MAKE_SITE_WEBHOOK_URL);
    return new Response('',{status:automationStatus});
  };
  console.error=(message)=>logs.push(message);
  const run=async(overrides={})=>onRequest({
    request:new Request('https://grupoportel.com/api/avaliacao',{method:'POST',headers:{Origin:'https://grupoportel.com',Accept:'application/json'},body:new URLSearchParams({...values,website:'',...overrides})}),
    env,waitUntil(promise){pending.push(promise);},
  });
  try {
    assert.equal((await run({website:'bot'})).status,200);
    assert.equal(requests.length,0);
    assert.equal((await run({Nome:''})).status,400);
    assert.equal(requests.length,0);
    emailStatus=500;
    assert.equal((await run()).status,502);
    assert.deepEqual(requests,['https://formspree.io/f/xkgbwglk']);
    requests=[];emailStatus=200;
    assert.equal((await run()).status,200);
    await Promise.all(pending);pending=[];
    assert.deepEqual(requests,['https://formspree.io/f/xkgbwglk',env.MAKE_SITE_WEBHOOK_URL]);
    requests=[];automationStatus=401;
    assert.equal((await run()).status,200);
    await Promise.all(pending);
    assert.equal(logs.length,1);
    assert.ok(!logs[0].includes(values.Email));
    assert.ok(!logs[0].includes(env.MAKE_SITE_API_KEY));
    assert.ok(!logs[0].includes(env.MAKE_SITE_WEBHOOK_URL));
  } finally {global.fetch=originalFetch;console.error=originalError;}
  console.log('PASS: disabled by default, restricted destination, secret header, correct CRM mapping, failure handling. No live data sent.');
})().catch(error=>{console.error(error);process.exitCode=1;});
