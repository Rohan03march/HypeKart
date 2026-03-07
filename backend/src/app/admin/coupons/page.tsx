import { supabaseAdmin } from "@/lib/supabase";
import NewCouponTrigger from "@/components/admin/coupons/NewCouponTrigger";
import CouponRowActions from "@/components/admin/coupons/CouponRowActions";
import { Ticket } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
    const { data: coupons } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    const displayCoupons = coupons || [];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Coupons</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage promotional codes and discounts.</p>
                </div>
                <NewCouponTrigger />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-visible relative">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />

                <div className="overflow-visible">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Code</th>
                                <th scope="col" className="px-6 py-5">Value</th>
                                <th scope="col" className="px-6 py-5">Min. Order</th>
                                <th scope="col" className="px-6 py-5">Status</th>
                                <th scope="col" className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <Ticket className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-white text-lg">No Coupons Found</p>
                                            <p className="text-sm text-gray-500 mt-1">Create your first promo code to boost sales.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <Ticket className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <span className="font-mono text-white font-semibold tracking-wider">{coupon.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-300 font-medium">
                                            {coupon.discount_type === 'percentage'
                                                ? `${coupon.discount_value}% OFF`
                                                : `₹${Number(coupon.discount_value).toFixed(2)} OFF`}
                                        </td>
                                        <td className="px-6 py-5 text-gray-400">
                                            {coupon.min_order_value ? `₹${Number(coupon.min_order_value).toFixed(2)}` : 'None'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${coupon.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <CouponRowActions coupon={coupon} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
