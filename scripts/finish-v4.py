from pathlib import Path
p=Path(__file__).resolve().parents[1]
f=p/'components/RevealEffects.tsx';s=f.read_text();s=s.replace("e.target.classList.add('revealed');","e.target.classList.add('revealed','is-visible');");s=s.replace("document.querySelectorAll('[data-reveal]:not(.revealed)')","document.querySelectorAll('[data-reveal]:not(.revealed), [data-home-reveal]:not(.is-visible)')");f.write_text(s)
f=p/'app/globals.css';s=f.read_text()+'''\n/* Never hide content when JavaScript is unavailable. */\n[data-home-reveal]{opacity:1;transform:none}\n.js-motion [data-home-reveal]:not(.is-visible){opacity:0;transform:translateY(26px)}\n.js-motion [data-home-reveal].is-visible{opacity:1;transform:none}\n@media (prefers-reduced-motion:reduce){.js-motion [data-home-reveal]{opacity:1!important;transform:none!important}}\n''';f.write_text(s)
# remove static homepage canonical metadata inherited by every route
f=p/'app/layout.tsx';s=f.read_text().replace(" alternates:{canonical:'/'},\n",'');f.write_text(s)
# Server components for static home sections; keep HomeFeeling's client bundle tiny
f=p/'components/HomeImmersive.tsx';s=f.read_text();start=s.index('export function HomeLetter()');end=s.index('const feelingSamples=[',start);letter=s[start:end];start2=s.index('export function HomeVision()');vision=s[start2:];(p/'components/HomeSections.tsx').write_text("import Link from 'next/link';\n"+letter+vision)
s=s[:start]+s[end:start2];s=s.replace("import Link from 'next/link';",'');f.write_text(s)
f=p/'app/page.tsx';s=f.read_text();s=s.replace("import {HomeLetter,HomeFeeling,HomeVision} from '@/components/HomeImmersive';","import {HomeFeeling} from '@/components/HomeImmersive';import {HomeLetter,HomeVision} from '@/components/HomeSections';");s="import type {Metadata} from 'next';\n"+s;s=s.replace("export default async function Home()", "export const metadata:Metadata={alternates:{canonical:'/'}};\nexport default async function Home()")
s=s.replace('return <main id="main"><StoryMotion/>','return <main id="main"><StoryMotion/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"PlayNex Interactive Technologies",url:(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"),logo:`${(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000").replace(/\\/$/,"")}/images/playnex-original-logo.png`}).replace(/</g,"\\\\u003c")}}/>')
f.write_text(s)
# add selected GSAP effects on Discover & About, avoid global GSAP payload
for route in ['about','discover']:
 f=p/'app'/route/'page.tsx';s=f.read_text();s="import StoryMotion from '@/components/StoryMotion';\n"+s;s=s.replace('return <main id="main">','return <main id="main"><StoryMotion/>');s=s.replace('<section className="about-hero">','<section className="about-hero" data-gsap="rise">');s=s.replace('<section className="discover-hero">','<section className="discover-hero" data-gsap="rise">');f.write_text(s)
# Canonicals page-by-page; no index all-page homepage canonical
for route in ['shop','discover','about','companions','experience','technology','our-story','safety','journal','faq','contact','shipping','returns','privacy','terms']:
 f=p/'app'/route/'page.tsx';s=f.read_text();token='export const metadata:Metadata={';
 if token in s:s=s.replace(token, f"export const metadata:Metadata={{alternates:{{canonical:'/{route}'}},",1)
 else:print('Missing static metadata',route)
 f.write_text(s)
# dynamic article canonical
f=p/'app/journal/[slug]/page.tsx';s=f.read_text().replace("return {title:a?.title||'Journal',description:a?.subtitle}","return {title:a?.title||'Journal',description:a?.subtitle,alternates:{canonical:`/journal/${encodeURIComponent((await params).slug)}`}}")
f.write_text(s)
# update env name for client-visible hide-when-empty, Shopify field is only server; only boolean exposed
f=p/'.env.example';s=f.read_text().replace('PLAYNEX_HIDE_EMPTY_VOICES=false','NEXT_PUBLIC_HIDE_EMPTY_VOICES=false');f.write_text(s)
print('V4 performance/SEO patches complete')
