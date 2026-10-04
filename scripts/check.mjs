import {readdirSync, readFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';

function walk(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
}
function localReference(file, reference) {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) return;
  const clean = reference.split(/[?#]/)[0];
  if (!clean) return;
  const resolved = clean.startsWith('/') ? path.join('public',clean) : path.resolve(path.dirname(file),clean);
  if (!existsSync(resolved)) throw new Error(file + ': missing reference ' + reference);
}
const sources = ['server','src','config','public/js','scripts','tests'].flatMap(walk).filter(file => /\.m?js$/.test(file));
sources.push('eslint.config.mjs');
for (const file of sources) {
  const checked=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if (checked.status !== 0) throw new Error(checked.error?.message || checked.stderr);
  const source=readFileSync(file,'utf8');
  const imports=/\b(?:import|export)\s+(?:[^'";\n]+?\s+from\s*)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
  for(const match of source.matchAll(imports)) {
    const spec=match[1]||match[2];
    if(spec.startsWith('/')) localReference(file,spec);
    else createRequire(path.resolve(file)).resolve(spec);
  }
}
for (const file of walk('public').filter(file=>/\.(html|css)$/.test(file))) {
  const content=readFileSync(file,'utf8');
  const references=file.endsWith('.html') ? /(?:src|href)="([^"<>]+)"/g : /url\(\s*['"]?([^'"()\s]+)['"]?\s*\)/g;
  for (const match of content.matchAll(references)) localReference(file,match[1]);
}
console.log(`Validated ${sources.length} JavaScript files, module imports and HTML/CSS local references.`);
