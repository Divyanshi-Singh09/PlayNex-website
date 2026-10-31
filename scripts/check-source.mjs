/** AST syntax check even when Next.js dependencies cannot be installed. */
import fs from 'node:fs';import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript');}catch{try{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');}catch{console.error('Install typescript to run this check');process.exit(2)}}
const root=process.cwd();let count=0,errors=0;
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
 if(['node_modules','.next','design-previews'].includes(d.name))continue;
 const p=path.join(dir,d.name);
 if(d.isDirectory())walk(p);
 else if(/\.(ts|tsx)$/.test(p)&&!p.endsWith('.d.ts')){
   const source=fs.readFileSync(p,'utf8'), out=ts.transpileModule(source,{fileName:p,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
   const diagnostics=out.diagnostics||[];if(diagnostics.length){errors+=diagnostics.length;for(const x of diagnostics)console.error(p+': '+ts.flattenDiagnosticMessageText(x.messageText,' '));}count++;
 }
}}
walk(root);console.log(`Checked ${count} TypeScript/TSX files; ${errors} syntax diagnostics.`);process.exitCode=errors?1:0;
