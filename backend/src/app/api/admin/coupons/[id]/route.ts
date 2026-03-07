import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { code, discount_type, discount_value, min_order_value, is_active } = body;

        if (discount_type && discount_type !== 'percentage' && discount_type !== 'fixed') {
            return NextResponse.json(
                { success: false, error: 'discount_type must be percentage or fixed' },
                { status: 400 }
            );
        }

        const updateData: any = {
            discount_type,
            discount_value,
            min_order_value,
            is_active
        };

        if (code) {
            updateData.code = code.toUpperCase();
        }

        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
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
        console.error('Error updating coupon:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
