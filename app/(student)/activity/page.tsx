"use client";

import React, { useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { Search, Calendar, SlidersHorizontal, AlertCircle, FileText } from "lucide-react";

export default function ActivityPage() {
  const { history, loadHistory } = useSessionStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const uniqueCategories = [
    "All",
    "Plastic Bottle",
    "Plastic Bag",
    "Plastic Other",
    "Cardboard",
    "Glass",
    "Biodegradable",
    "Paper",
    "Metal",
  ];

  // Filter activities
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.sessionId.toLowerCase().includes(search.toLowerCase());
    
    // Fuzzy category matching (e.g. "Glass" matches "Glass Bottle")
    const matchesCategory = categoryFilter === "All" ||
      item.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesDate = !dateFilter || item.date === dateFilter;

    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Recycling History</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review, filter, and track all your past waste deposits, EcoCredits earned, and detection metrics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by category or Session ID (e.g., SES-9821)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none cursor-pointer"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-background text-foreground">
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase bg-black/10 dark:bg-white/5 border-b border-border/80">
                <th className="py-4 px-6 font-semibold">Session ID</th>
                <th className="py-4 px-4 font-semibold">Waste Category</th>
                <th className="py-4 px-4 font-semibold">Confidence</th>
                <th className="py-4 px-4 font-semibold">Credits Earned</th>
                <th className="py-4 px-6 font-semibold text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-muted-foreground">{item.sessionId}</td>
                  <td className="py-4 px-4 font-semibold">{item.category}</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded">
                      {item.confidence}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-500">+{item.credits}</td>
                  <td className="py-4 px-6 text-right text-xs text-muted-foreground">
                    {item.date} at {item.time}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                    No recycling activities found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
