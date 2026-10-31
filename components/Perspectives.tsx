'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import type {PerspectivesSection,Perspective,Picture} from '@/lib/perspectives';

type Props={section:PerspectivesSection};
function StoryImage({photo,priority=false}:{photo:Picture;priority?:boolean}){
 return <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 760px) 100vw, 52vw" priority={priority} className="perspectives-photo" />;
}
/** Single media component: images work on their own, videos show posters until click. */
function StoryMedia({story,priority=false,onPlay}:{story:Perspective;priority?:boolean;onPlay:()=>void}){
 const poster=story.image||story.video?.poster;
 const canPlay=story.featuredMedia==='video'&&Boolean(story.video);
 return <div className="voice-visual perspective-media">
    <div className="voice-art-bg"/>
    {poster?<StoryImage photo={poster} priority={priority}/>:<div className="perspective-no-photo" aria-label="Community story without media"><span>✳</span><strong>{story.title}</strong></div>}
    <div className="voice-photo-shade"/>
    <div className="voice-visual-top"><span>{story.eyebrow.toUpperCase()}</span><span>PLAYNEX</span></div>
    {canPlay?<button type="button" className="voice-play" onClick={onPlay} aria-label={`Play video from ${story.name}`}><span className="voice-play-triangle" aria-hidden="true">▶</span><span>Watch their story</span></button>:null}
    <div className="voice-media-note"><span>✳</span><span>{canPlay?'VIDEO PERSPECTIVE':'PHOTO PERSPECTIVE'}</span></div>
  </div>;
}
export default function Perspectives({section}:Props){
 const {stories}=section;
 const [active,setActive]=useState(0);
 const [dialogOpen,setDialogOpen]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const video=useRef<HTMLVideoElement>(null);
 const story=stories[Math.min(active,stories.length-1)];
 useEffect(()=>{if(!dialogOpen){video.current?.pause();return;}const d=dialog.current;if(d&&!d.open)d.showModal();return()=>{video.current?.pause();}},[dialogOpen]);
 function closeDialog(){video.current?.pause();dialog.current?.close();setDialogOpen(false);}
 useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft'&&document.activeElement?.closest('.voice-feature-shell'))setActive(v=>(v-1+stories.length)%stories.length);if(e.key==='ArrowRight'&&document.activeElement?.closest('.voice-feature-shell'))setActive(v=>(v+1)%stories.length);};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener);},[stories.length]);
 if(stories.length===0 && process.env.NEXT_PUBLIC_HIDE_EMPTY_VOICES==='true')return null;
 return <section className="home-voices-section" id="voices" aria-labelledby="voices-title">
 <div className="wrap voices-head" data-home-reveal data-gsap="rise"><div><p className="eyebrow light"><span className="eyebrow-indicator"/>{section.eyebrow}</p><h2 id="voices-title">{section.headline}<br/><em>{section.emphasis}</em></h2></div><div className="voices-head-aside"><p>{section.intro}</p><span>✳ {section.footer}</span></div></div>
 {!stories.length?<div className="wrap perspectives-empty" data-home-reveal><span className="perspectives-empty-mark">✳</span><div><h3>We believe every perspective matters.</h3><p>Approved stories and first-hand experiences will appear here as our community grows.</p></div></div>:<>
 <div className="wrap voice-gallery" data-home-reveal>
  <div className="voice-feature-shell" data-gsap="rise"><StoryMedia key={story.id} story={story} priority={active===0} onPlay={()=>setDialogOpen(true)}/>
   <div className="voice-quote-side" key={`${story.id}-quote`}><div className="voice-side-top"><span className="voice-kicker">FEATURED PERSPECTIVE {String(active+1).padStart(2,'0')}</span><span className="voice-asterisk">✳</span></div>
    <div className="voice-quote-body"><div className="voice-giant-quote" aria-hidden="true">“</div><blockquote>{story.quote}</blockquote><p>{story.eyebrow}</p></div>
    <div className="voice-attribution"><div><h3>{story.name}</h3><p>{story.role}</p></div><div className="voice-rotators"><button type="button" onClick={()=>setActive(v=>(v-1+stories.length)%stories.length)} aria-label="Previous perspective">←</button><button type="button" onClick={()=>setActive(v=>(v+1)%stories.length)} aria-label="Next perspective">→</button></div></div>
   </div>
  </div>
  <div className="voices-lowerbar"><p><strong>{section.footer}</strong> All media and quotes are managed in Shopify.</p><span className="perspectives-pagination" aria-live="polite">{String(active+1).padStart(2,'0')} / {String(stories.length).padStart(2,'0')}</span></div>
  <div className="voice-thumbnails" role="group" aria-label="Choose a featured perspective">{stories.map((s,i)=><button className={`voice-thumbnail ${active===i?'active':''}`} key={s.id} type="button" onClick={()=>setActive(i)} aria-pressed={active===i}><span className="voice-thumb-number">{String(i+1).padStart(2,'0')}</span><span className="voice-thumb-copy"><strong>{s.title}</strong><small>{s.name}</small></span><span className="voice-thumb-arrow">↗</span></button>)}</div>
  <div className="voices-wall-head"><span>{section.wallHeading}</span><span>SELECT A FRAME TO FEATURE ↑</span></div>
  <div className="voices-wall" role="group" aria-label="Community photo and video stories">{stories.map((s,i)=><button type="button" key={s.id} className="voices-wall-card" onClick={()=>{setActive(i);document.getElementById('voices-title')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}} aria-pressed={active===i}>
   {(s.image||s.video?.poster)?<Image className="wall-cover" src={(s.image||s.video!.poster)!.url} alt={(s.image||s.video!.poster)!.alt} fill sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw" loading="lazy"/>:<div className="perspective-tile-fallback">✳</div>}
   <span className="wall-top">{String(i+1).padStart(2,'0')} / {s.eyebrow}</span>{s.video&&s.featuredMedia==='video'?<span className="wall-play" aria-hidden="true">▶</span>:null}<span className="wall-bottom"><strong>{s.title}</strong><small>{s.name.toUpperCase()} ↗</small></span>
  </button>)}</div>
 </div>
 <dialog ref={dialog} className="voice-modal voice-media-dialog" aria-label={`${story.name} video`} onClose={()=>setDialogOpen(false)} onClick={e=>{if(e.target===e.currentTarget)closeDialog();}}><button type="button" onClick={closeDialog} className="voice-modal-close" aria-label="Close video">×</button><div className="voice-modal-content"><p className="eyebrow">PLAYNEX / COMMUNITY PERSPECTIVE</p><h2>{story.name}</h2><div className="voice-modal-preview">{dialogOpen&&story.video?<video ref={video} controls playsInline preload="metadata" poster={story.video.poster?.url||undefined} key={story.id}><source src={story.video.url} type={story.video.mimeType}/>Your browser does not support video playback.</video>:null}</div><p>{story.role}</p></div></dialog>
 </>}
 </section>;
}
