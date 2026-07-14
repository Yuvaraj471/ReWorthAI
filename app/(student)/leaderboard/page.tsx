"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import { Trophy, Search, Sparkles, SlidersHorizontal } from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const { entries, loadLeaderboard, getFilteredEntries } = useLeaderboardStore();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, user]);

  const filteredEntries = getFilteredEntries(search, selectedDept);

  const departments = [
    "All",
    "Information Technology",
    "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering",
    "Computer Science and Business Systems",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Biomedical Engineering",
    "Computer Science and Engineering (Cyber Security)",
  ];


  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="font-mono font-bold text-xs text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Campus Leaderboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Compete with fellow students and departments to claim the top recycling spots this semester.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Department Dropdown */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm appearance-none cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept} className="bg-background text-foreground">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Podium Showcase (Top 3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        {/* 2nd place */}
        {filteredEntries.length >= 2 && (
          <div className="glass-card p-6 rounded-2xl border border-slate-500/20 text-center order-2 md:order-1 h-fit relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl bg-card border border-border rounded-full w-9 h-9 flex items-center justify-center shadow-md">
              🥈
            </span>
            <div className="w-12 h-12 rounded-full bg-slate-500/10 border border-slate-500/25 flex items-center justify-center font-bold text-lg text-slate-400 mx-auto mb-3">
              {filteredEntries[1].name.charAt(0)}
            </div>
            <h4 className="font-bold text-sm truncate">{filteredEntries[1].name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{filteredEntries[1].department}</p>
            <p className="font-bold text-sm text-emerald-500 mt-3">{filteredEntries[1].ecoCredits} Credits</p>
          </div>
        )}

        {/* 1st place */}
        {filteredEntries.length >= 1 && (
          <div className="glass-card p-8 rounded-2xl border border-yellow-500/25 text-center order-1 md:order-2 active-ring relative">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl bg-card border border-yellow-500/20 rounded-full w-11 h-11 flex items-center justify-center shadow-lg">
              🥇
            </span>
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center font-bold text-xl text-yellow-500 mx-auto mb-4">
              {filteredEntries[0].name.charAt(0)}
            </div>
            <h4 className="font-extrabold text-base truncate">{filteredEntries[0].name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{filteredEntries[0].department}</p>
            <div className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold mt-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {filteredEntries[0].ecoCredits} Credits
            </div>
          </div>
        )}

        {/* 3rd place */}
        {filteredEntries.length >= 3 && (
          <div className="glass-card p-6 rounded-2xl border border-amber-600/20 text-center order-3 h-fit relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl bg-card border border-border rounded-full w-9 h-9 flex items-center justify-center shadow-md">
              🥉
            </span>
            <div className="w-12 h-12 rounded-full bg-amber-600/10 border border-amber-600/25 flex items-center justify-center font-bold text-lg text-amber-600 mx-auto mb-3">
              {filteredEntries[2].name.charAt(0)}
            </div>
            <h4 className="font-bold text-sm truncate">{filteredEntries[2].name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{filteredEntries[2].department}</p>
            <p className="font-bold text-sm text-emerald-500 mt-3">{filteredEntries[2].ecoCredits} Credits</p>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase bg-black/10 dark:bg-white/5 border-b border-border/80 sticky top-0 z-10">
                <th className="py-4 px-6 font-semibold w-20">Rank</th>
                <th className="py-4 px-4 font-semibold">Name</th>
                <th className="py-4 px-4 font-semibold">Department</th>
                <th className="py-4 px-6 font-semibold text-right">EcoCredits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredEntries.map((entry) => (
                <tr
                  key={`${entry.name}-${entry.rank}`}
                  className={`transition-colors ${
                    entry.isCurrentUser
                      ? "bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 border-y border-emerald-500/30"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <td className="py-4 px-6">{getRankBadge(entry.rank)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border ${
                        entry.isCurrentUser
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500"
                          : "bg-black/5 dark:bg-white/5 border-border/80 text-muted-foreground"
                      }`}>
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <span className={`font-semibold ${entry.isCurrentUser ? "text-emerald-500 font-bold" : ""}`}>
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-[9px] bg-emerald-500 text-black font-extrabold uppercase px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-muted-foreground">{entry.department}</td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-500">{entry.ecoCredits}</td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    No users match your criteria.
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
