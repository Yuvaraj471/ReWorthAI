"use client";

import React, { useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useToastStore } from "@/store/useToastStore";
import { Search, Calendar, SlidersHorizontal, Download, FileText, AlertCircle } from "lucide-react";

export default function AdminHistoryLogsPage() {
  const { history, loadHistory } = useSessionStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const { addToast } = useToastStore();

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

  // Filter activities globally
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.sessionId.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" ||
      item.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesDate = !dateFilter || item.date === dateFilter;

    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      addToast("No data rows available to export.", "warning");
      return;
    }

    try {
      const headers = ["Session ID", "Waste Category", "Confidence Score (%)", "EcoCredits Earned", "Deposit Date", "Deposit Time"];
      const rows = filteredHistory.map((h) => [
        h.sessionId,
        h.category,
        `${h.confidence}%`,
        h.credits,
        h.date,
        h.time,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reworth_recycling_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast("CSV log file generated and downloaded!", "success");
    } catch (err) {
      addToast("Failed to compile CSV data.", "error");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Recycling Audits</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Browse campus-wide slot logs, filter transactions by material categories, and compile data sheets.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all text-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export filtered to CSV
        </button>
      </div>

      {/* Filters and search bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs by category or Session ID (e.g., SES-9204)..."
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

      {/* History table list */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase bg-black/10 dark:bg-white/5 border-b border-border/80">
                <th className="py-4 px-6 font-semibold">Session ID</th>
                <th className="py-4 px-4 font-semibold">Waste Category</th>
                <th className="py-4 px-4 font-semibold">Confidence</th>
                <th className="py-4 px-4 font-semibold">Credits Distributed</th>
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
                    No recycling transaction logs found.
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
