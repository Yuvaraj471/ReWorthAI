"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight, Ban, UserCheck, AlertCircle,
  Users, Coins, Recycle, Leaf, GraduationCap, Mail, Hash, BookOpen, X, Eye,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

interface StudentUser {
  id: number;
  name: string;
  email: string;
  eco_credits: number;
  is_active: boolean;
  total_sessions: number;
  carbon_saved: number;
  bottles_recycled: number;
  register_number?: string;
  department?: string;
  year?: string;
}

function StudentDetailModal({
  user,
  onClose,
  onToggleStatus,
}: {
  user: StudentUser;
  onClose: () => void;
  onToggleStatus: (u: StudentUser) => void;
}) {
  const stats = [
    { label: "EcoCredits Balance", value: user.eco_credits, icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Sessions", value: user.total_sessions, icon: Recycle, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Items Recycled", value: user.bottles_recycled, icon: Leaf, color: "text-lime-500", bg: "bg-lime-500/10" },
    { label: "CO₂ Saved (kg)", value: (user.carbon_saved ?? 0).toFixed(2), icon: Leaf, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl border border-border/80 p-8 w-full max-w-lg shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar & Name */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border/60">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-2xl text-emerald-500">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{user.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
            <span
              className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.is_active
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {user.is_active ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        {/* Academic Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 flex items-start gap-2.5">
            <Hash className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">Register No.</p>
              <p className="text-sm font-bold mt-0.5">{user.register_number || "—"}</p>
            </div>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">Year</p>
              <p className="text-sm font-bold mt-0.5">{user.year || "—"}</p>
            </div>
          </div>
          <div className="col-span-2 bg-black/5 dark:bg-white/5 rounded-xl p-3 flex items-start gap-2.5">
            <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">Department</p>
              <p className="text-sm font-bold mt-0.5">{user.department || "—"}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-xl p-3.5 ${s.bg} flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">{s.label}</p>
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <button
          onClick={() => {
            onToggleStatus(user);
            onClose();
          }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            user.is_active
              ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
          }`}
        >
          {user.is_active ? "Suspend This Student" : "Reactivate This Student"}
        </button>
      </div>
    </div>
  );
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<StudentUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToastStore();
  const { useBackend } = useAuthStore();

  const itemsPerPage = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    if (useBackend) {
      try {
        const { data } = await api.get("/api/v1/admin/students", {
          params: { limit: 200 },
        });
        setUsers(data as StudentUser[]);
      } catch {
        addToast("Failed to load student list from backend.", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [useBackend, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.register_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const toggleSuspendUser = async (user: StudentUser) => {
    const endpoint = user.is_active
      ? `/api/v1/admin/students/${user.id}/block`
      : `/api/v1/admin/students/${user.id}/unblock`;
    try {
      const { data } = await api.patch(endpoint);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: (data as StudentUser).is_active } : u))
      );
      addToast(
        `${user.name} has been ${user.is_active ? "suspended" : "reactivated"}.`,
        user.is_active ? "warning" : "success"
      );
    } catch {
      addToast("Failed to update student status.", "error");
    }
  };

  // Summary stats
  const totalCredits = users.reduce((s, u) => s + u.eco_credits, 0);
  const activeSessions = users.filter((u) => u.is_active).length;
  const totalItems = users.reduce((s, u) => s + (u.bottles_recycled || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View full student profiles, track recycling activity, and manage account access.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: users.length, icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Active Accounts", value: activeSessions, icon: UserCheck, color: "text-cyan-500 bg-cyan-500/10" },
          { label: "Total EcoCredits", value: totalCredits.toLocaleString(), icon: Coins, color: "text-lime-500 bg-lime-500/10" },
          { label: "Total Items Recycled", value: totalItems.toLocaleString(), icon: Recycle, color: "text-teal-500 bg-teal-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-border/60">
              <div className={`p-3 rounded-xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{s.label}</p>
                <p className="text-2xl font-extrabold mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, register no., or department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
          {filteredUsers.length} student{filteredUsers.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase bg-black/10 dark:bg-white/5 border-b border-border/80">
                <th className="py-4 px-6 font-semibold">Student</th>
                <th className="py-4 px-4 font-semibold">Register No.</th>
                <th className="py-4 px-4 font-semibold">Department / Year</th>
                <th className="py-4 px-4 font-semibold">EcoCredits</th>
                <th className="py-4 px-4 font-semibold">Sessions</th>
                <th className="py-4 px-4 font-semibold">CO₂ Saved</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    <span className="animate-pulse">Loading students from backend...</span>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    {/* Student identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/15 to-lime-500/15 border border-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-none">{u.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Register Number */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs bg-black/5 dark:bg-white/5 border border-border/50 px-2 py-1 rounded-lg">
                        {u.register_number || "—"}
                      </span>
                    </td>

                    {/* Department & Year */}
                    <td className="py-4 px-4">
                      <p className="text-xs font-medium text-foreground leading-snug max-w-[160px]">
                        {u.department || "—"}
                      </p>
                      {u.year && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{u.year} Year</p>
                      )}
                    </td>

                    {/* EcoCredits */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-500 font-mono text-sm">{u.eco_credits}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">cr</span>
                    </td>

                    {/* Sessions */}
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {u.total_sessions} sessions
                    </td>

                    {/* CO2 */}
                    <td className="py-4 px-4 text-xs font-medium text-teal-500">
                      {(u.carbon_saved ?? 0).toFixed(2)} kg
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.is_active
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {u.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Suspend / Reactivate */}
                        <button
                          onClick={() => toggleSuspendUser(u)}
                          className={`p-1.5 rounded-lg border border-border transition-all cursor-pointer ${
                            !u.is_active
                              ? "text-emerald-500 hover:bg-emerald-500/10"
                              : "text-rose-500 hover:bg-rose-500/10"
                          }`}
                          title={u.is_active ? "Suspend Student" : "Reactivate Student"}
                        >
                          {!u.is_active ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                    No student profiles found.{" "}
                    {!useBackend && "Connect the backend to load real student data."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4 px-6 border-t border-border/80 bg-black/5 dark:bg-white/5 text-xs">
            <span className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedUser && (
        <StudentDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={toggleSuspendUser}
        />
      )}
    </div>
  );
}
