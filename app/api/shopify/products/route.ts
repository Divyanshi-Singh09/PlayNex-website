import { NextResponse } from 'next/server';
import {getStoreProducts,shopifyEnabled} from '@/lib/shopify';
export async function GET(){const products=await getStoreProducts();return NextResponse.json({configured:shopifyEnabled,products});}
