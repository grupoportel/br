// Version the entry point and refresh CSP hashes after changing inline HTML code.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const old='index-mobile-scroll-v1.js',next='index-public-content-v1.js';
if(!fs.existsSync(path.join(root,'_next/static/chunks',next)))fs.copyFileSync(path.join(root,'_next/static/chunks',old),path.join(root,'_next/static/chunks',next));
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','tools'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(js|json|rsc|html)$/.test(entry.name)&&![old,next].includes(entry.name)){let text=fs.readFileSync(file,'utf8');if(text.includes(old))fs.writeFileSync(file,text.replaceAll(old,next));}}}
walk(root);
for(const relative of ['index.html','privacidade.html','privacidade/index.html','termos.html','termos/index.html','404.html']){
const file=path.join(root,relative);let html=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n').replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*"\/>/g,'');
const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(([,a])=>!a.includes('src=')&&!a.includes('application/ld+json')).map(([, ,code])=>`'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`);
const policy=`default-src 'self'; script-src 'self' ${[...new Set(hashes)].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'`;
html=html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`);fs.writeFileSync(file,html);
}
