"use client";

import { useState } from "react";
import { MoreHorizontal, Trash, ArrowUp, ArrowDown } from "lucide-react";

export default function BannerRowActions({ banner }: { banner: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const toggleStatus = async () => {
        setIsToggling(true);
        try {
            await fetch(`/api/admin/banners/${banner.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !banner.is_active }),
            });
            window.location.reload();
        } catch (error) {
            console.error("Failed to toggle status");
        } finally {
            setIsToggling(false);
        }
    };

    const updateOrder = async (change: number) => {
        try {
            await fetch(`/api/admin/banners/${banner.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_index: banner.order_index + change }),
            });
            window.location.reload();
        } catch (error) {
            console.error("Failed to update order");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        setIsDeleting(true);
        try {
            await fetch(`/api/admin/banners/${banner.id}`, {
                method: "DELETE",
            });
            window.location.reload();
        } catch (error) {
            console.error("Failed to delete banner");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#111] shadow-2xl z-50 overflow-hidden">
                        <div className="p-1">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    updateOrder(-1);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ArrowUp className="w-4 h-4" /> Move Up
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    updateOrder(1);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <ArrowDown className="w-4 h-4" /> Move Down
                            </button>
                            <div className="h-px bg-white/10 my-1 mx-2" />
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    toggleStatus();
                                }}
                                disabled={isToggling}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors flex items-center justify-between"
                            >
                                {banner.is_active ? "Hide Banner" : "Show Banner"}
                                {isToggling && <span className="text-xs text-gray-500">...</span>}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleDelete();
                                }}
                                disabled={isDeleting}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
