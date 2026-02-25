import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-gray-200 rounded-full blur-[100px] opacity-70" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-gray-300 rounded-full blur-[120px] opacity-50" />

            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                {/* Logo / Branding */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl mb-4">
                        H
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-black uppercase">
                        HypeKart
                    </h1>
                    <p className="text-sm font-medium text-gray-500 tracking-widest mt-1">
                        PREMIUM ADMIN
                    </p>
                </div>

                {/* Auth Forms */}
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
