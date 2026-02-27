import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            amount,
            items,
            shipping_address,
            user_clerk_id,
        } = await req.json();

        if (!razorpay_payment_id || !items || !shipping_address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Store clerk_user_id directly — no fragile users table join needed.
        const { data, error } = await supabaseAdmin
            .from('orders')
            .insert({
                clerk_user_id: user_clerk_id || null,
                payment_id: razorpay_payment_id,
                total_amount: amount,
                order_items: items,
                shipping_address,
                status: 'Placed',
            })
            .select('id')
            .single();

        if (error) {
            console.error('[save-order] Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ orderId: data.id, success: true });
    } catch (error: any) {
        console.error('[save-order]', error);
        return NextResponse.json({ error: error.message || 'Failed to save order' }, { status: 500 });
    }
}
