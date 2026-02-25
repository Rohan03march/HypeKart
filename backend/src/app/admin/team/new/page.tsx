import { supabaseAdmin } from "@/lib/supabase";
import { ArrowLeft, UserPlus, Shield, Mail, User, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function NewAdminPage() {

    // Server Action to handle form submission
    async function createAdmin(formData: FormData) {
        'use server';

        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as string || 'inventory_manager';

        // 1. Create User in Supabase Auth securely
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role
            }
        });

        if (authError || !authData.user) {
            console.error('Failed to create auth admin:', authError);
            throw new Error(authError?.message || 'Failed to create administrator account');
        }

        // 2. Insert into Supabase `users` public table as 'admin' 
        // Note: clerk_id here serves as our internal tracking since we migrated from clerk, we will use the supabase user ID.
        const { error: dbError } = await supabaseAdmin.from('users').insert({
            id: authData.user.id,
            clerk_id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
            onboarding_completed: true // auto-verify internal staff
        });

        if (dbError) {
            console.error('Failed to insert admin record:', dbError);
            // Optionally delete auth user here to rollback
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new Error('Failed to create administrator profile');
        }

        // 2. Redirect back to team page
        redirect('/admin/team');
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">

            {/* Header & Back Navigation */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <Link href="/admin/team" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-1">Invite New Administrator</h1>
                    <p className="text-sm text-gray-400 font-medium">Provision platform access for a new team member.</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-hidden p-8 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />

                <form action={createAdmin} className="relative z-10 flex flex-col gap-6">

                    {/* Full Name Input */}
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-semibold text-zinc-300 ml-1">Full Name</label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-zinc-500 group-focus-within/input:text-purple-400 transition-colors" />
                            </div>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                placeholder="Steve Jobs"
                                className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-zinc-300 ml-1">Work Email Address</label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-zinc-500 group-focus-within/input:text-purple-400 transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="steve@hypekart.com"
                                className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-zinc-300 ml-1">Temporary Password</label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-zinc-500 group-focus-within/input:text-purple-400 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-semibold text-zinc-300 ml-1">Access Role</label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Shield className="h-5 w-5 text-zinc-500 group-focus-within/input:text-purple-400 transition-colors" />
                            </div>
                            <select
                                id="role"
                                name="role"
                                required
                                defaultValue="inventory_manager"
                                className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium appearance-none cursor-pointer"
                            >
                                <option value="super_admin">Super Administrator (Full System Access)</option>
                                <option value="inventory_manager">Inventory Manager (No Access Controls)</option>
                            </select>
                        </div>
                    </div>

                    {/* Role Notice */}
                    <div className="mt-2 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex gap-4">
                        <div className="mt-1">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-purple-100">Granular Role Selection</p>
                            <p className="text-xs text-purple-300/70 mt-1 leading-relaxed">
                                Super Administrators have full read/write/access control across the platform. Inventory Managers are restricted from viewing or mutating the administration team structure.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        className="mt-6 flex items-center justify-center gap-3 w-full bg-white text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-100 transition-all rounded-2xl py-4.5 cursor-pointer relative group overflow-hidden"
                    >
                        <span className="text-[15px]">Provision Account</span>
                        <UserPlus className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                </form>
            </div>
        </div>
    );
}
