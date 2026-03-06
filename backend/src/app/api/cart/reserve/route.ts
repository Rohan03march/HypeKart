import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This API is called when a user clicks "Add to Bag" on the mobile app
export async function POST(req: NextRequest) {
    try {
        const { product_id, quantity, user_clerk_id } = await req.json();

        if (!product_id || !quantity || !user_clerk_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Call the PostgreSQL RPC we wrote to atomically check stock and reserve it
        const { data, error } = await supabaseAdmin.rpc('reserve_cart_item', {
            p_user_id: user_clerk_id,
            p_product_id: product_id,
            p_quantity: quantity,
            p_minutes: 10 // Reserve for 10 minutes
        });

        if (error) {
            console.error('[cart/reserve] RPC Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (data === true) {
            // Reservation successful.
            // Force a touch on the products table so WebSockets instantly fire to all other users
            // updating them that the effective stock just dropped
            await supabaseAdmin.rpc('trigger_product_update', { p_product_id: product_id });

            return NextResponse.json({ success: true, message: 'Item reserved for 10 minutes.' });
        } else {
            // Reservation failed (Not enough effective stock)
            return NextResponse.json({ error: 'Sorry, another user just reserved the last item.' }, { status: 409 });
        }

    } catch (error: any) {
        console.error('[cart/reserve]', error);
        return NextResponse.json({ error: error.message || 'Failed to reserve item' }, { status: 500 });
    }
}
