import { chromium } from 'playwright';
const [W,url,...sels]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:+W,height:900}});await p.goto(url,{waitUntil:'networkidle'});await p.waitForTimeout(400);
for(const s of sels){const r=await p.evaluate(s=>[...document.querySelectorAll(s)].slice(0,6).map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} ${Math.round(r.x)},${Math.round(r.y+scrollY)},${Math.round(r.width)},${Math.round(r.height)} m=${cs.margin} p=${cs.padding} d=${cs.display} lh=${cs.lineHeight} fs=${cs.fontSize}`}),s);console.log(s+'\n  '+r.join('\n  '));}
await b.close();
