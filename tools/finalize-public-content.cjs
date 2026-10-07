// Version the entry point and refresh CSP hashes after changing inline HTML code.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const old='index-mobile-scroll-v1.js',previous='index-public-content-v3.js',next='index-public-content-v4.js';
const oldContext='layout-segment-context-mobile-scroll-v1.js',previousContext='layout-segment-context-public-v3.js',nextContext='layout-segment-context-public-v4.js';
const chunks=path.join(root,'_next/static/chunks');
// These modules form a cycle: the layout provider imports the entry's context,
// and the entry imports the provider. Version both ends together. An immutable
// cached provider importing an older entry starts a second application runtime.
if(!fs.existsSync(path.join(chunks,next)))fs.copyFileSync(path.join(chunks,fs.existsSync(path.join(chunks,previous))?previous:old),path.join(chunks,next));
fs.writeFileSync(path.join(chunks,next),fs.readFileSync(path.join(chunks,next),'utf8').replaceAll(oldContext,nextContext).replaceAll(previousContext,nextContext));
if(!fs.existsSync(path.join(chunks,nextContext)))fs.writeFileSync(path.join(chunks,nextContext),fs.readFileSync(path.join(chunks,oldContext),'utf8').replaceAll(previous,next).replaceAll(old,next));
// Preserve legacy module URLs for existing caches. Update only routing documents.
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','tools'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(json|rsc|html)$/.test(entry.name)){let text=fs.readFileSync(file,'utf8');const updated=text.replaceAll(previous,next).replaceAll(old,next).replaceAll(oldContext,nextContext).replaceAll(previousContext,nextContext);if(updated!==text)fs.writeFileSync(file,updated);}}}
walk(root);
for(const relative of ['index.html','privacidade.html','privacidade/index.html','termos.html','termos/index.html','404.html']){
const file=path.join(root,relative);let html=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n').replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*"\/>/g,'');
const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(([,a])=>!a.includes('src=')&&!a.includes('application/ld+json')).map(([, ,code])=>`'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`);
const policy=`default-src 'self'; script-src 'self' ${[...new Set(hashes)].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'`;
html=html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`);fs.writeFileSync(file,html);
}
