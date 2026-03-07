"use client";

import { useState } from "react";
import { Upload, ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBannerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [imageUrl, setImageUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [ctaText, setCtaText] = useState("");
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

    const computeLink = () => {
        if (linkMode === 'none') return '';
        if (linkMode === 'screen') return selectedScreen;
        if (linkMode === 'category') return selectedCategory ? `Catalog?category=${encodeURIComponent(selectedCategory)}` : '';
        if (linkMode === 'product') return selectedProduct ? `ProductDetails/${selectedProduct.id}` : '';
        return '';
    };

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
                    title: title || null,
                    description: description || null,
                    cta_text: ctaText || null,
                    link: finalLink || null,
                    order_index: orderIndex,
                    is_active: true
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create banner");
            }

            // Redirect back to banners page on success
            router.push('/admin/settings/banners');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/settings/banners"
                    className="p-3 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-1">Create New Banner</h1>
                    <p className="text-sm text-gray-400 font-medium">Add a new homepage banner to the mobile app.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Section */}
                <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-medium text-white mb-6">1. Banner Image</h2>
                    <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-xl border border-white/10 w-full max-w-sm">
                        {['upload', 'url'].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => { setImageInputMode(tab as any); setImageUrl(''); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${imageInputMode === tab
                                    ? 'bg-white text-black shadow-md'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab === 'upload' ? '⬆️ Upload File' : '🔗 Paste URL'}
                            </button>
                        ))}
                    </div>

                    {imageUrl ? (
                        <div className="relative aspect-[21/9] w-full max-w-2xl rounded-xl overflow-hidden mb-2 border border-white/10 group bg-black/50">
                            <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => setImageUrl("")}
                                    className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                                >
                                    Replace Image
                                </button>
                            </div>
                        </div>
                    ) : imageInputMode === 'upload' ? (
                        <div className="relative flex justify-center px-6 pt-10 pb-12 border-2 border-white/10 border-dashed rounded-xl hover:border-white/20 transition-colors bg-[#0a0a0a] max-w-2xl">
                            <div className="space-y-4 text-center">
                                {uploadingImage ? (
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                                ) : (
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                        <Upload className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex text-sm text-gray-400 justify-center">
                                    <label htmlFor="banner-upload" className="relative cursor-pointer rounded-md font-medium text-white hover:text-gray-300">
                                        <span>{uploadingImage ? "Uploading..." : "Click to upload a file"}</span>
                                        <input id="banner-upload" name="banner-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">Wide aspect ratio recommended (e.g. 1024x400)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-2xl">
                            <input
                                type="url"
                                placeholder="https://example.com/banner.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono"
                            />
                            <p className="text-xs text-gray-500">Paste a direct image URL (JPG, PNG, WebP, etc.)</p>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-medium text-white mb-6">2. Overlay Text <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span></h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Heading</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. New Season Drop"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Limited styles — shop before they're gone."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    placeholder="e.g. Shop All, Shop Women, Explore Now"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-2">Appears as a prominent tag/button on the mobile app.</p>
                            </div>
                        </div>

                        {/* Live Preview Display inside the form */}
                        <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-4 flex flex-col justify-center min-h-[200px]">
                            <p className="text-xs text-gray-500 font-medium mb-3 tracking-widest uppercase text-center">Mobile Overlay Preview</p>
                            <div className="relative w-full aspect-[2/1] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 mx-auto max-w-sm">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Bg" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        Image Preview
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    {ctaText && (
                                        <div className="inline-block px-3 py-1 mb-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                                            <span className="text-[10px] text-white font-bold">{ctaText.toUpperCase()}</span>
                                        </div>
                                    )}
                                    <h3 className="text-white font-bold text-lg mb-0.5">{title || "Banner Title"}</h3>
                                    <p className="text-gray-300 text-xs">{description || "Banner description appears here."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Target Link Section */}
                <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <h2 className="text-lg font-medium text-white mb-6">3. Target Action <span className="text-gray-500 text-sm font-normal ml-2">What happens when a user taps?</span></h2>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mb-6">
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
                                className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border text-sm font-medium transition-all ${linkMode === opt.mode
                                    ? 'bg-white text-black border-white shadow-lg'
                                    : 'bg-[#0a0a0a] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-2xl">
                        {linkMode === 'screen' && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-gray-400 mb-3">Which screen should this banner open?</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selectedScreen === s.route
                                                ? 'bg-white text-black border-white'
                                                : 'bg-[#0a0a0a] text-gray-300 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div>
                                                <div className="font-medium text-sm">{s.label}</div>
                                                <div className={`text-xs mt-0.5 ${selectedScreen === s.route ? 'text-gray-600' : 'text-gray-500'}`}>{s.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {linkMode === 'category' && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-gray-400 mb-3">Which category should this banner open?</p>
                                <div className="grid grid-cols-2 gap-3">
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
                                            className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${selectedCategory === cat.value
                                                ? 'bg-white text-black border-white'
                                                : 'bg-[#0a0a0a] text-gray-300 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {linkMode === 'product' && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-gray-400 mb-3">Search and select a product:</p>
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 mb-3"
                                />
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {loadingProducts ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    ) : products
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedProduct(p)}
                                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${selectedProduct?.id === p.id
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-[#0a0a0a] text-gray-300 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} className="w-10 h-10 object-cover rounded-lg bg-gray-900" alt="" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-sm">{p.name}</div>
                                                    <div className={`text-[11px] mt-0.5 font-mono ${selectedProduct?.id === p.id ? 'text-gray-600' : 'text-green-400'}`}>
                                                        ₹{Number(p.price).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {syncedLink && (
                            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">Generated Route:</span>
                                <code className="text-green-400 text-sm font-mono break-all">{syncedLink}</code>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Settings & Submit */}
                <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Display Order Priority</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={orderIndex}
                                onChange={(e) => setOrderIndex(Number(e.target.value))}
                                className="w-24 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono"
                            />
                            <p className="text-xs text-gray-500">Lower numbers appear first in the carousel.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !imageUrl}
                        className="py-4 px-8 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Publish Banner</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
