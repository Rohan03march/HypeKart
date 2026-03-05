import { supabaseAdmin } from "@/lib/supabase";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm";

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // 1. Fetch Product Data
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        return notFound();
    }

    return (
        <div className="relative -m-10 min-h-[calc(100vh-5rem)] bg-[#0a0a0a] px-12 py-10">
            {/* Header Sequence */}
            <div className="flex flex-col gap-6 mb-10">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Inventory
                </Link>

                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-light tracking-tight text-white">Edit Product</h1>
                    </div>
                    <p className="text-gray-400 font-medium ml-1">Currently modifying <span className="text-white font-semibold">{product.title}</span></p>
                </div>
            </div>

            {/* Main Form Component */}
            <EditProductForm product={product} />
        </div>
    );
}
