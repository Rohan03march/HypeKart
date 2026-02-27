import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import StatusChanger from "./StatusChanger";

export const dynamic = 'force-dynamic';

const statusColorMap: Record<string, string> = {
    Placed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shipped: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Out for Delivery': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !order) notFound();

    const addr = (order.shipping_address as any) ?? {};
    const items: any[] = (order.order_items as any[]) ?? [];
    const statusColors = statusColorMap[order.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/orders"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-light tracking-tight text-white">
                            Order <span className="font-mono text-xl text-gray-400">{order.id.split('-')[0].toUpperCase()}</span>
                        </h1>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusColors}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{date}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column — Items + Status */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Order Items */}
                    <div className="rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                            <Package className="h-4 w-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-white">Order Items</h2>
                            <span className="ml-auto text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        </div>

                        {items.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500 text-sm">No items recorded for this order.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-xl object-cover bg-white/5 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <Package className="h-6 w-6 text-gray-600" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                            <div className="flex flex-wrap gap-x-3 mt-1">
                                                {item.size && (
                                                    <span className="text-xs text-gray-500">Size: <span className="text-gray-300">{item.size}</span></span>
                                                )}
                                                {item.color && (
                                                    <span className="text-xs text-gray-500">Color: <span className="text-gray-300 capitalize">{item.color}</span></span>
                                                )}
                                                <span className="text-xs text-gray-500">Qty: <span className="text-gray-300">{item.quantity}</span></span>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">₹{Number(item.price).toLocaleString('en-IN')} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Totals footer */}
                        <div className="border-t border-white/5 px-6 py-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Subtotal</span>
                                <span>₹{items.reduce((s: number, i: any) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold text-white">
                                <span>Total Charged</span>
                                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Management */}
                    <div className="rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                            <h2 className="text-sm font-semibold text-white">Update Status</h2>
                        </div>
                        <div className="px-6 py-5">
                            <StatusChanger orderId={order.id} currentStatus={order.status} />
                        </div>
                    </div>
                </div>

                {/* Right Column — Shipping + Payment */}
                <div className="flex flex-col gap-6">

                    {/* Shipping Address */}
                    <div className="rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
                        </div>
                        <div className="px-6 py-5 space-y-1.5">
                            {addr.full_name && <p className="text-sm font-semibold text-white">{addr.full_name}</p>}
                            {addr.phone && <p className="text-xs text-gray-400">{addr.phone}</p>}
                            {addr.address && <p className="text-xs text-gray-400 mt-2">{addr.address}</p>}
                            {(addr.city || addr.state || addr.pincode) && (
                                <p className="text-xs text-gray-400">
                                    {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {!addr.full_name && !addr.address && (
                                <p className="text-sm text-gray-600">No address recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-white">Payment</h2>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Razorpay Payment ID</p>
                                <p className="text-sm font-mono text-gray-200 break-all">
                                    {order.payment_id || <span className="text-gray-600">Not available</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount Paid</p>
                                <p className="text-lg font-bold text-white">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Method</p>
                                <p className="text-sm text-gray-300">Razorpay</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Meta */}
                    <div className="rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl overflow-hidden">
                        <div className="px-6 py-5 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
                                <p className="text-xs font-mono text-gray-400 break-all">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Placed On</p>
                                <p className="text-sm text-gray-300">{date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
