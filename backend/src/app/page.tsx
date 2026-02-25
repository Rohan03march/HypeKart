"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successful login, middleware will handle the redirect if we hard navigate
      // Use router.push so it hits the middleware
      router.push('/admin');
      router.refresh();

    } catch (error: any) {
      console.error('Login error:', error.message);
      setErrorMsg(error.message || "Invalid login credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black font-sans overflow-hidden selection:bg-white/30 text-white">

      {/* Left Panel - E-commerce Brand Visuals */}
      <div className="relative hidden lg:flex w-[55%] flex-col justify-between p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
            alt="Editorial Streetwear Fashion"
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Subtle gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Brand Elements */}
        <div className="relative z-10 mb-6">
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">
            HYPEKART
          </h1>
        </div>

        {/* Editorial Text */}
        <div className="relative z-10 max-w-lg mb-8">
          <p className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase mb-4">
            System Authorized Access Only
          </p>
          <h2 className="text-3xl font-light leading-snug text-white/90 drop-shadow-md">
            Manage your premium inventory, fulfill high-end orders, and oversee your exclusive customer base.
          </h2>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-black bg-white/10 relative overflow-hidden`}>
                  <Image
                    src={`https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=150&auto=format&fit=crop&crop=face&auto=compress&cs=tinysrgb&fit=crop&h=150&w=150&ixid=eyJhcHBfaWQiOjF9`}
                    alt="Avatar"
                    fill
                    className="object-cover opacity-80 mix-blend-luminosity"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 font-medium">Join 40+ staff members managing the platform.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex w-full lg:w-[45%] flex-col items-center justify-center p-8 lg:p-16 bg-[#050505]">
        {/* Subtle background glow effect */}
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">

          <div className="mb-10 lg:hidden text-center">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              HYPEKART
            </h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-zinc-400 font-medium">Enter your credentials to access the admin portal.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">

            {errorMsg && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hypekart.com"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-4 outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-zinc-300">Password</label>
                <a href="#" className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors">Forgot Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white transition-all rounded-2xl py-4 pl-12 pr-12 outline-none font-medium tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 ml-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <p className="text-xs text-zinc-500 font-medium tracking-wide">Secure connection established.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex items-center justify-center gap-3 w-full bg-white text-black font-bold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:bg-zinc-100 disabled:opacity-70 disabled:hover:shadow-none transition-all rounded-2xl py-4.5 cursor-pointer relative group overflow-hidden"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  <span className="text-[15px]">Access Dashboard</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-12 text-center lg:text-left">
            <p className="text-xs text-zinc-600 font-medium">
              © 2026 HypeKart Administration. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
