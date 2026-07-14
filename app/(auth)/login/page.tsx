"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, Mail, Lock, Loader2, Key } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  rememberMe: zod.boolean().optional(),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function StudentLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "alex.rivera@reworth.ai", // Prefill for easy testing
      password: "password123",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const success = await login(data.email, data.password, "student");
      if (success) {
        addToast("Logged in successfully! Welcome to ReWorth.", "success");
        router.push("/dashboard");
      } else {
        addToast("Invalid credentials. Try any email ending with @reworth.ai.", "error");
      }
    } catch (err) {
      addToast("An error occurred during login. Please try again.", "error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl -z-10" />

      {/* Floating glass cards on background */}
      <div className="absolute top-12 left-12 hidden lg:block glass p-4 rounded-xl border border-border shadow-md select-none transform -rotate-6 animate-pulse">
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Students</span>
        <h4 className="text-lg font-bold text-emerald-500 mt-1">1,480+</h4>
      </div>
      <div className="absolute bottom-12 right-12 hidden lg:block glass p-4 rounded-xl border border-border shadow-md select-none transform rotate-3 animate-[pulse_3s_infinite]">
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total CO2 Saved</span>
        <h4 className="text-lg font-bold text-cyan-400 mt-1">35,420 kg</h4>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl border border-border relative z-10"
      >
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
            ReWorth AI
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-bold">Student Sign In</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Access your EcoCredits wallet and start scanner sessions.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Campus Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@reworth.ai"
                {...register("email")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-semibold text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me & Forgot Pass */}
          <div className="flex items-center justify-between text-xs pt-1.5">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="rounded border-border text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-transparent"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In to Wallet"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border/80 pt-6 text-center text-xs space-y-3">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-emerald-500 hover:text-emerald-400 transition-all">
              Register Here
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground/60 text-[10px]">
            <Key className="w-3.5 h-3.5" />
            <span>Are you a coordinator?</span>
            <Link href="/admin/login" className="font-bold text-foreground hover:text-emerald-500 transition-all">
              Admin Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
