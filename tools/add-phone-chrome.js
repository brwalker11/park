#!/usr/bin/env node
// One-off sweep (2026-08-26): add click-to-call phone to footer Contact column
// and the mobile nav actions on every hand-maintained page plus the article
// template. Generated /articles/*/index.html are NOT touched; regenerate them.
// Dry run by default; --write to apply. Asserts exact counts before writing.
const fs = require('fs'), path = require('path');
const WRITE = process.argv.includes('--write');
const ROOT = path.resolve(__dirname, '..');
const TEL = '+16122454025', SHOWN = '(612) 245-4025';
const FOOT_ANCHOR = '<li><a href="mailto:info@monetize-parking.com">info@monetize-parking.com</a></li>';
const FOOT_NEW = `<li><a href="tel:${TEL}">${SHOWN}</a></li>\n            ` + FOOT_ANCHOR;
const MOB_ANCHOR = '<a href="/calculator/" class="btn btn--secondary">Try the Calculator</a>';
const MOB_NEW = `<a href="tel:${TEL}" class="btn btn--secondary">Call ${SHOWN}</a>\n          ` + MOB_ANCHOR;
function walk(d, out){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
  if(e.isDirectory()){ if(['node_modules','.git','articles'].includes(e.name)) continue; walk(p,out);} else if(e.name.endsWith('.html')) out.push(p);} return out; }
const files = walk(ROOT, []).filter(f => fs.readFileSync(f,'utf8').includes('class="site-footer"'));
const EXPECTED = 77; // 76 pages + templates/article-index.html
let bad = [];
for (const f of files){ const s=fs.readFileSync(f,'utf8');
  const c1=s.split(FOOT_ANCHOR).length-1, c2=s.split(MOB_ANCHOR).length-1, c3=s.split(`tel:${TEL}`).length-1;
  if(c1!==1||c2!==1||c3!==0) bad.push(`${path.relative(ROOT,f)} footer=${c1} mobile=${c2} tel=${c3}`); }
console.log(`matched files: ${files.length} (expected ${EXPECTED})`);
if(files.length!==EXPECTED||bad.length){ console.error('ABORT'); bad.forEach(b=>console.error('  '+b)); process.exit(1); }
if(!WRITE){ console.log('dry run OK; rerun with --write'); process.exit(0); }
for (const f of files){ let s=fs.readFileSync(f,'utf8'); s=s.replace(FOOT_ANCHOR,FOOT_NEW).replace(MOB_ANCHOR,MOB_NEW); fs.writeFileSync(f,s); }
console.log(`wrote ${files.length} files`);
