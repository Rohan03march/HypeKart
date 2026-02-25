import Link from "next/link";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import NewProductTrigger from "@/components/admin/NewProductTrigger";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    // Fetch products from Supabase
    const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    // Handle empty state gracefully if no products exist yet
    const displayProducts = products || [];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Inventory</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage your catalog and stock levels.</p>
                </div>
                <NewProductTrigger />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                {/* Subtle gradient overlay for the table container */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Product Name</th>
                                <th scope="col" className="px-6 py-5">Price</th>
                                <th scope="col" className="px-6 py-5">Stock</th>
                                <th scope="col" className="px-6 py-5">Status</th>
                                <th scope="col" className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <span className="text-2xl text-gray-400">✧</span>
                                            </div>
                                            <p className="font-medium text-white text-lg">Inventory Empty</p>
                                            <p className="text-sm text-gray-500 mt-1">Initiate a new drop to populate the catalog.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map((product) => {
                                    // Extract primary image if available
                                    const primaryImage = product.images?.[0];
                                    const isLowStock = product.stock > 0 && product.stock <= 10;
                                    const isOutOfStock = product.stock === 0;
                                    const statusText = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Active';

                                    return (
                                        <tr key={product.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                            <td className="px-8 py-5 font-medium text-white flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                                                    {primaryImage ? (
                                                        <img src={primaryImage} alt={product.title} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-600" />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-white">{product.title}</p>
                                                    {product.brand && <p className="text-xs text-gray-500 uppercase tracking-wider">{product.brand}</p>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-300">₹{Number(product.base_price).toFixed(2)}</td>
                                            <td className="px-6 py-5 text-gray-300">{product.stock}</td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${isOutOfStock
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : isLowStock
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link href={`/admin/products/${product.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
