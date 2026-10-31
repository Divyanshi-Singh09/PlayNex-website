import Link from 'next/link';import {Arrow} from '@/components/Icons';
export default function NotFound(){return <main id="main" className="not-found"><span>404 / A LITTLE DETOUR</span><h1>Looks like this path<br/><em>led somewhere new.</em></h1><p>There's always another way to connect.</p><Link href="/" className="button button-blue">Back to PlayNex <Arrow size={18}/></Link></main>}
