import Link from "next/link";
import { Plus } from "lucide-react";

export default function NewBannerTrigger() {
    return (
        <Link
            href="/admin/settings/banners/new"
            className="group relative px-6 py-3 bg-white text-black font-semibold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300 inline-block"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Banner
            </span>
        </Link>
    );
}
