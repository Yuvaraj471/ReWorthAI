"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Gift,
  Trophy,
  History,
  User,
  LogOut,
  BarChart3,
  Users,
  Settings,
  CheckSquare,
  Shield,
  Leaf,
  QrCode,
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isAdmin = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const studentLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Rewards Shop", href: "/rewards", icon: Gift },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "My Activity", href: "/activity", icon: History },
    { name: "Scan QR Code", href: "/qr", icon: QrCode },
    { name: "Profile", href: "/profile", icon: User },
  ];


  const adminLinks = [
    { name: "Admin Home", href: "/admin/dashboard", icon: Shield },
    { name: "Waste Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Manage Users", href: "/admin/users", icon: Users },
    { name: "Manage Rewards", href: "/admin/rewards", icon: Gift },
    { name: "Credit Settings", href: "/admin/settings", icon: Settings },
    { name: "Voucher Approvals", href: "/admin/vouchers", icon: CheckSquare },
    { name: "Recycling Logs", href: "/admin/history", icon: History },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push(isAdmin ? "/admin/login" : "/login");
  };

  return (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-transparent border-r border-border min-w-[260px] w-[260px]">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
            ReWorth AI
          </h1>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">
            {isAdmin ? "Admin Console" : "Smart Recycling"}
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 px-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "text-emerald-500 font-semibold bg-emerald-500/5 dark:bg-emerald-500/10 border-l-2 border-emerald-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="border-t border-border/80 pt-6 px-1 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-lime-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none mb-1">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate leading-none">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
