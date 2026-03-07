import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, cartTotal } = body;

        if (!code || isNaN(cartTotal)) {
            return NextResponse.json(
                { success: false, error: 'Code and valid cartTotal are required' },
                { status: 400 }
            );
        }

        // 1. Fetch the coupon
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .ilike('code', code) // case-insensitive match
            .eq('is_active', true)
            .single();

        if (error || !coupon) {
            return NextResponse.json(
                { success: false, error: 'Invalid or inactive coupon code' },
                { status: 404 }
            );
        }

        // 2. Validate minimum order value
        if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Minimum order value of $${coupon.min_order_value} required for this coupon`
                },
                { status: 400 }
            );
        }

        // 3. Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'fixed') {
            discountAmount = Math.min(coupon.discount_value, cartTotal); // Can't discount more than total
        } else if (coupon.discount_type === 'percentage') {
            discountAmount = (cartTotal * coupon.discount_value) / 100;
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discount_type,
                discountValue: coupon.discount_value,
                discountAmount: Number(discountAmount.toFixed(2))
            }
        });

    } catch (error: any) {
        console.error('Error applying coupon:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
