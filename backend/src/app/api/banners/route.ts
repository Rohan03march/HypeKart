import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchWithCache } from '@/lib/redis';

// Public GET for active banners
export async function GET() {
    try {
        const fetchBanners = async () => {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) throw error;
            return data;
        };

        // Cache banners for 1 hour (3600 seconds) since they don't change often
        const banners = await fetchWithCache('active_banners', fetchBanners, 3600);

        return NextResponse.json({ success: true, banners });
    } catch (error: any) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
