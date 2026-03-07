"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Search, X } from "lucide-react";

const STATUS_COLOR_MAP: Record<string, string> = {
    Placed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Out for Delivery': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    'Return Requested': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function OrdersTable({ orders }: { orders: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOrders = orders.filter((order) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            order.id.toLowerCase().includes(q) ||
            order.id.split('-')[0].toUpperCase().includes(searchQuery.toUpperCase()) ||
            (order.payment_id && order.payment_id.toLowerCase().includes(q))
        );
    });

    return (
        <div className="flex flex-col gap-5">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by Order ID or Payment ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111]/80 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Table */}
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
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <Search className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <p className="font-medium text-white text-lg">No orders found</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {searchQuery ? `No results for "${searchQuery}"` : 'Waiting for the first purchase to arrive.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const addr = order.shipping_address as any;
                                    const customerName = addr?.full_name || "Guest";
                                    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    });
                                    const statusColors = STATUS_COLOR_MAP[order.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                                    const shortId = order.id.split('-')[0].toUpperCase();

                                    const highlightQuery = (text: string) => {
                                        if (!searchQuery.trim()) return text;
                                        const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
                                        if (idx === -1) return text;
                                        return (
                                            <>
                                                {text.slice(0, idx)}
                                                <mark className="bg-yellow-400/20 text-yellow-300 rounded px-0.5">
                                                    {text.slice(idx, idx + searchQuery.length)}
                                                </mark>
                                                {text.slice(idx + searchQuery.length)}
                                            </>
                                        );
                                    };

                                    return (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                            <td className="px-8 py-5 font-medium text-white">
                                                <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-white/70 transition-colors">
                                                    {highlightQuery(shortId)}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">{customerName}</td>
                                            <td className="px-6 py-5 text-gray-400">{date}</td>
                                            <td className="px-6 py-5 text-white font-medium">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-5">
                                                {order.payment_id ? (
                                                    <span className="font-mono text-xs text-gray-400">
                                                        {highlightQuery(order.payment_id)}
                                                    </span>
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
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all duration-200"
                                                    title="Edit / View Order"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {searchQuery && filteredOrders.length > 0 && (
                    <div className="px-8 py-4 border-t border-white/5 text-xs text-gray-500">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                )}
            </div>
        </div>
    );
}
