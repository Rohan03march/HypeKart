import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET all coupons
export async function GET() {
    try {
        const { data: coupons, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, coupons });
    } catch (error: any) {
        console.error('Error fetching admin coupons:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST a new coupon
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, discount_type, discount_value, min_order_value, is_active } = body;

        // Validate inputs
        if (!code || !discount_type || discount_value === undefined) {
            return NextResponse.json(
                { success: false, error: 'code, discount_type, and discount_value are required' },
                { status: 400 }
            );
        }

        if (discount_type !== 'percentage' && discount_type !== 'fixed') {
            return NextResponse.json(
                { success: false, error: 'discount_type must be percentage or fixed' },
                { status: 400 }
            );
        }

        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .insert([
                {
                    code: code.toUpperCase(), // Store codes uppercase for consistency
                    discount_type,
                    discount_value,
                    min_order_value: min_order_value || null,
                    is_active: is_active ?? true
                }
            ])
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation on code
            if (error.code === '23505') {
                return NextResponse.json(
                    { success: false, error: 'Coupon code already exists' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, coupon });
    } catch (error: any) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
