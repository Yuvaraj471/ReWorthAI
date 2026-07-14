"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import { useRewardsStore } from "@/store/useRewardsStore";
import { useWebSocketStore } from "@/store/useWebSocketStore";
import {
  Users, Coins, Activity, FileText, TrendingUp, ShieldCheck, Zap, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface PlatformStats {
  total_students: number;
  total_items: number;
  total_credits_distributed: number;
  pending_vouchers: number;
  carbon_saved_kg: number;
  waste_totals?: Record<string, number>;
}

const WASTE_ICONS: Record<string, string> = {
  "Plastic Bottle": "🍶",
  "Plastic Bag": "🛍️",
  "Plastic Other": "♻️",
  Cardboard: "📦",
  Glass: "🥛",
  "Biodegradable Waste": "🌿",
  Paper: "📄",
  Metal: "🔩",
};

export default function AdminDashboard() {
  const { user, useBackend } = useAuthStore();
  const { entries, loadLeaderboard } = useLeaderboardStore();
  const { redemptions, loadRedemptions } = useRewardsStore();
  const { isConnected } = useWebSocketStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const loadStats = useCallback(async () => {
    if (!useBackend) return;
    try {
      const { data } = await api.get("/api/v1/admin/stats");
      setStats(data as PlatformStats);
    } catch (err) {
      console.warn("[AdminDashboard] Stats fetch failed:", err);
    }
  }, [useBackend]);

  useEffect(() => {
    loadLeaderboard();
    loadRedemptions();
    loadStats();
  }, [loadLeaderboard, loadRedemptions, loadStats]);

  if (!user) return null;

  const pendingVouchers = redemptions.filter((r) => r.status === "Pending").length;

  const metrics = [
    {
      title: "Total Registered Users",
      value: stats ? stats.total_students.toLocaleString() : "—",
      change: stats ? `${stats.total_students} students enrolled` : "Loading...",
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "EcoCredits Distributed",
      value: stats ? stats.total_credits_distributed.toLocaleString() : "—",
      change: stats ? `${stats.carbon_saved_kg.toFixed(1)} kg CO₂ offset` : "Loading...",
      icon: Coins,
      color: "text-lime-500 bg-lime-500/10",
    },
    {
      title: "Active IoT Sessions",
      value: isConnected ? "Live" : "0",
      change: isConnected ? "WebSocket hub active" : "All IoT hubs offline",
      icon: Activity,
      color: isConnected ? "text-cyan-500 bg-cyan-500/10" : "text-rose-500 bg-rose-500/10",
    },
    {
      title: "Total Waste Collected",
      value: stats ? `${stats.total_items.toLocaleString()} items` : "—",
      change: stats ? `${stats.pending_vouchers} vouchers pending` : "Loading...",
      icon: FileText,
      color: "text-indigo-500 bg-indigo-500/10",
    },
  ];

  const wasteCategories = [
    "Plastic Bottle", "Plastic Bag", "Plastic Other",
    "Cardboard", "Glass", "Biodegradable Waste", "Paper", "Metal",
  ];


  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-emerald-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-lime-500/10 rounded-full blur-2xl -z-10" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider">
              System Admin
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              {useBackend ? "● Live Backend Connected" : "Admin Session Active"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Campus Coordinator Console
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg">
            Monitor real-time student waste metrics, configure device thresholds, and manage voucher approvals.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all text-sm w-full md:w-auto justify-center cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          Quick Adjust Config
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-border/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.title}</p>
                <h3 className="text-2xl font-extrabold tracking-tight mt-1.5">{m.value}</h3>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{m.change}</p>
              </div>
              <div className={`p-3 rounded-xl ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Waste Category Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="font-bold text-md mb-1 flex items-center gap-2">
          Waste Collection Breakdown
          <span className="text-xs font-normal text-muted-foreground ml-1">— by category</span>
        </h4>
        <p className="text-xs text-muted-foreground mb-5">Total items collected per waste type across all recycling sessions.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {wasteCategories.map((cat) => {
            const count = stats?.waste_totals?.[cat] ?? 0;
            const total = stats?.total_items || 1;
            const pct = Math.min(Math.round((count / total) * 100), 100);
            return (
              <div key={cat} className="bg-black/5 dark:bg-white/5 border border-border/50 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{WASTE_ICONS[cat] ?? "♻️"}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide leading-tight">{cat}</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{count}</p>
                <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">{pct}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Vouchers Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
              <div>
                <h4 className="font-bold text-md flex items-center gap-2">
                  Voucher Approvals Pending
                  {pendingVouchers > 0 && (
                    <span className="bg-amber-500 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                      {pendingVouchers} NEW
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify and approve pending Cafe or Merchandise discount requests.
                </p>
              </div>
              <Link
                href="/admin/vouchers"
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 group"
              >
                Approvals Center
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {redemptions.slice(0, 3).map((rdm) => (
                <div
                  key={rdm.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 text-xs"
                >
                  <div>
                    <h5 className="font-bold">{rdm.voucherTitle}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Requested by <span className="font-semibold text-foreground">{rdm.studentName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        rdm.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : rdm.status === "Pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rdm.status}
                    </span>
                    <p className="text-[9px] font-semibold text-emerald-500/80 mt-1 font-mono">{rdm.cost} Credits</p>
                  </div>
                </div>
              ))}
              {redemptions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No voucher redemptions available.
                </p>
              )}
            </div>
          </div>

          {/* Shortcut Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/admin/analytics"
              className="glass-card p-5 rounded-2xl text-center border border-border/60 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2.5" />
              <h5 className="font-bold text-sm">Review Analytics</h5>
              <p className="text-[10px] text-muted-foreground mt-1">Recycling bar and pie charts</p>
            </Link>
            <Link
              href="/admin/users"
              className="glass-card p-5 rounded-2xl text-center border border-border/60 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Users className="w-6 h-6 text-lime-500 mx-auto mb-2.5" />
              <h5 className="font-bold text-sm">Manage Users</h5>
              <p className="text-[10px] text-muted-foreground mt-1">Search or suspend students</p>
            </Link>
            <Link
              href="/admin/history"
              className="glass-card p-5 rounded-2xl text-center border border-border/60 hover:border-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <ShieldCheck className="w-6 h-6 text-cyan-500 mx-auto mb-2.5" />
              <h5 className="font-bold text-sm">Global Audit Log</h5>
              <p className="text-[10px] text-muted-foreground mt-1">Export full CSV histories</p>
            </Link>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm mb-4 border-b border-border/80 pb-2">
              Leaderboard Preview
            </h4>
            <div className="space-y-3.5">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground w-4">{entry.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 border border-border/60 flex items-center justify-center font-bold text-[10px]">
                      {entry.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{entry.name}</p>
                      <p className="text-[9px] text-muted-foreground">{entry.department}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-500">{entry.ecoCredits}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 text-center block border-t border-border/60 pt-4 mt-4"
          >
            View Full Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
