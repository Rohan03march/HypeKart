import Link from "next/link";
import { FileText } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(`id, total_amount, status, created_at, shipping_address, payment_id`)
        .order('created_at', { ascending: false });

    const displayOrders = orders || [];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Orders</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage and fulfill your customer orders.</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-300">
                    <FileText className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Order ID</th>
                                <th scope="col" className="px-6 py-5">Customer</th>
                                <th scope="col" className="px-6 py-5">Date</th>
                                <th scope="col" className="px-6 py-5">Amount</th>
                                <th scope="col" className="px-6 py-5">Payment ID</th>
                                <th scope="col" className="px-6 py-5">Status</th>
                                <th scope="col" className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <span className="text-2xl text-gray-400">✧</span>
                                            </div>
                                            <p className="font-medium text-white text-lg">No Orders Yet</p>
                                            <p className="text-sm text-gray-500 mt-1">Waiting for the first purchase to arrive.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayOrders.map((order) => {
                                    const addr = order.shipping_address as any;
                                    const customerName = addr?.full_name || "Guest";
                                    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    });

                                    const statusColorMap: Record<string, string> = {
                                        Placed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
                                        Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                        Shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                                        'Out for Delivery': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                                        Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
                                        Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
                                    };
                                    const statusColors = statusColorMap[order.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';

                                    return (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                            <td className="px-8 py-5 font-medium text-white">
                                                <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-white/70 transition-colors">
                                                    {order.id.split('-')[0].toUpperCase()}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">{customerName}</td>
                                            <td className="px-6 py-5 text-gray-400">{date}</td>
                                            <td className="px-6 py-5 text-white font-medium">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-5">
                                                {order.payment_id ? (
                                                    <span className="font-mono text-xs text-gray-400">{order.payment_id}</span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusColors}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all duration-200"
                                                >
                                                    View Details
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
