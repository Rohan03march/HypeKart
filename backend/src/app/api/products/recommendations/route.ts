import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // First get the category and brand of the current product
        const { data: currentProduct, error: productError } = await supabase
            .from('products')
            .select('brand, category')
            .eq('id', productId)
            .single();

        if (productError || !currentProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Try to find by same category first (e.g., "Men - Top") for best relevance
        let query = supabase.from('products').select('*').neq('id', productId);

        if (currentProduct.category) {
            // ILIKE match on the first part of the category (e.g., "Men") for broader reach
            const baseCategory = currentProduct.category.split(' - ')[0];
            query = query.ilike('category', `${baseCategory}%`);
        } else if (currentProduct.brand) {
            query = query.eq('brand', currentProduct.brand);
        }

        const { data: recommendations, error: recError } = await query.limit(6);

        if (recError) throw recError;

        let finalRecommendations = recommendations || [];

        // If category/brand filter found less than 3, fallback to generic popular/new products
        if (finalRecommendations.length < 3) {
            const { data: fallback } = await supabase
                .from('products')
                .select('*')
                .neq('id', productId)
                .order('created_at', { ascending: false })
                .limit(6);

            if (fallback) {
                // Merge unique products
                const existingIds = new Set(finalRecommendations.map(p => p.id));
                const moreProducts = fallback.filter(p => !existingIds.has(p.id));
                finalRecommendations = [...finalRecommendations, ...moreProducts].slice(0, 6);
            }
        }

        return NextResponse.json({ success: true, products: finalRecommendations });
    } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
