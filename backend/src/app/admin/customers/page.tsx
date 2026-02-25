import Link from "next/link";
import { MoreHorizontal, Download, Mail } from "lucide-react";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
    // Fetch customers from Supabase users table
    const { data: customers, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

    // Handle empty state gracefully
    const displayCustomers = customers || [];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Customers</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage and understand your customer base.</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-300">
                    <Download className="h-4 w-4" />
                    Export Segment
                </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Customer Profile</th>
                                <th scope="col" className="px-6 py-5">Contact</th>
                                <th scope="col" className="px-6 py-5">Joined Date</th>
                                <th scope="col" className="px-6 py-5">Verification</th>
                                <th scope="col" className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <span className="text-2xl text-gray-400">✧</span>
                                            </div>
                                            <p className="font-medium text-white text-lg">No Customers Found</p>
                                            <p className="text-sm text-gray-500 mt-1">Wait for users to create an account.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayCustomers.map((customer) => {
                                    const joinDate = new Date(customer.created_at).toLocaleDateString('en-IN', {
                                        timeZone: 'Asia/Kolkata',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });
                                    const initial = customer.full_name ? customer.full_name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase();

                                    return (
                                        <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                            <td className="px-8 py-5 font-medium text-white flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center text-gray-400 font-bold">
                                                    {customer.avatar_url ? (
                                                        <Image src={customer.avatar_url} alt={customer.full_name || 'Customer'} fill className="object-cover" />
                                                    ) : (
                                                        <span>{initial}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-white font-semibold tracking-wide">{customer.full_name || "Guest User"}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {customer.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-300">{joinDate}</td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${customer.onboarding_completed
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    }`}>
                                                    {customer.onboarding_completed ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
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
