"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, ShoppingCart, Users, LayoutDashboard, Settings, Shield, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface NavItem {
    name: string;
    href: string;
    icon: any;
    allowedRoles: string[];
}

const navItems: NavItem[] = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard, allowedRoles: ['super_admin', 'admin', 'inventory_manager'] },
    { name: "Products", href: "/admin/products", icon: Package, allowedRoles: ['super_admin', 'admin', 'inventory_manager'] },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart, allowedRoles: ['super_admin', 'admin'] },
    { name: "Customers", href: "/admin/customers", icon: Users, allowedRoles: ['super_admin', 'admin'] },
    { name: "Team", href: "/admin/team", icon: Shield, allowedRoles: ['super_admin', 'admin'] },
    { name: "Settings", href: "/admin/settings", icon: Settings, allowedRoles: ['super_admin', 'admin'] },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const [userRole, setUserRole] = useState<string>("admin");
    const [userEmail, setUserEmail] = useState<string>("admin@hypekart.com");
    const [userName, setUserName] = useState<string>("Administrator");
    const [userAvatar, setUserAvatar] = useState<string>("https://api.dicebear.com/7.x/micah/svg?seed=AdminUser&backgroundColor=transparent");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const email = user.email || "admin@hypekart.com";
                const name = user.user_metadata?.full_name || "Administrator";
                const role = user.user_metadata?.role || "admin";

                setUserEmail(email);
                setUserName(name);
                setUserRole(role);
                // Generate a consistent but random-looking avatar based on their email
                setUserAvatar(`https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(email)}&backgroundColor=transparent`);
            }
        };
        fetchUser();
    }, [supabase.auth]);

    // Filter Navigation Items based on the active user's role
    const visibleNavItems = navItems.filter(item => item.allowedRoles.includes(userRole));

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <div className="flex h-screen w-72 flex-col border-r border-[#ffffff10] bg-[#050505]/80 backdrop-blur-2xl">
            {/* Header/Brand */}
            <div className="flex h-20 items-center px-8 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg">
                        H
                    </div>
                    <Link href="/admin" className="font-bold text-lg tracking-widest text-white uppercase">
                        HypeKart
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 px-4">
                <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Management
                </p>
                <nav className="grid items-start gap-1 font-medium">
                    {visibleNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                                    isActive
                                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] font-semibold"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-gray-500")} />
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Area */}
            <div className="p-6 mt-auto">
                {/* System Status */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md mb-4 hidden 2xl:block">
                    <p className="text-xs text-gray-400 mb-2 font-medium">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-white font-medium">All systems operational</span>
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                        <img
                            src={userAvatar}
                            alt="Admin Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
