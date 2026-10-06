const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
const file=fs.readFileSync(path.join(__dirname,'../functions/api/avaliacao.js'),'utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(file).toString('base64'));
let calls=0,fail=false;
const original=global.fetch;global.fetch=async(url,options)=>{calls++;assert.equal(url,'https://formspree.io/f/xkgbwglk');assert.equal(options.body.get('email'),'teste@example.com');return new Response('{}',{status:fail?500:200});};
const valid={Nome:'Teste local',Email:'teste@example.com',Telefone:'21999999999',Empresa:'Empresa de teste',Setor:'Serviços B2B',Faturamento:'Até R$ 50k',Gargalo:'Aquisição',website:''};
const request=(fields=valid,origin='https://grupoportel.com')=>new Request('https://grupoportel.com/api/avaliacao',{method:'POST',headers:{Origin:origin,Accept:'application/json'},body:new URLSearchParams(fields)});
try {
assert.equal((await onRequest({request:new Request('https://grupoportel.com/api/avaliacao')})).status,405);
assert.equal((await onRequest({request:request(valid,'https://outro.example')})).status,403);
for(const fields of [{...valid,Nome:''},{...valid,Nome:'a'.repeat(121)},{...valid,Email:'inválido'},{...valid,Telefone:'123'},{...valid,Setor:'inventado'}])assert.equal((await onRequest({request:request(fields)})).status,400);
assert.equal((await onRequest({request:request({...valid,website:'bot'})})).status,200);assert.equal(calls,0);
assert.equal((await onRequest({request:request({...valid,Nome:'x'.repeat(9000)})})).status,413);assert.equal(calls,0);
const duplicate=request();const values=new URLSearchParams(valid);values.append('Nome','Outro');assert.equal((await onRequest({request:new Request(duplicate,{body:values})})).status,400);
assert.equal((await onRequest({request:request()})).status,200);assert.equal(calls,1);
fail=true;assert.equal((await onRequest({request:request()})).status,502);
const offline=request();offline.headers.set('Accept','text/html');const response=await onRequest({request:offline});assert.match(response.headers.get('content-type'),/text\/html/);assert.match(await response.text(),/Voltar ao Grupo Portel/);
console.log('PASS: origin, method, body size, field limits, email, phone, options, duplicate fields, honeypot, provider failure, no-JS response; no real leads sent.');
}finally{global.fetch=original;}
})().catch(error=>{console.error(error);process.exitCode=1});
