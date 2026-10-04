import {readdir,unlink,copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({entryPoints:{'editions-motion':'src/editions-motion.js'},outdir:'public/vendor/editions',bundle:true,minify:true,splitting:true,format:'esm',target:['es2022'],legalComments:'linked',chunkNames:'[name]-[hash]',metafile:true}).then(async result=>{const outputs=new Set(Object.keys(result.metafile.outputs).map(p=>p.split('/').pop()));for(const file of await readdir('public/vendor/editions'))if(/^editions-scenes-[A-Z0-9]+\.js(?:\.LEGAL\.txt)?$/.test(file)&&!outputs.has(file))await unlink('public/vendor/editions/'+file);console.log('Built invitation motion:',Object.keys(result.metafile.outputs).join(', '));});

for (const name of ['gsap.min.js', 'ScrollTrigger.min.js']) await copyFile('node_modules/gsap/dist/' + name, 'public/vendor/' + name);
