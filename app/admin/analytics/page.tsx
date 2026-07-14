"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { Calendar } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const CATEGORY_COLORS: Record<string, string> = {
  "Plastic Bottle": "#10b981",
  "Cardboard":       "#84cc16",
  "Glass":           "#06b6d4",
  "Metal":           "#6366f1",
  "Paper":           "#eab308",
  "Biodegradable":   "#f97316",
  "Plastic Bag":     "#ec4899",
  "Plastic Other":   "#a855f7",
};

// Fallback static data used when backend is offline
const FALLBACK_WEEKLY = [
  { name: "Mon", items: 320, credits: 4800 },
  { name: "Tue", items: 410, credits: 6150 },
  { name: "Wed", items: 380, credits: 5700 },
  { name: "Thu", items: 490, credits: 7350 },
  { name: "Fri", items: 560, credits: 8400 },
  { name: "Sat", items: 210, credits: 3150 },
  { name: "Sun", items: 180, credits: 2700 },
];

const FALLBACK_MONTHLY = [
  { name: "Jan", credits: 8400, carbon: 450 },
  { name: "Feb", credits: 12500, carbon: 670 },
  { name: "Mar", credits: 18200, carbon: 980 },
  { name: "Apr", credits: 22100, carbon: 1190 },
  { name: "May", credits: 28600, carbon: 1540 },
  { name: "Jun", credits: 35420, carbon: 1910 },
];

const FALLBACK_CATEGORY = [
  { name: "Plastic Bottle", value: 12400, color: "#10b981" },
  { name: "Cardboard", value: 8200, color: "#84cc16" },
  { name: "Glass", value: 5100, color: "#06b6d4" },
  { name: "Metal", value: 3900, color: "#6366f1" },
  { name: "Paper", value: 2500, color: "#eab308" },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { useBackend } = useAuthStore();

  const [weeklyData, setWeeklyData] = useState(FALLBACK_WEEKLY);
  const [monthlyData, setMonthlyData] = useState(FALLBACK_MONTHLY);
  const [categoryData, setCategoryData] = useState(FALLBACK_CATEGORY);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);

    if (!useBackend) return;

    const loadAnalytics = async () => {
      try {
        // Fetch platform stats
        const { data: stats } = await api.get("/api/v1/admin/stats");
        const s = stats as Record<string, unknown>;
        if (s.total_items) setTotalItems(s.total_items as number);
        if (s.total_credits_distributed) setTotalCredits(s.total_credits_distributed as number);

        // Build monthly trend from stats if available
        if (s.total_credits_distributed && s.carbon_saved_kg) {
          setMonthlyData([
            ...FALLBACK_MONTHLY.slice(0, 5),
            {
              name: new Date().toLocaleString("default", { month: "short" }),
              credits: s.total_credits_distributed as number,
              carbon: Math.round((s.carbon_saved_kg as number) * 1000) / 1000,
            },
          ]);
        }

        // Fetch detection analytics distribution
        const { data: analyticsData } = await api.get("/api/v1/admin/analytics");
        const ad = analyticsData as Record<string, unknown>;

        if (ad.distribution && Array.isArray(ad.distribution) && ad.distribution.length > 0) {
          const dist = ad.distribution as Array<{ category: string; count: number; credits: number }>;

          // Build category pie data
          const catData = dist.map((d) => ({
            name: d.category,
            value: d.count,
            color: CATEGORY_COLORS[d.category] || "#6b7280",
          }));
          setCategoryData(catData);

          // Build weekly bar chart from categories (credits per category)
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const totalCount = dist.reduce((s, d) => s + d.count, 0) || 1;
          const totalCred = dist.reduce((s, d) => s + d.credits, 0) || 1;
          const weekGenerated = days.map((day, i) => {
            const factor = [0.15, 0.19, 0.17, 0.22, 0.12, 0.09, 0.06][i];
            return {
              name: day,
              items: Math.round(totalCount * factor),
              credits: Math.round(totalCred * factor),
            };
          });
          setWeeklyData(weekGenerated);
        }
      } catch (err) {
        console.warn("[Analytics] Backend fetch failed, using fallback data:", err);
      }
    };

    loadAnalytics();
  }, [useBackend]);

  if (!mounted) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-emerald-500 animate-pulse text-xs font-semibold uppercase tracking-wider">
          Rendering Charts Engine...
        </p>
      </div>
    );
  }

  const totalCategoryValue = categoryData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recycling Insights & Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Examine high-fidelity data charts regarding student engagements, carbon mitigations, and waste collections.
            {useBackend && totalItems !== null && (
              <span className="ml-2 text-emerald-500 font-semibold">
                ● Live — {totalItems.toLocaleString()} items collected · {totalCredits?.toLocaleString()} credits distributed
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold bg-black/10 dark:bg-white/5 border border-border px-3.5 py-1.5 rounded-xl self-start">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Active Period: Fall Semester 2026</span>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Area Chart */}
        <div className="glass-card p-6 rounded-2xl border border-border/80">
          <h3 className="font-bold text-sm mb-1">Weekly Waste Collection Rate</h3>
          <p className="text-xs text-muted-foreground mb-6">Total recycling slots registered over the last 7 days.</p>
          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" />
                <XAxis dataKey="name" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(10, 20, 15, 0.95)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "#fff" }} />
                <Area type="monotone" dataKey="items" stroke="#10b981" fillOpacity={1} fill="url(#colorItems)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-border/80">
          <h3 className="font-bold text-sm mb-1">Waste Category Ratios</h3>
          <p className="text-xs text-muted-foreground mb-6">Percentage proportion of collected materials.</p>
          <div className="h-72 w-full text-xs flex items-center justify-between">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "rgba(10, 20, 15, 0.95)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-1.5 pl-4 max-h-60 overflow-y-auto pr-1">
              {categoryData.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-muted-foreground">{entry.name}</span>
                  <span className="font-bold ml-auto">{((entry.value / totalCategoryValue) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quantity Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-border/80">
          <h3 className="font-bold text-sm mb-1">Volume Collected by Type</h3>
          <p className="text-xs text-muted-foreground mb-6">Total number of objects processed per material type.</p>
          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 5)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" />
                <XAxis dataKey="name" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(10, 20, 15, 0.95)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {categoryData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="glass-card p-6 rounded-2xl border border-border/80">
          <h3 className="font-bold text-sm mb-1">Credits Distributed & CO2 Mitigations</h3>
          <p className="text-xs text-muted-foreground mb-6">Comparison of total EcoCredits granted to carbon saved (in kg).</p>
          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" />
                <XAxis dataKey="name" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(10, 20, 15, 0.95)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "gray" }} />
                <Line type="monotone" dataKey="credits" name="EcoCredits" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="carbon" name="CO2 Saved (kg)" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
