"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, PenSquare } from "lucide-react";
import { deleteProductAction } from "@/app/admin/products/actions";
import { useRouter } from "next/navigation";
import EditProductModal from "./EditProductModal";

export default function ProductRowActions({ product }: { product: any }) {
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

    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Are you sure you want to completely delete "${product.title}"? This action cannot be undone.`);

        if (confirmDelete) {
            setIsLoading(true);
            try {
                const result = await deleteProductAction(product.id);
                if (result.success) {
                    setIsOpen(false);
                    router.refresh();
                } else {
                    alert(`Error: Deletion failed.`);
                }
            } catch (error) {
                console.error(error);
                alert("An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = () => {
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
                            onClick={handleEdit}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <PenSquare className="w-4 h-4" />
                            Edit Product
                        </button>
                        <div className="h-px w-full bg-white/5 my-1" />
                        <button
                            onClick={handleDelete}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium cursor-pointer disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isLoading ? "Deleting..." : "Delete Product"}
                        </button>
                    </div>
                </div>
            )}

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={product}
            />
        </div>
    );
}
