'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
/** Route-local optional GSAP. Nothing loaded for users requesting reduced motion. */
export default function StoryMotion(){
 const route=usePathname();
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let disposed=false;
  let cleanup=()=>{};
  (async()=>{
    // Loaded only on routes that include StoryMotion, after hydration.
    const [g,s]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);
    if(disposed)return;
    const gsap=g.gsap;
    gsap.registerPlugin(s.ScrollTrigger);
    const mm=gsap.matchMedia();
    mm.add('(min-width: 860px) and (prefers-reduced-motion: no-preference)',()=>{
      const items=gsap.utils.toArray<HTMLElement>('[data-gsap="rise"]');
      items.forEach((el)=>{
        gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 89%',once:true}});
      });
    });
    cleanup=()=>mm.revert();
  })().catch(()=>{/* CSS still provides a complete, accessible layout */});
  return()=>{disposed=true;cleanup();};
 },[route]);
 return null;
}
