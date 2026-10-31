import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots {
 const base=(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').replace(/\/$/,'');
 const published=process.env.NEXT_PUBLIC_SITE_READY==='true';
 return {rules:published?{userAgent:'*',allow:'/',disallow:['/api/']}: {userAgent:'*',disallow:'/'},sitemap:published?`${base}/sitemap.xml`:undefined};
}
