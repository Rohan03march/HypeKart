import { supabaseAdmin } from "@/lib/supabase";
import NewBannerTrigger from "@/components/admin/banners/NewBannerTrigger";
import BannerRowActions from "@/components/admin/banners/BannerRowActions";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
    const { data: banners } = await supabaseAdmin
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });

    const displayBanners = banners || [];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Homepage Banners</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage the hero carousel in the mobile app.</p>
                </div>
                <NewBannerTrigger />
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-visible relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />

                <div className="overflow-visible">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0a0a0a]/50 border-b border-white/5 font-bold tracking-widest">
                            <tr>
                                <th scope="col" className="px-8 py-5">Banner Preview</th>
                                <th scope="col" className="px-6 py-5">Target Link</th>
                                <th scope="col" className="px-6 py-5">Order</th>
                                <th scope="col" className="px-6 py-5">Status</th>
                                <th scope="col" className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayBanners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-white text-lg">No Banners Found</p>
                                            <p className="text-sm text-gray-500 mt-1">Upload an image to start engaging your users.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayBanners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-white/[0.02] transition-colors duration-200 group">
                                        <td className="px-8 py-5">
                                            <div className="h-16 w-36 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                                                <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                                                {!banner.is_active && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Hidden</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {banner.link ? (
                                                <span className="font-mono text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">{banner.link}</span>
                                            ) : (
                                                <span className="text-gray-500 italic">No link</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 font-mono">
                                            {banner.order_index}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${banner.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {banner.is_active ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <BannerRowActions banner={banner} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
