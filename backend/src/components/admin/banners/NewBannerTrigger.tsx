"use client";

import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NewBannerTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [imageUrl, setImageUrl] = useState("");
    const [link, setLink] = useState("");
    const [orderIndex, setOrderIndex] = useState(0);

    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setImageUrl(data.url);
        } catch (err: any) {
            setError(err.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: imageUrl,
                    link: link || null,
                    order_index: orderIndex,
                    is_active: true
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create banner");
            }

            setIsOpen(false);
            setImageUrl("");
            setLink("");
            setOrderIndex(0);
            window.location.reload();
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
                    New Banner
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
                    <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl my-8">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-semibold text-white mb-6">Create New Banner</h2>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
                                {imageUrl ? (
                                    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden mb-2 border border-white/10 group">
                                        <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setImageUrl("")}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-white/20 transition-colors bg-[#0a0a0a]">
                                        <div className="space-y-2 text-center">
                                            {uploadingImage ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                                            ) : (
                                                <Upload className="mx-auto h-8 w-8 text-gray-500" />
                                            )}
                                            <div className="flex text-sm text-gray-400 justify-center">
                                                <label htmlFor="banner-upload" className="relative cursor-pointer rounded-md font-medium text-white hover:text-gray-300">
                                                    <span>{uploadingImage ? "Uploading..." : "Upload a file"}</span>
                                                    <input id="banner-upload" name="banner-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">Wide aspect ratio recommended (e.g. 1024x400)</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Link (Optional)</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="e.g. /category/footwear or /product/123"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">The path users will be navigated to in the app when tapped.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    value={orderIndex}
                                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-2">Lower numbers appear first.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !imageUrl}
                                className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 mt-4"
                            >
                                {isLoading ? "Creating..." : "Publish Banner"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
