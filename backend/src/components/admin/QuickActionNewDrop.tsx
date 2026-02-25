"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import NewProductModal from "./NewProductModal";

export default function QuickActionNewDrop() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left cursor-pointer"
            >
                <span className="font-medium text-sm text-white">Add New Product</span>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Plus className="w-4 h-4" />
                </div>
            </button>

            <NewProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
