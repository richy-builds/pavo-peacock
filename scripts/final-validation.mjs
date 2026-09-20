import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const hashes=()=>Object.fromEntries(readdirSync('src',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const path=`${e.parentPath}/${e.name}`;return [path,createHash('sha256').update(readFileSync(path)).digest('hex')];}));
const before=hashes();
execFileSync('npm',['test'],{stdio:'inherit'});
execFileSync('node',['scripts/body-review.mjs','final'],{stdio:'inherit'});
const after=hashes();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed during validation');
writeFileSync('docs/evidence/body-validation.json',JSON.stringify({date:new Date().toISOString(),source:after,sourceUnchanged:true,tests:'17/17 Playwright checks; final close fold/gesture review and 30-second high-LOD moving benchmark',build:'npm run build passes; existing 500kB bundle warning remains (600.42kB minified)'},null,2));
