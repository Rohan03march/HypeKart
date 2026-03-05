"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, DollarSign, Archive, Type, Tag, Hash, FileText, Plus, X, UploadCloud, Link as LinkIcon, PenSquare } from "lucide-react";
import { updateProductAction } from "@/app/admin/products/actions";

interface EditProductFormProps {
    product: any;
}

export default function EditProductForm({ product }: EditProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const initialCategoryFull = product?.category || "Men - Top";
    const parts = initialCategoryFull.split(' - ');
    const initialMainCat = ["Men", "Women", "Kids", "Oversize"].includes(parts[0]) ? parts[0] : "Men";

    let initialSubCat = "Top";
    let initialItemType = "Top";

    if (initialMainCat === 'Kids') {
        initialSubCat = parts[1] || "Boy";
    } else if (initialMainCat === 'Oversize') {
        initialSubCat = parts[1] || "Men";
        initialItemType = parts[2] || "Top";
    } else {
        initialSubCat = parts[1] || "Top";
    }

    const [formData, setFormData] = useState({
        title: product?.title || "",
        description: product?.description || "",
        base_price: product?.base_price?.toString() || "",
        stock: product?.stock?.toString() || "0",
        sizes: product?.sizes?.join(', ') || "",
        colors: product?.colors?.join(', ') || "",
        mainCategory: initialMainCat,
        subCategory: initialSubCat,
        itemType: initialItemType,
    });

    type ImageAsset = { type: 'file', file: File, preview: string } | { type: 'url', url: string, isExisting: boolean };
    const [images, setImages] = useState<ImageAsset[]>(
        product?.images?.map((url: string) => ({ type: 'url', url, isExisting: true })) || []
    );
    const [urlInput, setUrlInput] = useState("");

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImages(prev => [...prev, { type: 'file', file, preview: url }]);
        }
    };

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            setImages(prev => [...prev, { type: 'url', url: urlInput.trim(), isExisting: false }]);
            setUrlInput("");
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = async (e: React.FormEvent) => {
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

            const sizesList = formData.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
            const colorsList = formData.colors.split(',').map((c: string) => c.trim()).filter(Boolean);

            const finalCategory = formData.mainCategory === 'Oversize'
                ? `${formData.mainCategory} - ${formData.subCategory} - ${formData.itemType}`
                : `${formData.mainCategory} - ${formData.subCategory}`;

            const updatedProduct = {
                title: formData.title,
                description: formData.description,
                base_price: parseFloat(formData.base_price),
                stock: parseInt(formData.stock, 10),
                sizes: sizesList.length > 0 ? sizesList : ['OS'],
                colors: colorsList.length > 0 ? colorsList : ['Default'],
                category: finalCategory,
                images: finalImageUrls,
                is_new_arrival: product.is_new_arrival
            };

            await updateProductAction(product.id, updatedProduct);

            router.push('/admin/products');
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 shadow-lg mb-8 flex items-center gap-3">
                    <span className="font-semibold text-red-400">Error:</span> {error}
                </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-8 w-full max-w-6xl">

                {/* Media Gallery Section */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-zinc-300 ml-1">Product Gallery</label>
                    <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl bg-[#111111]/80 backdrop-blur-xl">
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
                        <label htmlFor="stock" className="text-sm font-semibold text-zinc-300 ml-1">Total Stock</label>
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
                    <div className="space-y-4 md:col-span-1">
                        <div className="space-y-2">
                            <label htmlFor="mainCategory" className="text-sm font-semibold text-zinc-300 ml-1">Main Category</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><LinkIcon className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                                <select id="mainCategory" required className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium appearance-none" value={formData.mainCategory} onChange={(e) => {
                                    const newMain = e.target.value;
                                    let newSub = "Top";
                                    if (newMain === 'Kids') newSub = "Boy";
                                    else if (newMain === 'Oversize') newSub = "Men";
                                    setFormData({ ...formData, mainCategory: newMain, subCategory: newSub, itemType: "Top" });
                                }}>
                                    <option value="Men" className="bg-black text-white">Men</option>
                                    <option value="Women" className="bg-black text-white">Women</option>
                                    <option value="Kids" className="bg-black text-white">Kids</option>
                                    <option value="Oversize" className="bg-black text-white">Oversize</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label htmlFor="subCategory" className="text-sm font-semibold text-zinc-300 ml-1">
                                {formData.mainCategory === 'Kids' ? 'Gender' : formData.mainCategory === 'Oversize' ? 'Gender' : 'Category'}
                            </label>
                            <div className="relative group/input">
                                <select id="subCategory" required className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 px-4 outline-none font-medium appearance-none" value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}>
                                    {formData.mainCategory === 'Kids' ? (
                                        <>
                                            <option value="Boy" className="bg-black text-white">Boy</option>
                                            <option value="Girl" className="bg-black text-white">Girl</option>
                                        </>
                                    ) : formData.mainCategory === 'Oversize' ? (
                                        <>
                                            <option value="Men" className="bg-black text-white">Men</option>
                                            <option value="Women" className="bg-black text-white">Women</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Top" className="bg-black text-white">Top</option>
                                            <option value="Bottoms" className="bg-black text-white">Bottoms</option>
                                            <option value="Footwear" className="bg-black text-white">Footwear</option>
                                            <option value="Accessories" className="bg-black text-white">Accessories</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        {formData.mainCategory === 'Oversize' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="itemType" className="text-sm font-semibold text-zinc-300 ml-1">Category</label>
                                <div className="relative group/input">
                                    <select id="itemType" required className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 px-4 outline-none font-medium appearance-none" value={formData.itemType} onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}>
                                        <option value="Top" className="bg-black text-white">Top</option>
                                        <option value="Bottoms" className="bg-black text-white">Bottoms</option>
                                        <option value="Footwear" className="bg-black text-white">Footwear</option>
                                        <option value="Accessories" className="bg-black text-white">Accessories</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="description" className="text-sm font-semibold text-zinc-300 ml-1">Product Description</label>
                        <div className="relative group/input">
                            <div className="absolute top-4 left-0 pl-4 flex pointer-events-none"><FileText className="h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" /></div>
                            <textarea id="description" rows={4} placeholder="Crafted from 400gsm French Terry cotton..." className="w-full bg-black/50 border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-white/5 pb-8">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        disabled={loading}
                        className="flex items-center justify-center px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold tracking-wide transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || images.length === 0}
                        className="flex items-center justify-center gap-3 bg-white text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all rounded-2xl py-4 px-8 cursor-pointer group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-black" />
                        ) : (
                            <>
                                <span className="text-[15px]">Save Adjustments</span>
                                <PenSquare className="h-5 w-5 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
