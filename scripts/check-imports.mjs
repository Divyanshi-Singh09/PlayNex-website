import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),errors=[];
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
 if(['node_modules','.next'].includes(d.name))continue;
 const full=path.join(dir,d.name);
 if(d.isDirectory())walk(full);else if(/\.(ts|tsx)$/.test(d.name)){
  const contents=fs.readFileSync(full,'utf8');
  const found=[...contents.matchAll(/\b(?:from\s*|import\s*\()\s*['"]([@./][^'"]+)['"]/g)];
  for(const match of found){const spec=match[1];if(spec.startsWith('next/')||spec==='react')continue;
   const base=spec.startsWith('@/')?path.resolve(root,spec.slice(2)):spec.startsWith('./')||spec.startsWith('../')?path.resolve(path.dirname(full),spec):null;
   if(!base)continue;
   if(!['','.ts','.tsx','.js','.mjs','/index.ts','/index.tsx'].some(ext=>fs.existsSync(base+ext)))errors.push(`${path.relative(root,full)}: ${spec}`);
  }
 }
}}
walk(root);
if(errors.length){console.error('Unresolved local imports:\n'+errors.join('\n'));process.exit(1)}
console.log('Local import resolution: PASS');
