"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const adminLoginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 digits"),
});

type AdminLoginFormValues = zod.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "admin@reworth.ai", // Prefill for easy testing
      password: "admin123",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      const success = await login(data.email, data.password, "admin");
      if (success) {
        addToast("Coordinator Session authorized. Welcome back.", "success");
        router.push("/admin/dashboard");
      } else {
        addToast("Authorization failed. Check email or password.", "error");
      }
    } catch (err) {
      addToast("Server connection error during authorization.", "error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020703] text-slate-100 px-6 py-12 relative overflow-hidden">
      {/* Abstract futuristic grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f2415_1px,transparent_1px),linear-gradient(to_bottom,#0f2415_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Cybernetic glowing blobs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-slate-950/85 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/30 relative z-10"
      >
        {/* Security Shield Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
            Admin Auth Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access authorized for campus recycling coordinators only.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Admin Email */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Coordinator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" />
              <input
                type="email"
                placeholder="admin@reworth.ai"
                {...register("email")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 outline-none text-slate-100 placeholder-slate-600 transition-all font-mono"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] font-semibold text-rose-400">{errors.email.message}</p>
            )}
          </div>

          {/* Admin Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 outline-none text-slate-100 placeholder-slate-600 transition-all font-mono"
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-semibold text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Authorizing Security...
              </>
            ) : (
              "Access Administrative Console"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-400 hover:text-emerald-400 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Student Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
