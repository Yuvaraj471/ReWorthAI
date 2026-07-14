"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useWebSocketStore } from "@/store/useWebSocketStore";
import { Sun, Moon, Wifi, WifiOff, Menu, X, Leaf } from "lucide-react";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { isConnected, connectSocket, disconnectSocket } = useWebSocketStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border py-4 px-6 md:px-8 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {/* Brand logo (visible on mobile only) */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center shadow-lg">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-md bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
          ReWorth AI
        </span>
      </div>

      {/* Connection Indicator & Title */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          {isAdmin ? "Sustainability Portal" : "Campus Recycling Station"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* IoT status indicator */}
        <button
          onClick={() => (isConnected ? disconnectSocket() : connectSocket())}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}
          title={isConnected ? "Click to simulate disconnect" : "Click to connect"}
        >
          <span className="relative flex h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            ></span>
          </span>
          <span className="hidden sm:inline">
            {isConnected ? "IoT Active" : "IoT Offline"}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/80 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-lime-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer sheet */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-[280px] bg-background border-r border-border shadow-2xl flex flex-col"
            >
              {/* Close Drawer Button */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              <Sidebar isAdmin={isAdmin} onCloseMobile={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
