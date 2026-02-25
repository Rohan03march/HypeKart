export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white dark:text-white">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Manage your storefront preferences and account details.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl dark:bg-black/40 text-center">
                <p className="text-zinc-500 font-medium tracking-wide uppercase text-sm mt-8 mb-8">
                    Configuration options unavailable in demo mode.
                </p>
            </div>
        </div>
    );
}
