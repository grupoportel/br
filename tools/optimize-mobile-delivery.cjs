// Apply responsive image attributes equally to SSR HTML and the desktop tree.
// Preserve immutable legacy modules and version the coupled runtime together.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), chunks = path.join(root, '_next/static/chunks');
const src = '/assets/logo-grupo-portel-192.webp';
const srcset = '/assets/logo-grupo-portel-96.webp 96w, /assets/logo-grupo-portel-192.webp 192w, /assets/logo-grupo-portel-320.webp 320w';
const sizes = '(max-width: 900px) 38px, 60px';
const oldImage = '<img src="/assets/logo-grupo-portel.png" alt=""/>';
const newImage = `<img src="${src}" srcset="${srcset}" sizes="${sizes}" width="385" height="386" alt=""/>`;
const oldProps = 'src:"/assets/logo-grupo-portel.png",alt:""';
const newProps = `src:${JSON.stringify(src)},srcSet:${JSON.stringify(srcset)},sizes:${JSON.stringify(sizes)},width:385,height:386,alt:""`;
const page = fs.readFileSync(path.join(chunks, 'page-public-content-v2.js'), 'utf8');
if (!page.includes(oldProps)) throw Error('Expected source logo properties missing');
fs.writeFileSync(path.join(chunks, 'page-public-content-v3.js'), page.replaceAll(oldProps, newProps));
const entry = fs.readFileSync(path.join(chunks, 'index-public-content-v3.js'), 'utf8')
  .replaceAll('page-public-content-v2.js', 'page-public-content-v3.js')
  .replaceAll('layout-segment-context-public-v3.js', 'layout-segment-context-public-v4.js');
fs.writeFileSync(path.join(chunks, 'index-public-content-v4.js'), entry);
const context = fs.readFileSync(path.join(chunks, 'layout-segment-context-public-v3.js'), 'utf8')
  .replaceAll('index-public-content-v3.js', 'index-public-content-v4.js');
fs.writeFileSync(path.join(chunks, 'layout-segment-context-public-v4.js'), context);

function walk(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    if (['.git', 'tools'].includes(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (/\.(html|rsc|json)$/.test(item.name)) {
      const before = fs.readFileSync(file, 'utf8');
      const after = before.replaceAll('index-public-content-v3.js', 'index-public-content-v4.js')
        .replaceAll('page-public-content-v2.js', 'page-public-content-v3.js')
        .replaceAll('layout-segment-context-public-v3.js', 'layout-segment-context-public-v4.js')
        .replaceAll(oldImage, newImage).replaceAll('(max-width: 900px) 66px, 105px', sizes)
        .replaceAll('/assets/content-motion-v2.js', '/assets/content-motion-v3.js');
      if (after !== before) fs.writeFileSync(file, after);
    }
  }
}
walk(root);
// Update the enrichment stage without running it against the already-enriched site.
const generator = path.join(root, 'tools/enrich-home.cjs');
let source = fs.readFileSync(generator, 'utf8')
  .replaceAll('page-public-content-v2.js', 'page-public-content-v3.js')
  .replaceAll('/assets/content-motion-v2.js', '/assets/content-motion-v3.js')
  .replaceAll('(max-width: 900px) 66px, 105px', sizes);
const marker = "fs.writeFileSync(path.join(root,'index.html'),document);";
if (!source.includes('/* Responsive logo delivery. */')) {
  source = source.replace(marker, `/* Responsive logo delivery. */\ndocument=document.replaceAll(${JSON.stringify(oldImage)},${JSON.stringify(newImage)});\npage=page.replaceAll(${JSON.stringify(oldProps)},${JSON.stringify(newProps)});\n${marker}`);
}
fs.writeFileSync(generator, source);

// Changing the inline import selector requires new CSP hashes, with no new permissions.
for (const relative of ['index.html','privacidade.html','privacidade/index.html','termos.html','termos/index.html','404.html']) {
  const file = path.join(root, relative);
  let html = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([,attributes]) => !attributes.includes('src=') && !attributes.includes('application/ld+json'))
    .map(([, ,code]) => `'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`);
  html = html.replace(/script-src 'self'(?: 'sha256-[^']+')+/, `script-src 'self' ${[...new Set(hashes)].join(' ')}`);
  fs.writeFileSync(file, html);
}
console.log('Updated responsive logo, line measurement script and paired runtime URLs.');
