"use client";

import { useState } from "react";
import { Plus, X, Percent, DollarSign } from "lucide-react";

export default function NewCouponTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderValue, setMinOrderValue] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    discount_type: discountType,
                    discount_value: Number(discountValue),
                    min_order_value: minOrderValue ? Number(minOrderValue) : null,
                    is_active: true
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create coupon");
            }

            // Reset and close
            setIsOpen(false);
            setCode("");
            setDiscountValue("");
            setMinOrderValue("");
            window.location.reload(); // Refresh to show new coupon
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 bg-white text-black font-semibold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Coupon
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-semibold text-white mb-6">Create Coupon</h2>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Code</label>
                                <input
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. SUMMER10"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                                    <div className="flex gap-2 p-1 bg-[#0a0a0a] border border-white/10 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setDiscountType("percentage")}
                                            className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm transition-colors ${discountType === "percentage" ? "bg-white text-black font-medium" : "text-gray-400 hover:text-white"}`}
                                        >
                                            <Percent className="w-4 h-4" /> %
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDiscountType("fixed")}
                                            className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm transition-colors ${discountType === "fixed" ? "bg-white text-black font-medium" : "text-gray-400 hover:text-white"}`}
                                        >
                                            <DollarSign className="w-4 h-4" /> Fixed
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === "percentage" ? "10" : "50.00"}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Min. Order Value (Optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={minOrderValue}
                                    onChange={(e) => setMinOrderValue(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Creating..." : "Create Coupon"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
