import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { invalidateCache } from '@/lib/redis';

// GET all banners (including inactive) for admin
export async function GET() {
    try {
        const { data: banners, error } = await supabase
            .from('banners')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, banners });
    } catch (error: any) {
        console.error('Error fetching admin banners:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST a new banner
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image_url, link, is_active, order_index, title, description, cta_text } = body;

        const { data: banner, error } = await supabaseAdmin
            .from('banners')
            .insert([
                {
                    image_url,
                    title: title ?? null,
                    description: description ?? null,
                    cta_text: cta_text ?? null,
                    link,
                    is_active: is_active ?? true,
                    order_index: order_index ?? 0
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Invalidate public banner cache
        await invalidateCache('active_banners');

        return NextResponse.json({ success: true, banner });
    } catch (error: any) {
        console.error('Error creating banner:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
