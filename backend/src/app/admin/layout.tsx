import { Sidebar } from "@/components/admin/Sidebar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { getActiveAdminRoleAction } from "@/app/admin/team/actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const userRole = await getActiveAdminRoleAction();
    const roleDisplay = userRole === 'super_admin' ? 'Super Admin Online' : userRole === 'inventory_manager' ? 'Inventory Manager' : 'Admin Online';

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] font-sans text-gray-100 overflow-hidden relative">

            {/* Subtle Aurora Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-500/10 blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-purple-500/10 blur-[120px] pointer-events-none mix-blend-screen" />

            <Sidebar />

            <div className="flex flex-1 flex-col z-10">
                {/* Header Navbar */}
                <header className="flex h-20 items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-3xl px-10 sticky top-0 z-20">
                    <div className="flex-1">
                        <h2 className="text-sm font-medium text-gray-400 tracking-wide">Command Center</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                            <span className="font-medium text-white uppercase tracking-wider text-[11px]">{roleDisplay}</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />


                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
