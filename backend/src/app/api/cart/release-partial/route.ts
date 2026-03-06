import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This API is called when a user decreases the quantity of an item in their cart.
// It finds exactly ONE active reservation unit for that product and user, and expires it.
export async function POST(req: NextRequest) {
    try {
        const { product_id, user_clerk_id } = await req.json();

        if (!product_id || !user_clerk_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // We need to release precisely ONE quantity. Since reservations might have been made 
        // with quantity > 1 (though currently our app only does quantity=1 at a time),
        // we'll find the oldest active reservation row and either:
        // A) Delete/Expire it completely if its quantity == 1.
        // B) Decrement its quantity if its quantity > 1.

        // Let's get the active reservations for this user and product
        const { data: reservations, error: fetchErr } = await supabaseAdmin
            .from('reserved_stock')
            .select('*')
            .eq('user_clerk_id', user_clerk_id)
            .eq('product_id', product_id)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: true }); // Release oldest first

        if (fetchErr || !reservations || reservations.length === 0) {
            return NextResponse.json({ error: 'No active reservations found to release' }, { status: 404 });
        }

        const targetRow = reservations[0];

        if (targetRow.quantity === 1) {
            // Expire the row entirely
            await supabaseAdmin
                .from('reserved_stock')
                .update({ status: 'EXPIRED' })
                .eq('id', targetRow.id);
        } else {
            // Decrement the row quantity by 1
            await supabaseAdmin
                .from('reserved_stock')
                .update({ quantity: targetRow.quantity - 1 })
                .eq('id', targetRow.id);
        }

        // Trigger the Postgres realtime webhook to tell everyone the stock went up
        await supabaseAdmin.rpc('trigger_product_update', { p_product_id: product_id });

        return NextResponse.json({ success: true, message: 'Partially released 1 item from reservation.' });

    } catch (error: any) {
        console.error('[cart/release-partial]', error);
        return NextResponse.json({ error: error.message || 'Failed to release partial item' }, { status: 500 });
    }
}
