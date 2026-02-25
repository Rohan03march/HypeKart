"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackagePlus, DollarSign, Archive, Type, Image as ImageIcon, Tag, Hash, FileText, Plus, X, UploadCloud, Link as LinkIcon } from "lucide-react";
import { createProductAction } from "@/app/admin/products/actions";

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewProductModal({ isOpen, onClose }: NewProductModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        base_price: "",
        stock: "10",
        sizes: "S, M, L",
        colors: "Black, White",
    });

    type ImageAsset = { type: 'file', file: File, preview: string } | { type: 'url', url: string };
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [urlInput, setUrlInput] = useState("");

    if (!isOpen) return null;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImages(prev => [...prev, { type: 'file', file, preview: url }]);
        }
    };

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            setImages(prev => [...prev, { type: 'url', url: urlInput.trim() }]);
            setUrlInput("");
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const finalImageUrls: string[] = [];

            for (const img of images) {
                if (img.type === 'url') {
                    finalImageUrls.push(img.url);
                } else if (img.type === 'file') {
                    const uploadData = new FormData();
                    uploadData.append("file", img.file);
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
                    if (!uploadRes.ok) throw new Error("Image upload failed");
                    const uploadResult = await uploadRes.json();
                    finalImageUrls.push(uploadResult.secure_url);
                }
            }

            const sizesList = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
            const colorsList = formData.colors.split(',').map(c => c.trim()).filter(Boolean);

            const newProduct = {
                title: formData.title,
                description: formData.description,
                base_price: parseFloat(formData.base_price),
                stock: parseInt(formData.stock, 10),
                sizes: sizesList.length > 0 ? sizesList : ['OS'],
                colors: colorsList.length > 0 ? colorsList : ['Default'],
                images: finalImageUrls,
                is_new_arrival: true
            };

            await createProductAction(newProduct);

            // Reset state
            setFormData({ title: "", description: "", base_price: "", stock: "10", sizes: "S, M, L", colors: "Black, White" });
            setImages([]);

            router.refresh();
            onClose();

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal Content */}
            <div className="relative w-full h-full overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-3xl flex flex-col">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-10 py-8 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
                    <div>
                        <h2 className="text-2xl font-light tracking-tight text-white mb-1">New Drop Initialization</h2>
                        <p className="text-sm text-gray-400 font-medium">Add a new premium piece to the catalog.</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-10 relative z-10 max-w-5xl mx-auto w-full">
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 shadow-lg mb-8 flex items-center gap-3">
                            <span className="font-semibold text-red-400">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="flex flex-col gap-8">

                        {/* Media Gallery Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-zinc-300 ml-1">Product Gallery</label>
                            <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl bg-black/40">
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                                <img src={img.type === 'file' ? img.preview : img.url} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {idx === 0 && (
                                                    <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">Primary</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <label className="flex-1 flex flex-col items-center justify-center gap-2 py-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-white">Upload File</span>
                                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                    </label>
                                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest hidden md:block">OR</div>
                                    <div className="flex-1 flex flex-col w-full h-full justify-between gap-3">
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="relative flex-1 group/btn">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-4 w-4 text-zinc-500 group-focus-within/btn:text-white transition-colors" /></div>
                                                <input type="url" placeholder="https://images..." className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-xl py-3 pl-10 pr-3 outline-none text-sm" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                                            </div>
                                            <button type="button" onClick={handleAddUrl} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition-colors shadow-lg">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium text-center">Add high-resolution image URLs directly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="title" className="text-sm font-semibold text-zinc-300 ml-1">Product Title</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Type className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <input id="title" required placeholder="e.g. Obscura Heavyweight Hoodie" className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium text-lg" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="basePrice" className="text-sm font-semibold text-zinc-300 ml-1">Base Price (₹)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><DollarSign className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <input id="basePrice" type="number" step="0.01" min="0" required placeholder="120.00" className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="stock" className="text-sm font-semibold text-zinc-300 ml-1">Initial Stock</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Archive className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <input id="stock" type="number" min="0" required placeholder="50" className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="sizes" className="text-sm font-semibold text-zinc-300 ml-1">Sizes (Comma Separated)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <input id="sizes" type="text" required placeholder="S, M, L, XL" className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="colors" className="text-sm font-semibold text-zinc-300 ml-1">Colors (Comma Separated)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <input id="colors" type="text" required placeholder="Washed Black, Vintage Grey" className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="description" className="text-sm font-semibold text-zinc-300 ml-1">Product Description</label>
                                <div className="relative group/input">
                                    <div className="absolute top-4 left-0 pl-4 flex pointer-events-none"><FileText className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                    <textarea id="description" rows={4} placeholder="Crafted from 400gsm French Terry cotton..." className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-4 border-t border-white/5 pb-8">
                            <button
                                type="submit"
                                disabled={loading || images.length === 0}
                                className="flex items-center justify-center gap-3 bg-white text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all rounded-2xl py-4 px-8 cursor-pointer group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                                ) : (
                                    <>
                                        <span className="text-[15px]">Launch Product</span>
                                        <PackagePlus className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
