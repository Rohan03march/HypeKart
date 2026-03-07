import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET all reviews for a product
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Fetch reviews with user details joined (assuming we can join with users table or we just return clerk details)
        // For now we just fetch reviews since we only store user_id
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            reviews,
            averageRating: Number(averageRating),
            totalReviews: reviews.length
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST a new review
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, userId, rating, comment } = body;

        if (!productId || !userId || !rating) {
            return NextResponse.json(
                { error: 'Product ID, User ID, and Rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Insert review
        const { data: review, error } = await supabaseAdmin
            .from('reviews')
            .insert([
                {
                    product_id: productId,
                    user_id: userId,
                    rating,
                    comment
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, review });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
