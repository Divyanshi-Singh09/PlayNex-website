/**
 * Shopify -> typed, publish-safe People / Perspectives content.
 * No client uploads or localStorage: all editorial content comes from Shopify Admin.
 * Fields defined in docs/SHOPIFY_METAOBJECTS.md.
 */
import {shopifyEnabled, storefront} from './shopify';

export type Picture = {url:string;alt:string;width:number;height:number};
export type Clip = {url:string;mimeType:string;poster:Picture|null};
export type Perspective = {
  id:string;handle:string;name:string;role:string;quote:string;
  title:string;eyebrow:string;image:Picture|null;video:Clip|null;
  featuredMedia:'image'|'video';
};
export type PerspectivesSection={
  eyebrow:string;headline:string;emphasis:string;intro:string;footer:string;
  wallHeading:string;stories:Perspective[];
};

const REF_FRAGMENT=`
fragment PerspectiveFile on MetafieldReference {
  __typename
  ... on MediaImage { image {url altText width height} }
  ... on Video { previewImage {url altText width height} sources {url mimeType format} }
}
`;
const QUERY=`
query PlayNexPerspectives($handle: MetaobjectHandleInput!) {
  metaobject(handle:$handle) {
    id handle
    fields {
      key value
      references(first:12) {
        nodes {
          __typename
          ... on Metaobject {
            id handle
            fields { key value reference { ...PerspectiveFile } }
          }
        }
      }
    }
  }
}
${REF_FRAGMENT}`;

export type FileReference =
  | {__typename:'MediaImage';image?:{url:string;altText?:string|null;width:number;height:number}|null}
  | {__typename:'Video';previewImage?:{url:string;altText?:string|null;width:number;height:number}|null;sources?:{url:string;mimeType:string;format?:string}[]}
  | {__typename:string};
type MetaField={key:string;value?:string|null;reference?:FileReference|null;references?:{nodes?:MetaObject[]}|null};
type MetaObject={id:string;handle:string;fields:MetaField[]};

function safeText(text:string|null|undefined,max=600){return (text||'').trim().slice(0,max);}
function photoFromRef(reference:FileReference|null|undefined,fallbackAlt:string):Picture|null{
  if(!reference||reference.__typename!=='MediaImage')return null;
  const img=(reference as Extract<FileReference,{__typename:'MediaImage'}>).image;
  if(!img?.url?.startsWith('https://'))return null;
  return {url:img.url,alt:safeText(img.altText||fallbackAlt,180),width:img.width||800,height:img.height||1000};
}
function clipFromRef(reference:FileReference|null|undefined,poster:Picture|null):Clip|null{
  if(!reference||reference.__typename!=='Video')return null;
  const video=reference as Extract<FileReference,{__typename:'Video'}>;
  // MP4 is broadly compatible. Shopify-hosted formats are selected, never arbitrary URLs.
  const source=video.sources?.find(s=>s.mimeType==='video/mp4')||video.sources?.find(s=>s.url?.startsWith('https://'));
  if(!source?.url?.startsWith('https://'))return null;
  const preview=video.previewImage?.url?.startsWith('https://')?{
    url:video.previewImage.url,alt:video.previewImage.altText||'Video preview',
    width:video.previewImage.width||960,height:video.previewImage.height||1200,
  }:null;
  return {url:source.url,mimeType:source.mimeType||'video/mp4',poster:poster||preview};
}
function fieldMap(fields:MetaField[]){return new Map(fields.map(f=>[f.key,f]));}
const string=(m:Map<string,MetaField>,key:string,max=500)=>safeText(m.get(key)?.value,max);
const bool=(m:Map<string,MetaField>,key:string)=>m.get(key)?.value==='true';

/** Public for tests. Refuse unapproved quotes even when their metaobject is published. */
export function mapPerspectivesResponse(data:{metaobject:MetaObject|null}|null):PerspectivesSection{
  const fields=data?.metaobject?.fields||[];
  const m=fieldMap(fields);
  const references=m.get('stories')?.references?.nodes||[];
  const stories:Perspective[]=[];
  for(const record of references.slice(0,12)){
    if(!record?.fields)continue;
    const v=fieldMap(record.fields);
    // Consent is required; content editors must separately enable the visible flag.
    if(!bool(v,'consent_approved')||!bool(v,'show_on_site'))continue;
    const name=string(v,'name',90),quote=string(v,'quote',750);
    if(!name||!quote)continue;
    const image=photoFromRef(v.get('image')?.reference,`${name} — PlayNex perspective`);
    const video=clipFromRef(v.get('video')?.reference,
      photoFromRef(v.get('poster')?.reference,`${name} video poster`)||image);
    const preference=string(v,'media_preference',10)==='video'?'video':'image';
    const featuredMedia=preference==='video'&&video||!image&&video?'video':'image';
    stories.push({id:record.id,handle:record.handle,name,role:string(v,'role',120),quote,
      title:string(v,'title',90)||name,eyebrow:string(v,'eyebrow',100)||'Community perspective',
      image,video,featuredMedia});
  }
  return {
    eyebrow:string(m,'eyebrow',90)||'PEOPLE / PERSPECTIVES / PLAYNEX',
    headline:string(m,'headline',90)||'The real magic?',
    emphasis:string(m,'emphasis',90)||'The people.',
    intro:string(m,'intro',350)||'Real experiences, honest recommendations and the people shaping what connection means.',
    footer:string(m,'footer',250)||'Shared with permission. Real people. Their own words.',
    wallHeading:string(m,'wall_heading',120)||'REAL STORIES / REAL MOMENTS',
    stories,
  };
}

export async function getPerspectives():Promise<PerspectivesSection>{
  if(!shopifyEnabled)return mapPerspectivesResponse(null);
  try{
    const handle={type:process.env.SHOPIFY_PERSPECTIVES_SECTION_TYPE||'playnex_perspectives_section',handle:process.env.SHOPIFY_PERSPECTIVES_SECTION_HANDLE||'home'};
    const data=await storefront<{metaobject:MetaObject|null}>(QUERY,{handle},undefined,{revalidate:300,tags:['shopify-perspectives']});
    return mapPerspectivesResponse(data);
  }catch(error){
    console.error('PlayNex Perspectives fetch failed',error);
    return mapPerspectivesResponse(null);
  }
}
