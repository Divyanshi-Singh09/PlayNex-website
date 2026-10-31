/** Exercising the real mapper using transpilation + Node vm with a mocked Shopify response. */
import fs from 'node:fs';import {createRequire} from 'node:module';import vm from 'node:vm';
const require=createRequire(import.meta.url);let ts;try{ts=require('typescript');}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const source=fs.readFileSync('lib/perspectives.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};const context={exports,process,console,require:(p)=>p==='./shopify'?{shopifyEnabled:false,storefront(){}}:require(p)};
vm.runInNewContext(compiled,context,{filename:'perspectives.js'});
const ref=(key,value,reference)=>({key,value,reference});
const image={__typename:'MediaImage',image:{url:'https://cdn.shopify.com/s/files/portrait.webp',altText:'First guest',width:800,height:1000}};
const video={__typename:'Video',previewImage:{url:'https://cdn.shopify.com/s/files/poster.jpg',width:800,height:1000},sources:[{url:'https://cdn.shopify.com/s/files/interview.mp4',mimeType:'video/mp4'}]};
const make=(id,media,approved='true',visible='true')=>({id,handle:id,fields:[ref('name',id),ref('quote','A real approved quote'),ref('title','Featured title'),ref('role','Guest'),ref('consent_approved',approved),ref('show_on_site',visible),ref('media_preference',media==='video'?'video':'image'),ref('image',undefined,media==='image'?image:undefined),ref('video',undefined,media==='video'?video:undefined)]});
const out=exports.mapPerspectivesResponse({metaobject:{id:'section',handle:'home',fields:[{key:'stories',references:{nodes:[make('photo','image'),make('clip','video'),make('denied','image','false'),make('hidden','video','true','false')]}}]}});
function assert(c,msg){if(!c)throw Error(msg)}
assert(out.stories.length===2,'only visible/consented stories must render');
assert(out.stories[0].image?.url.includes('portrait.webp')&&!out.stories[0].video,'photo-only item broken');
assert(out.stories[1].video?.url.endsWith('interview.mp4')&&out.stories[1].featuredMedia==='video','video-only item broken');
assert(exports.mapPerspectivesResponse(null).stories.length===0,'unconfigured state must be safe');
const hybrid=make('hybrid','video');hybrid.fields.push(ref('image',undefined,image));
const media=exports.mapPerspectivesResponse({metaobject:{id:'section',handle:'home',fields:[{key:'stories',references:{nodes:[hybrid,make('textonly','none')]}}]}}).stories;
assert(media[0].image && media[0].video && media[0].featuredMedia==='video','image and video hybrid must work');
assert(!media[1].image&&!media[1].video,'text-only media fallback must work');
console.log('Passed: photo-only, video-only, hybrid, text-only, consent/visibility gate, empty content.');
