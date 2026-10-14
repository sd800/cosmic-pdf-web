import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
if(!process.env.PLAYWRIGHT_MODULE||!process.env.TEST_CHROME)throw Error('Set PLAYWRIGHT_MODULE and TEST_CHROME for an isolated browser.');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),version=(await readFile(root+'/VERSION','utf8')).trim(),out=resolve(root,'test-dist/'+version);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.TEST_CHROME,headless:true}),report=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(root+'/index.html').href);
  await page.locator('.site-header .button-small').click();
  await page.waitForTimeout(180);
  const intermediate=await page.evaluate(()=>scrollY);assert.ok(intermediate>0&&intermediate<1500,'Scroll should have intermediate positions, not jump to the destination');
  await page.waitForFunction(()=>document.activeElement?.id==='download',{},{timeout:3000});
  const arrived=await page.locator('#download').evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(Math.abs(arrived-(width>650?104:88))<2,'Keep the sticky-header offset');
  assert.equal(new URL(page.url()).hash,'#download');
  await page.locator('.site-header .brand').click();await page.waitForFunction(()=>scrollY<1,{},{timeout:3000});
  await page.locator('.hero-actions .text-link').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.activeElement?.id==='reader-preview',{},{timeout:3000});
  assert.equal(new URL(page.url()).hash,'#reader-preview');
  await page.locator('.site-header .button-small').click();await page.waitForTimeout(100);await page.mouse.wheel(0,60);
  await page.waitForTimeout(1300);
  assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'download','User wheel input cancels pending focus transfer');
  assert.ok(await page.locator('#download').evaluate(el=>el.getBoundingClientRect().top)>250,'Cancelled animation must not resume');
  // Observe the production handler before suppressing the synthetic browser action.
  assert.equal(await page.evaluate(()=>{
   let prevented;
   document.addEventListener('click',event=>{prevented=event.defaultPrevented;event.preventDefault();},{once:true});
   document.querySelector('a[href="#privacy"]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0,metaKey:true}));
   return prevented;
  }),false,'Modified links retain native handling');
  assert.deepEqual(errors,[]);report.push({width,intermediate,arrived,keyboard:true,interruptible:true,modifiedClick:true});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage();
 await page.goto(pathToFileURL(root+'/index.html').href);await page.locator('.site-header .button-small').click();
 assert.equal(await page.evaluate(()=>document.activeElement.id),'download');
 assert.ok(Math.abs(await page.locator('#download').evaluate(el=>el.getBoundingClientRect().top)-104)<2);
 // Start another trip, then return through the browser's own history.
 await page.locator('.site-header a[href="#privacy"]').click();await page.goBack();
 assert.equal(new URL(page.url()).hash,'#download');
 report.push({reducedMotion:'immediate',history:'native back works'});await context.close();
 await writeFile(out+'/anchors.json',JSON.stringify({passed:true,checks:report},null,2)+'\n');
 await writeFile(out+'/README.md','# Gentle anchor navigation '+version+'\n\nRun tools/qa-anchors.mjs with PLAYWRIGHT_MODULE and TEST_CHROME. Local-file tests cover desktop/mobile intermediate scrolling, preserved header offsets, keyboard target focus, wheel cancellation, untouched modified clicks, reduced-motion immediate navigation and native Back. No personal Chrome, external request, real AI call or document upload.\n');
 console.log(JSON.stringify({passed:true,checks:report}));
}finally{await browser.close();}
