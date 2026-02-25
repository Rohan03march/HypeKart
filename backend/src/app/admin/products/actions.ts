'use server';

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createProductAction(productData: any) {
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert({
            title: productData.title,
            description: productData.description,
            base_price: productData.base_price,
            stock: productData.stock,
            sizes: productData.sizes,
            colors: productData.colors,
            images: productData.images,
            is_new_arrival: productData.is_new_arrival
        });

    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error(error.message);
    }

    revalidatePath('/admin/products');
    return { success: true };
}
