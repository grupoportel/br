const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let page=fs.readFileSync(path.join(root,'_next/static/chunks/page-public-content-v1.js'),'utf8');
const marker='onSubmit:async e=>{';
const start=page.indexOf(marker),end=page.indexOf(',children:[',start);
if(start<0||end<0)throw Error('Missing form handler');
page=page.slice(0,start)+`onSubmit:async e=>{e.preventDefault();if("submitting"===v)return;const a=e.currentTarget;g("submitting");try{const response=await fetch("/api/avaliacao",{method:"POST",headers:{Accept:"application/json"},body:new FormData(a),signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error("Envio recusado");a.reset();g("success")}catch{g("error")}}`+page.slice(end);
html=html.replace('action="https://formspree.io/f/xkgbwglk"','action="/api/avaliacao"');
page=page.replace('action:"https://formspree.io/f/xkgbwglk"','action:"/api/avaliacao"');
const guard='<div class="form-guard" aria-hidden="true"><label>Deixe este campo vazio<input type="text" name="website" tabindex="-1" autocomplete="off" maxlength="200"/></label></div>';
html=html.replace('<div class="form-intro">',guard+'<div class="form-intro">');
page=page.replace(',children:[(0,o.jsxs)("div",{className:"form-intro"',',children:[(0,o.jsx)("div",{className:"form-guard","aria-hidden":!0,children:(0,o.jsxs)("label",{children:["Deixe este campo vazio",(0,o.jsx)("input",{type:"text",name:"website",tabIndex:-1,autoComplete:"off",maxLength:200})]})}),(0,o.jsxs)("div",{className:"form-intro"');
for(const [name,max] of [['Nome',120],['Email',254],['Telefone',32],['Empresa',160]]){
html=html.replace(`name="${name}" required=""`,`name="${name}" maxlength="${max}" required=""`);
page=page.replace(`name:"${name}",required:!0`,`name:"${name}",maxLength:${max},required:!0`);
}
fs.writeFileSync(path.join(root,'index.html'),html);
fs.writeFileSync(path.join(root,'_next/static/chunks/page-public-content-v1.js'),page);
let mobile=fs.readFileSync(path.join(root,'assets/mobile-lite-v13.js'),'utf8');
const a=mobile.indexOf('  const values = new FormData(form);'),b=mobile.indexOf('    form.reset();',a);
if(a<0||b<0)throw Error('Missing mobile handler');
mobile=mobile.slice(0,a)+`  try {\n    const response = await fetch('/api/avaliacao', {method:'POST',headers:{Accept:'application/json'},body:new FormData(form),signal:AbortSignal.timeout(12000)});\n    if (!response.ok) throw new Error('Envio recusado');\n`+mobile.slice(b);
fs.writeFileSync(path.join(root,'assets/mobile-lite-v14.js'),mobile);
html=fs.readFileSync(path.join(root,'index.html'),'utf8').replaceAll('mobile-lite-v13.js','mobile-lite-v14.js');fs.writeFileSync(path.join(root,'index.html'),html);
