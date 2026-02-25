"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2, Ban, CheckCircle } from "lucide-react";
import { deleteCustomerAction, banCustomerAction, unbanCustomerAction } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerRowActions({ clerkId, customerName, customerId }: { clerkId: string, customerId: string, customerName?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [coords, setCoords] = useState({ top: 0, right: 0, width: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle outside click and scroll
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = (e: Event) => {
            setIsOpen(false);
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                right: window.innerWidth - rect.right,
                width: rect.width,
            });
        }
        setIsOpen(!isOpen);
    };

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

    const handleUnban = async () => {
        const confirmUnban = window.confirm(`Are you sure you want to reactivate ${customerName || 'this user'}? They will be allowed to log in again.`);

        if (confirmUnban) {
            setIsLoading(true);
            try {
                const result = await unbanCustomerAction(clerkId);
                if (result.success) {
                    setIsOpen(false);
                    alert("User successfully reactivated.");
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
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {mounted && isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{ top: coords.top + 8, right: coords.right }}
                    className="absolute w-48 rounded-2xl border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl z-[100] overflow-hidden origin-top-right transform transition-all duration-200 ease-out"
                >
                    <div className="p-1">
                        <button
                            onClick={handleUnban}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-green-400 hover:text-green-300 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <CheckCircle className="w-4 h-4" />
                            {isLoading ? "Processing..." : "Activate User"}
                        </button>
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
                </div>,
                document.body
            )}
        </div>
    );
}
