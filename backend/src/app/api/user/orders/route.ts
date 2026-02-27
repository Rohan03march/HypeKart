import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const clerkUserId = req.nextUrl.searchParams.get('clerk_user_id');
    if (!clerkUserId) {
        return NextResponse.json({ error: 'clerk_user_id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, created_at, order_items, shipping_address, payment_id')
        .eq('clerk_user_id', clerkUserId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
}
