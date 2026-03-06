import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This API is called when a user intentionally removes an item from their cart,
// instantly surrendering their reserved stock back to the public pool before the 10-min timeout.
export async function POST(req: NextRequest) {
    try {
        const { product_id, user_clerk_id } = await req.json();

        if (!product_id || !user_clerk_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Immediately terminate their active reservation early
        const { error } = await supabaseAdmin
            .from('reserved_stock')
            .update({ status: 'EXPIRED' })
            .eq('user_clerk_id', user_clerk_id)
            .eq('product_id', product_id)
            .eq('status', 'ACTIVE'); // Only clear active ones

        if (error) {
            console.error('[cart/release] Update Error:', error);
            // We don't necessarily throw a 500 block because we still want their UI cart to clear
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Trigger the Postgres realtime webhook to instantly tell everyone
        // looking at the product that it's no longer "Sold Out"
        await supabaseAdmin.rpc('trigger_product_update', { p_product_id: product_id });

        return NextResponse.json({ success: true, message: 'Reservation immediately released.' });

    } catch (error: any) {
        console.error('[cart/release]', error);
        return NextResponse.json({ error: error.message || 'Failed to release item' }, { status: 500 });
    }
}
