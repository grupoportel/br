// Run with Node and Playwright available through NODE_PATH. Submissions are mocked.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const baseline = execFileSync('git', ['show', '5db4fe69daf03b926badc4f320248a187259c1da:index.html'], {cwd: root});
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.woff2':'font/woff2'};
const server = http.createServer((request, response) => {
  if (request.url === '/baseline') { response.setHeader('Content-Type','text/html'); response.end(baseline); return; }
  const file = path.resolve(root, '.' + decodeURIComponent(request.url.split('?')[0] === '/' ? '/index.html' : request.url.split('?')[0]));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel:'msedge', headless:true});
  try {
    for (const width of [390, 768, 1280]) {
      const context = await browser.newContext({viewport:{width,height:844}, hasTouch:width<=900, isMobile:width<=900});
      let failed = false;
      await context.route('**/*', route => {
        if (route.request().url().startsWith(url)) return route.continue();
        return route.fulfill({status:failed ? 500 : 200, contentType:'application/json', body:'{}'});
      });
      const page = await context.newPage();
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await page.goto(url, {waitUntil:'networkidle'});
      assert.deepEqual(errors, [], `Errors at ${width}`);
      const mobile = width<=900;
      const metrics = await page.evaluate(() => ({
        nodes:document.querySelectorAll('.scene *').length,
        overflow:document.documentElement.scrollWidth>innerWidth,
        fonts:getComputedStyle(document.body).fontFamily,
      }));
      assert.equal(metrics.overflow, false, `Horizontal overflow at ${width}`);
      assert.equal(requests.some(r=>r.includes('framework-')), !mobile);
      if (mobile) {
        assert.equal(requests.some(r=>r.includes('capy-transition')), false);
        assert.equal(requests.some(r=>r.includes('.woff2')), false);
        assert(metrics.nodes<30);
        for (const [phase, progress] of ['winter','spring','summer','autumn'].map((phase,index)=>[phase,index/4+.03])) {
          await page.evaluate(progress => {const j=document.querySelector('.journey'); scrollTo(0,j.offsetTop+(j.offsetHeight-document.querySelector('.journey-sticky').offsetHeight)*progress);}, progress);
          await page.waitForTimeout(150);
          assert.equal(await page.locator('.journey-sticky').getAttribute('data-season'), phase);
          assert.equal(await page.locator('.story-chapter:visible').count(), 1);
          assert.equal(await page.locator('.mobile-snow').isVisible(), phase === 'winter');
          assert.equal(await page.locator('.mobile-rain').isVisible(), phase === 'summer');
        }
        for (const progress of [0, .5, 1]) {
          await page.evaluate(progress => {const j=document.querySelector('.journey'); scrollTo(0,j.offsetTop+(j.offsetHeight-document.querySelector('.journey-sticky').offsetHeight)*progress);}, progress);
          await page.waitForTimeout(150);
          const bounds = await page.locator('.rough-capybara').evaluate(node => {const r=node.getBoundingClientRect(); return {left:r.left,right:r.right,center:r.left+r.width/2,width:innerWidth};});
          if (progress===0) assert(bounds.right<=1, 'Capybara starts outside the left edge');
          if (progress===.5) assert(Math.abs(bounds.center-bounds.width/2)<=1, 'Capybara crosses the center');
          if (progress===1) assert(bounds.left>=bounds.width-1, 'Capybara ends outside the right edge');
        }
        await page.evaluate(()=>scrollTo(0,0));
        await page.waitForTimeout(150);
        if (width===390) await page.screenshot({path:path.join(process.env.TEMP,'portel-mobile-lite.png')});
        await page.locator('[name="Nome"]').fill('Teste local');
        await page.locator('[name="Email"]').fill('teste@example.com');
        await page.locator('[name="Telefone"]').fill('21999999999');
        await page.locator('[name="Empresa"]').fill('Teste');
        await page.locator('[name="Setor"]').selectOption({index:1});
        await page.locator('[name="Faturamento"]').selectOption({index:1});
        await page.locator('[name="Gargalo"]').selectOption({index:1});
        await page.locator('.form-submit').click();
        await page.locator('.form-feedback.is-success').waitFor();
        await page.locator('[name="Nome"]').fill('Teste local');
        await page.locator('[name="Email"]').fill('teste@example.com');
        await page.locator('[name="Telefone"]').fill('21999999999');
        await page.locator('[name="Empresa"]').fill('Teste');
        await page.locator('[name="Setor"]').selectOption({index:1});
        await page.locator('[name="Faturamento"]').selectOption({index:1});
        await page.locator('[name="Gargalo"]').selectOption({index:1});
        failed=true;
        await page.locator('.form-submit').click();
        await page.locator('.form-feedback.is-error').waitFor();
        assert.equal(await page.locator('.mobile-snow span').first().evaluate(node=>getComputedStyle(node).animationPlayState), 'paused');
        failed=false;
        await page.emulateMedia({reducedMotion:'reduce'});
        assert.equal(await page.locator('.rough-walk').evaluate(node=>getComputedStyle(node).animationName), 'none');
      } else {
        await page.evaluate(() => {const j=document.querySelector('.journey'); scrollTo(0,j.offsetTop+(j.offsetHeight-innerHeight)*.55);});
        await page.waitForFunction(() => document.querySelector('.journey-sticky').dataset.season === 'summer');
        assert.equal(await page.locator('.journey-sticky').getAttribute('data-season'), 'summer');
      }
      console.log(JSON.stringify({width,...metrics,errors,localRequests:requests.filter(r=>r.startsWith(url)).length}));
      await context.close();
    }
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/*', route => route.request().url().startsWith(url) ? route.continue() : route.abort());
    const page=await context.newPage();
    await page.goto(url+'/baseline',{waitUntil:'networkidle'});
    console.log('BASELINE '+JSON.stringify(await page.evaluate(()=>({nodes:document.querySelectorAll('.scene *').length,bytes:performance.getEntriesByType('resource').reduce((sum,r)=>sum+r.decodedBodySize,0)}))));
    await page.goto(url,{waitUntil:'networkidle'});
    console.log('OPTIMIZED '+JSON.stringify(await page.evaluate(()=>({nodes:document.querySelectorAll('.scene *').length,bytes:performance.getEntriesByType('resource').reduce((sum,r)=>sum+r.decodedBodySize,0)}))));
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
