"use client";

import React, { useEffect, useState } from "react";
import { useRewardsStore, VoucherRedemption } from "@/store/useRewardsStore";
import { Check, ShoppingBag, Clock, FileText, Search, SlidersHorizontal, AlertCircle } from "lucide-react";

export default function AdminVoucherApprovalPage() {
  const { redemptions, loadRedemptions, updateVoucherStatus } = useRewardsStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadRedemptions();
  }, [loadRedemptions]);

  // Filter redemptions
  const filteredRedemptions = redemptions.filter((r) => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.voucherTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Voucher Approvals Desk</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review, approve pending EcoCredits voucher requests, and track redemption states for campus stores.
        </p>
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name, voucher title, or voucher code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
          >
            <option value="All" className="bg-background text-foreground">All Statuses</option>
            <option value="Pending" className="bg-background text-foreground">Pending Approval</option>
            <option value="Approved" className="bg-background text-foreground">Approved Vouchers</option>
            <option value="Redeemed" className="bg-background text-foreground">Redeemed Vouchers</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase bg-black/10 dark:bg-white/5 border-b border-border/80">
                <th className="py-4 px-6 font-semibold">Student</th>
                <th className="py-4 px-4 font-semibold">Item & Category</th>
                <th className="py-4 px-4 font-semibold">Voucher Code</th>
                <th className="py-4 px-4 font-semibold">Cost</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Approve / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredRedemptions.map((rdm) => (
                <tr key={rdm.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{rdm.studentName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{rdm.studentEmail}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold">{rdm.voucherTitle}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{rdm.category}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-xs bg-black/10 dark:bg-white/5 border border-border/60 px-2 py-0.5 rounded text-foreground">
                      {rdm.code}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-500 font-mono">-{rdm.cost}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rdm.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : rdm.status === "Pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rdm.status === "Approved" && <Check className="w-3 h-3" />}
                      {rdm.status === "Pending" && <Clock className="w-3 h-3 animate-pulse" />}
                      {rdm.status === "Redeemed" && <ShoppingBag className="w-3 h-3" />}
                      {rdm.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {rdm.status === "Pending" && (
                      <button
                        onClick={() => updateVoucherStatus(rdm.id, "Approved")}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] text-black font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Approve Code
                      </button>
                    )}
                    {rdm.status === "Approved" && (
                      <button
                        onClick={() => updateVoucherStatus(rdm.id, "Redeemed")}
                        className="px-3.5 py-1.5 bg-black/10 dark:bg-white/5 border border-border hover:bg-black/15 dark:hover:bg-white/10 text-foreground font-bold rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Mark Redeemed
                      </button>
                    )}
                    {rdm.status === "Redeemed" && (
                      <span className="text-xs text-muted-foreground italic font-medium px-4">
                        Claim complete
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRedemptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                    No redemptions match the selected filters.
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
