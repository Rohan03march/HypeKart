"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, ShieldAlert, Power, CheckCircle2, X } from "lucide-react";
import { revokeAdminAccessAction, toggleAdminStatusAction } from "@/app/admin/team/actions";
import { useRouter } from "next/navigation";

export default function TeamRowActions({ adminId, adminName, isActive }: { adminId: string, adminName?: string, isActive: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleRevoke = async () => {
        const confirmRevoke = window.confirm(`Are you sure you want to completely revoke access for ${adminName || 'this administrator'}? This action cannot be undone.`);

        if (confirmRevoke) {
            setIsLoading(true);
            try {
                const result = await revokeAdminAccessAction(adminId);
                if (result.success) {
                    setIsOpen(false);
                    router.refresh();
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                console.error(error);
                alert("An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const result = await toggleAdminStatusAction(adminId, isActive);
            if (result.success) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPermissions = () => {
        setIsOpen(false);
        setIsEditModalOpen(true);
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl z-[60] overflow-hidden origin-top-right transform transition-all duration-200 ease-out">
                    <div className="p-1">
                        <button
                            onClick={handleEditPermissions}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Edit Permissions
                        </button>
                        <button
                            onClick={handleToggleStatus}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50 ${isActive ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}`}
                            disabled={isLoading}
                        >
                            <Power className="w-4 h-4" />
                            {isActive ? "Inactive User" : "Active User"}
                        </button>
                        <div className="h-px w-full bg-white/5 my-1" />
                        <button
                            onClick={handleRevoke}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium cursor-pointer disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isLoading ? "Revoking..." : "Revoke Access"}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal (Visual Mockup for now until Granular Role-Based Access Control is enforced on DB schema) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] shadow-2xl flex flex-col overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none rounded-full" />

                        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#111111]/80 backdrop-blur-xl">
                            <div>
                                <h2 className="text-lg font-bold text-white mb-0.5">Edit Permissions</h2>
                                <p className="text-xs text-gray-400 font-medium">{adminName}'s Access Level</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                <div>
                                    <p className="text-sm font-semibold text-white">Super Administrator</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Full unrestricted access to all modules.</p>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5 opacity-50 cursor-not-allowed">
                                <div>
                                    <p className="text-sm font-semibold text-gray-300">Inventory Manager</p>
                                    <p className="text-xs text-gray-600 mt-0.5">Can only manage products and stock.</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border border-gray-600" />
                            </div>

                            <p className="text-[10px] text-center text-purple-400 mt-2 font-bold uppercase tracking-widest">Granular Custom Roles Coming Soon</p>

                            <button onClick={() => { alert("Permissions successfully saved!"); setIsEditModalOpen(false); }} className="mt-2 w-full bg-white text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all rounded-xl py-3.5 cursor-pointer">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
