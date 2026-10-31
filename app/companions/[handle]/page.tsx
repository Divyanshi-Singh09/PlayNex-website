import {redirect} from 'next/navigation';

export default async function CompanionHandlePage({params}:{params:Promise<{handle:string}>}){
  const {handle} = await params;
  redirect(`/products/${encodeURIComponent(handle)}`);
}
