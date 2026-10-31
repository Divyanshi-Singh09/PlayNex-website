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
