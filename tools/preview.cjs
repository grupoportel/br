const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.woff2':'font/woff2'};
http.createServer((request,response)=>{
  let url = decodeURIComponent(request.url.split('?')[0]);
  if (url.endsWith('/')) url += 'index.html';
  const file=path.resolve(root,'.'+url);
  if (!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()) {response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  response.end(fs.readFileSync(file));
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));
