import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithCache } from '@/lib/redis';

export async function GET() {
    try {
        const fetchTrending = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('sales_count', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data;
        };

        // Cache trending products for 15 minutes (900 seconds)
        const products = await fetchWithCache('trending_products', fetchTrending, 900);

        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error('Error fetching trending products:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
