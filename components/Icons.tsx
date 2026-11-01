import type {SVGProps} from 'react';
type IconProps=SVGProps<SVGSVGElement> & {size?:number};
function Icon({children,size=20,...props}:IconProps&{children:React.ReactNode}){return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>}
export const Arrow=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M4 12h15m-6-6 6 6-6 6"/></Icon>;
export const ArrowUp=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M5 19 19 5M8 5h11v11"/></Icon>;
export const Play=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="m9 6 10 6-10 6V6Z" fill="currentColor" stroke="none"/></Icon>;
export const Pause=({size,...p}:IconProps)=><Icon size={size} {...p}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></Icon>;
export const MenuIcon=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M4 8h16M4 16h16"/></Icon>;
export const Close=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M5 5 19 19M19 5 5 19"/></Icon>;
export const Plus=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const Check=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="m5 12 4 4L19 6"/></Icon>;
export const Volume=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M4 9h4l5-4v14l-5-4H4zM17 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/></Icon>;
export const Wave=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M3 10v4m4-7v10m4-14v18m4-15v12m4-9v6m3-3v1"/></Icon>;
export const Heart=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M20.8 8.4c0 4.1-8.8 10.4-8.8 10.4S3.2 12.5 3.2 8.4a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z"/></Icon>;
export const Shield=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="m12 2 9 4v6c0 6-4 9-9 10C7 21 3 18 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/></Icon>;
export const Spark=({size,...p}:IconProps)=><Icon size={size} {...p}><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Z"/></Icon>;
export const Mail=({size,...p}:IconProps)=><Icon size={size} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></Icon>;
export const Clock=({size,...p}:IconProps)=><Icon size={size} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const UserIcon=({size,...p}:IconProps)=><Icon size={size} {...p}><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></Icon>;
export const InstagramIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
export const YouTubeIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);
export const FacebookIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
export const XIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none" aria-hidden="true" {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
export const LinkedInIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
export const WhatsAppIcon=({size=20,...p}:IconProps)=>(
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <path d="M9.5 9.5c.3-.5.7-.5 1 0 .2.4.7 1.6.8 1.7.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6.4.7 1.2 1.5 2 1.9.3.2.4.1.6 0l.6-.5c.2-.2.4-.2.6-.1.2.1 1.4.7 1.7.8.2.1.3.4.2.7-.2.6-.9 1.3-1.6 1.3-.8 0-2.4-.6-3.8-2-1.4-1.4-2-3-2-3.8 0-.7.7-1.4 1.3-1.6z"/>
  </svg>
);
