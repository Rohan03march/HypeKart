import Link from "next/link";
import { Plus, MoreHorizontal, Shield, Mail } from "lucide-react";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import TeamRowActions from "@/components/admin/TeamRowActions";

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch admins from Supabase users table
    const { data: admins, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .in('role', ['admin', 'super_admin', 'inventory_manager'])
        .order('created_at', { ascending: false });

    const displayAdmins = admins || [];

    // Determine the current logged-in user's role to apply conditional UI
    const currentUserProfile = displayAdmins.find(a => a.id === user?.id);
    const isSuperAdmin = !currentUserProfile || currentUserProfile.role === 'admin' || currentUserProfile.role === 'super_admin';

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Team Hub</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage administrators and platform access.</p>
                </div>
                {isSuperAdmin && (
                    <Link
                        href="/admin/team/new"
                        className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        Invite Admin
                    </Link>
                )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl relative">
                {/* Subtle gradient overlay for the table container */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="w-full">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Personnel</th>
                                <th scope="col" className="px-6 py-5">Contact</th>
                                <th scope="col" className="px-6 py-5">Role Level</th>
                                <th scope="col" className="px-6 py-5">Status</th>
                                {isSuperAdmin && (
                                    <th scope="col" className="px-8 py-5 text-right">Access Controls</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <Shield className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-white text-lg">No Admins Found</p>
                                            <p className="text-sm text-gray-500 mt-1">You must be operating solo! Invite a team member.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayAdmins.map((admin) => {
                                    const initial = admin.full_name ? admin.full_name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase();
                                    const status = admin.onboarding_completed ? 'Active' : 'Pending Verification';
                                    const roleDisplay = admin.role === 'super_admin' ? 'Super Administrator' : admin.role === 'inventory_manager' ? 'Inventory Manager' : 'Administrator';

                                    return (
                                        <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                            <td className="px-8 py-5 font-medium text-white whitespace-nowrap flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center font-bold text-gray-400">
                                                    <img
                                                        src={admin.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(admin.email)}&backgroundColor=transparent`}
                                                        alt={admin.full_name || 'Admin'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {admin.full_name || "Guest Colleague"}
                                            </td>
                                            <td className="px-6 py-5 text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {admin.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                                                    {roleDisplay}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${admin.onboarding_completed
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-8 py-5 text-right">
                                                    <TeamRowActions adminId={admin.id} adminName={admin.full_name} isActive={admin.onboarding_completed} />
                                                </td>
                                            )}
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
