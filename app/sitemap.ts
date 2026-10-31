import type {MetadataRoute} from 'next';
import {articles} from '@/lib/articles';
import {getCollectionProducts,SHOPIFY_ORIGINALS_HANDLE,SHOPIFY_DISCOVER_HANDLE} from '@/lib/shopify';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(process.env.NEXT_PUBLIC_SITE_READY!=='true')return [];
 const base=(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').replace(/\/$/,'');
 const routes=['','shop','discover','login','about','experience','technology','our-story','safety','journal','faq','contact','shipping','returns','privacy','terms',...articles.map(a=>`journal/${a.slug}`)];
 const [originals,discover]=await Promise.all([getCollectionProducts(SHOPIFY_ORIGINALS_HANDLE),getCollectionProducts(SHOPIFY_DISCOVER_HANDLE)]);
 const handles=[...new Set([...originals,...discover].map(p=>p.handle))];
 return [...routes.map(path=>({url:`${base}/${path}`,changeFrequency:'monthly' as const,priority:path?0.6:1})),...handles.map(handle=>({url:`${base}/products/${encodeURIComponent(handle)}`,changeFrequency:'weekly' as const,priority:0.75}))];
}
