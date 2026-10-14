import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
if(!process.env.PLAYWRIGHT_MODULE||!process.env.TEST_CHROME)throw Error('Set PLAYWRIGHT_MODULE and TEST_CHROME for the local test browser.');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),out=resolve(root,'test-dist/1.0.0');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.TEST_CHROME,headless:true});
const checks=[],errors=[];
try{
 for(const width of [1440,390])for(const scheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:scheme,locale:'zh-CN',reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const requests=[];page.on('request',req=>requests.push(req.url()));
  await page.goto(pathToFileURL(root+'/index.html').href);
  assert.equal(await page.locator('html').getAttribute('data-language'),'en','Chinese device language must not choose Chinese automatically');
  const expected=scheme==='dark'?'rgb(19, 23, 30)':'rgb(248, 249, 252)';
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),expected);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No horizontal overflow: ${width}/${scheme}`);
  assert.equal(await page.locator('html [data-lang="zh"]').first().isVisible(),false);
  await page.locator('#explain-preview').click();assert.equal(await page.locator('#explanation-preview').isVisible(),true);
  assert.equal(await page.locator('#explain-preview').getAttribute('aria-expanded'),'true');
  await page.locator('#example-followup').click();assert.equal(await page.locator('.answer-followup').isVisible(),true);
  await page.locator('#example-followup').press('Escape');assert.equal(await page.locator('#explanation-preview').isVisible(),false);
  assert.equal(await page.locator('#explain-preview').evaluate(el=>el===document.activeElement),true);
  await page.locator('[data-language-toggle]').click();assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hans');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hans');
  assert.equal(await page.locator('.hero h1').innerText(),'少一点刺眼，\n多一分明白。');
  await page.screenshot({path:resolve(out,`${width}-${scheme}-zh.png`),fullPage:true});
  await page.locator('[data-language-toggle]').click();
  await page.locator('#explain-preview').click();
  await page.screenshot({path:resolve(out,`${width}-${scheme}-en.png`),fullPage:true});
  await page.locator('#close-explanation').click();
  const summary=page.locator('.faq-list summary').first();await summary.focus();await summary.press('Enter');
  assert.equal(await summary.evaluate(el=>el.parentElement.open),true);
  await page.evaluate(()=>{window.__copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}},configurable:true});});
  await page.locator('#copy-extensions').click();assert.equal(await page.evaluate(()=>window.__copied),'chrome://extensions');
  assert.equal(await page.locator('#copy-extensions').evaluate(el=>el.classList.contains('copied')),true);
  for(const anchor of await page.locator('a[href]').all()){
   const href=await anchor.getAttribute('href');if(href.startsWith('#')&&href!=='#')assert.ok(await page.locator(href).count(),href);
   if(/\.zip$/.test(href))assert.equal(new URL(href).host,'cpdf.songming.org');
  }
  assert.ok(requests.every(url=>url.startsWith('file:')||url.startsWith('data:')),'No remote requests for page or example');
  checks.push(`${width}px ${scheme}: file:// loading, English first, manual/persisted Chinese, system appearance, layout, explanation, keyboard, FAQ, copy, same-domain downloads`);
  await context.close();
 }
 const socialContext=await browser.newContext({viewport:{width:1200,height:630},deviceScaleFactor:1});
 const social=await socialContext.newPage();await social.goto(pathToFileURL(root+'/assets/social.svg').href);
 await social.screenshot({path:resolve(root,'assets/social.png')});await socialContext.close();
 const html=await readFile(root+'/index.html','utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(!/navigator\.language|prefersDarkMode|data-theme-toggle/.test(await readFile(root+'/site.js','utf8')));
 assert.ok(!html.includes('github.com'));assert.deepEqual(errors,[]);
 const report={passed:true,checks,errors};
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 await writeFile(resolve(out,'README.md'),'# Cosmic PDF website 1.0.0 QA\n\nRun tools/qa.mjs with PLAYWRIGHT_MODULE and TEST_CHROME pointing to an isolated test browser. Screenshots cover desktop/mobile, system light/dark and manually selected English/Chinese. Chinese browser locale intentionally starts in English. Tests do not call AI, upload documents, write a real clipboard, or control personal Chrome. The separate sample PDF uses independently authored text; its second page has no text layer.\n');
 console.log(JSON.stringify(report));
}finally{await browser.close();}
