import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { invalidateCache } from '@/lib/redis';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Explicitly destructure what we want to update to avoid injecting unwanted fields
        const { image_url, link, is_active, order_index } = body;

        const { data: banner, error } = await supabase
            .from('banners')
            .update({ image_url, link, is_active, order_index })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await invalidateCache('active_banners');

        return NextResponse.json({ success: true, banner });
    } catch (error: any) {
        console.error('Error updating banner:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await invalidateCache('active_banners');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
