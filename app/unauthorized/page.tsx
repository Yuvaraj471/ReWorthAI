"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const { user, isAdmin } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return "/login";
    return isAdmin ? "/admin/dashboard" : "/dashboard";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Background soft glowing blur spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl text-center relative z-10 border border-rose-500/20"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/5">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent mb-3">
          Access Denied
        </h1>
        
        <p className="text-sm font-medium text-rose-400 mb-6 uppercase tracking-wider">
          Error Code: 403 - Unauthorized Access
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          You do not have administrative privileges required to view this directory. Your credentials have been flagged, and this attempt has been logged.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={getDashboardLink()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold transition-all text-sm text-foreground"
          >
            <Home className="w-4 h-4" />
            Home Page
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
