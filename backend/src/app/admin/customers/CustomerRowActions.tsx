"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Ban } from "lucide-react";
import { deleteCustomerAction, banCustomerAction } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerRowActions({ clerkId, customerName, customerId }: { clerkId: string, customerId: string, customerName?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${customerName || 'this user'}? This action cannot be undone and will remove them from the platform entirely.`);

        if (confirmDelete) {
            setIsLoading(true);
            try {
                const result = await deleteCustomerAction(clerkId);
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

    const handleBan = async () => {
        const confirmBan = window.confirm(`Are you sure you want to deactivate/ban ${customerName || 'this user'}? They will no longer be able to log in.`);

        if (confirmBan) {
            setIsLoading(true);
            try {
                const result = await banCustomerAction(clerkId);
                if (result.success) {
                    setIsOpen(false);
                    alert("User successfully banned/deactivated.");
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
    }

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
                        <Link
                            href={`/admin/customers/${customerId}`}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                            View Details
                        </Link>
                        <button
                            onClick={handleBan}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Ban className="w-4 h-4" />
                            {isLoading ? "Processing..." : "Deactivate User"}
                        </button>
                        <div className="h-px w-full bg-white/5 my-1" />
                        <button
                            onClick={handleDelete}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium cursor-pointer disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isLoading ? "Deleting..." : "Delete Permanently"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
