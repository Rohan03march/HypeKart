import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_STATUSES = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export async function PATCH(req: NextRequest) {
    try {
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
        }

        if (!VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('[update-order-status] Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error('[update-order-status]', error);
        return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
    }
}
