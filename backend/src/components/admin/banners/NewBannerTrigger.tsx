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

    const [linkMode, setLinkMode] = useState<'none' | 'screen' | 'category' | 'product'>('none');
    const [selectedScreen, setSelectedScreen] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');


    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            setProducts(data.products || []);
        } catch { } finally {
            setLoadingProducts(false);
        }
    };

    // Auto-compute the `link` value whenever builder selections change
    const computeLink = () => {
        if (linkMode === 'none') return '';
        if (linkMode === 'screen') return selectedScreen;
        if (linkMode === 'category') return selectedCategory ? `Catalog?category=${encodeURIComponent(selectedCategory)}` : '';
        if (linkMode === 'product') return selectedProduct ? `ProductDetails/${selectedProduct.id}` : '';
        return '';
    };

    // Keep `link` in sync with builder
    const syncedLink = computeLink();


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

        const finalLink = computeLink();

        try {
            const res = await fetch("/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: imageUrl,
                    link: finalLink || null,
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
            setLinkMode('none');
            setSelectedScreen('');
            setSelectedCategory('');
            setSelectedProduct(null);
            setProductSearch('');
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

                                {/* Tab switcher */}
                                <div className="flex gap-1 mb-3 p-1 bg-white/5 rounded-xl border border-white/10">
                                    {['upload', 'url'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => { setImageInputMode(tab as any); setImageUrl(''); }}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${imageInputMode === tab
                                                ? 'bg-white text-black'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {tab === 'upload' ? '⬆️ Upload File' : '🔗 Paste URL'}
                                        </button>
                                    ))}
                                </div>

                                {/* Preview (shared) */}
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
                                ) : imageInputMode === 'upload' ? (
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
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/banner.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono"
                                        />
                                        <p className="text-xs text-gray-500">Paste a direct image URL (JPG, PNG, WebP, etc.)</p>
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Banner Link <span className="text-gray-600 font-normal">(Optional)</span></label>

                                {/* Step 1: What to link to */}
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        { mode: 'none', icon: '🚫', label: 'No Link' },
                                        { mode: 'screen', icon: '📱', label: 'App Screen' },
                                        { mode: 'category', icon: '🗂️', label: 'Category' },
                                        { mode: 'product', icon: '📦', label: 'Product' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.mode}
                                            type="button"
                                            onClick={() => {
                                                setLinkMode(opt.mode as any);
                                                setSelectedScreen('');
                                                setSelectedCategory('');
                                                setSelectedProduct(null);
                                                if (opt.mode === 'product') fetchProducts();
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${linkMode === opt.mode
                                                ? 'bg-white text-black border-white'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-lg">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Step 2: Screen selector */}
                                {linkMode === 'screen' && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">Which screen should this banner open?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { route: 'Home', label: '🏠 Home', desc: 'Main landing' },
                                                { route: 'Catalog', label: '🛍️ All Products', desc: 'Full catalog' },
                                                { route: 'Cart', label: '🛒 Cart', desc: 'Shopping cart' },
                                                { route: 'OrderHistory', label: '📦 Order History', desc: 'My orders' },
                                                { route: 'Profile', label: '👤 Profile', desc: 'User profile' },
                                                { route: 'Wishlist', label: '❤️ Wishlist', desc: 'Saved items' },
                                            ].map((s) => (
                                                <button
                                                    key={s.route}
                                                    type="button"
                                                    onClick={() => setSelectedScreen(s.route)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs transition-all ${selectedScreen === s.route
                                                        ? 'bg-white text-black border-white'
                                                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="font-medium">{s.label}</div>
                                                        <div className={`text-[10px] ${selectedScreen === s.route ? 'text-gray-500' : 'text-gray-500'}`}>{s.desc}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Category selector */}
                                {linkMode === 'category' && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">Which category should this banner open?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: 'Clothing', label: '👕 Clothing' },
                                                { value: 'Footwear', label: '👟 Footwear' },
                                                { value: 'Accessories', label: '🎒 Accessories' },
                                                { value: 'Sneakers', label: '👠 Sneakers' },
                                                { value: 'Footwear - Men', label: '👟 Footwear Men' },
                                                { value: 'Footwear - Women', label: '👠 Footwear Women' },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.value)}
                                                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${selectedCategory === cat.value
                                                        ? 'bg-white text-black border-white'
                                                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Product selector */}
                                {linkMode === 'product' && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">Search and select a product:</p>
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 mb-2"
                                        />
                                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                            {loadingProducts ? (
                                                <p className="text-xs text-gray-500 text-center py-4">Loading products...</p>
                                            ) : products
                                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                .map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setSelectedProduct(p)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left text-xs transition-all ${selectedProduct?.id === p.id
                                                            ? 'bg-white text-black border-white'
                                                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {p.images?.[0] && (
                                                            <img src={p.images[0]} className="w-8 h-8 object-cover rounded-lg" alt="" />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{p.name}</div>
                                                            <div className={`text-[10px] ${selectedProduct?.id === p.id ? 'text-gray-500' : 'text-gray-500'}`}>₹{Number(p.price).toLocaleString('en-IN')}</div>
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Preview of computed link */}
                                {syncedLink && (
                                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                                        <span className="text-gray-500 text-xs">Link:</span>
                                        <code className="text-green-400 text-xs font-mono">{syncedLink}</code>
                                    </div>
                                )}
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
