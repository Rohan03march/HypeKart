import { supabaseAdmin } from "@/lib/supabase";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { getActiveAdminRoleAction } from "./team/actions";

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
    const userRole = await getActiveAdminRoleAction();
    const isInventoryManager = userRole === 'inventory_manager';

    // 1. Fetch Orders for Revenue and Active Order count
    const { data: orders } = await supabaseAdmin.from('orders').select('total_amount, status, created_at');

    // 2. Fetch Customers Count
    const { count: customersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');

    // 3. Fetch Products for Low Stock alerts
    const { data: products } = await supabaseAdmin.from('products').select('stock, title, id');

    // Calculate metrics
    let totalRevenue = 0;
    let activeOrders = 0;
    let recentSales = 0; // Simulated concept: orders in last 30 days

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    orders?.forEach(order => {
        if (order.status !== 'Cancelled') {
            totalRevenue += Number(order.total_amount || 0);
        }
        if (order.status === 'Processing' || order.status === 'Shipped') {
            activeOrders++;
        }

        const orderDate = new Date(order.created_at);
        if (orderDate >= thirtyDaysAgo && order.status !== 'Cancelled') {
            recentSales += Number(order.total_amount || 0);
        }
    });

    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 5) || [];
    const outOfStockProducts = products?.filter(p => p.stock === 0) || [];

    // Monthly Growth (Simulated metric based on recent vs total for UI purposes)
    const growthRate = totalRevenue > 0 ? ((recentSales / totalRevenue) * 100).toFixed(1) : "0.0";

    return (
        <div className="flex flex-col gap-10 w-full mb-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-light tracking-tight text-white mb-2">Command Center</h1>
                <p className="text-sm text-gray-400 font-medium">Welcome back. Here's what's happening today.</p>
            </div>

            {/* Top Stat Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isInventoryManager ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-6`}>

                {/* Admin Only Cards */}
                {!isInventoryManager && (
                    <>
                        {/* Revenue Card */}
                        <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full group-hover:bg-green-500/20 transition-colors" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    +{growthRate}%
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold text-white mb-1">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Revenue</p>
                            </div>
                        </div>

                        {/* Orders Card */}
                        <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold text-white mb-1">{activeOrders}</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Orders</p>
                            </div>
                        </div>

                        {/* Customers Card */}
                        <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <Users className="w-5 h-5 text-purple-400" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold text-white mb-1">{customersCount || 0}</h3>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Customers</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Inventory Alert Card (Visible to Everyone) */}
                <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <Package className="w-5 h-5 text-orange-400" />
                        </div>
                        {outOfStockProducts.length > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                {outOfStockProducts.length} Out!
                            </span>
                        )}
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-white mb-1">{lowStockProducts.length}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Low Stock Items</p>
                    </div>
                </div>
            </div>

            {/* Needs Attention Panel */}
            <div className="w-full rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl p-8 relative">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Attention Required
                </h3>

                {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-white/[0.02] rounded-2xl border border-white/5">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                            <span className="text-green-400 text-xl">✓</span>
                        </div>
                        <p className="text-sm font-medium text-white">All Clear</p>
                        <p className="text-xs text-gray-500 mt-1">Inventory levels are healthy.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {outOfStockProducts.slice(0, 3).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black/50 overflow-hidden flex items-center justify-center">
                                        <Package className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{p.title}</p>
                                        <p className="text-xs text-red-400">Out of Stock</p>
                                    </div>
                                </div>
                                <Link href={`/admin/products/${p.id}`} className="text-xs font-semibold text-white hover:text-red-400 transition-colors">Restock</Link>
                            </div>
                        ))}
                        {lowStockProducts.slice(0, 3).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black/50 overflow-hidden flex items-center justify-center">
                                        <Package className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{p.title}</p>
                                        <p className="text-xs text-orange-400">Only {p.stock} left in stock</p>
                                    </div>
                                </div>
                                <Link href={`/admin/products/${p.id}`} className="text-xs font-semibold text-white hover:text-orange-400 transition-colors">Order More</Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

