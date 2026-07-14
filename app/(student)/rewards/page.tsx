"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRewardsStore, RewardItem } from "@/store/useRewardsStore";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ShoppingBag, Sparkles, Tag, Check, Clock, Ticket, AlertCircle } from "lucide-react";

export default function RewardsPage() {
  const { user } = useAuthStore();
  const { rewards, redemptions, loadRewards, loadRedemptions, redeemVoucher } = useRewardsStore();
  const [activeTab, setActiveTab] = useState<string>("All");

  useEffect(() => {
    loadRewards();
    loadRedemptions();
  }, [loadRewards, loadRedemptions]);

  if (!user) return null;

  const categories = ["All", "Cafe Voucher", "Stationery Voucher", "Merchandise", "Coupons"];

  const filteredRewards = activeTab === "All"
    ? rewards
    : rewards.filter((r) => r.category === activeTab);

  // Filter redemptions just for the current student
  const studentRedemptions = redemptions.filter((r) => r.studentEmail === user.email);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Eco Rewards Shop</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Redeem your hard-earned EcoCredits for cafe meals, school merchandise, and stationery.
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="glass-card flex items-center gap-3 px-5 py-3 rounded-xl border border-emerald-500/20 max-w-fit">
          <div className="p-2 bg-emerald-500/15 text-emerald-500 rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Your Balance
            </p>
            <p className="text-xl font-bold text-emerald-500">{user.ecoCredits} Credits</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === cat
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Reward Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRewards.map((reward) => {
            const canAfford = user.ecoCredits >= reward.cost;
            const hasStock = reward.stock > 0;

            return (
              <motion.div
                layout
                key={reward.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-5 border border-border/80 flex flex-col justify-between hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/2 transition-all relative overflow-hidden"
              >
                {/* Out of Stock Label */}
                {!hasStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <span className="bg-rose-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
                      Out Of Stock
                    </span>
                  </div>
                )}

                <div>
                  {/* Category and Stock */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      {reward.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Stock: <span className="font-bold text-foreground">{reward.stock} left</span>
                    </span>
                  </div>

                  {/* Thumbnail / Symbol */}
                  <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/60 flex items-center justify-center text-3xl mb-4">
                    {reward.image}
                  </div>

                  {/* Title & Desc */}
                  <h4 className="font-bold text-base mb-1">{reward.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {reward.description}
                  </p>
                </div>

                {/* Redeem Trigger area */}
                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm text-emerald-500">{reward.cost} credits</span>
                  </div>

                  <button
                    onClick={() => redeemVoucher(reward.id)}
                    disabled={!canAfford || !hasStock}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                      canAfford
                        ? "bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Redeem Reward
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Past Redemptions List */}
      <div className="glass-card rounded-2xl p-6 mt-8">
        <h3 className="font-bold text-md mb-6 border-b border-border/80 pb-3 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-emerald-500" />
          My Redeemed Vouchers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border/60">
                <th className="pb-3 font-semibold">Voucher / Item</th>
                <th className="pb-3 font-semibold">Cost</th>
                <th className="pb-3 font-semibold">Voucher Code</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {studentRedemptions.map((red) => (
                <tr key={red.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 font-semibold">{red.voucherTitle}</td>
                  <td className="py-4 text-xs font-medium text-emerald-500">-{red.cost} credits</td>
                  <td className="py-4">
                    <span className="font-mono text-xs bg-black/10 dark:bg-white/5 border border-border/60 px-2.5 py-1 rounded-lg text-foreground">
                      {red.code}
                    </span>
                  </td>
                  <td className="py-4 text-muted-foreground text-xs">{red.date}</td>
                  <td className="py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        red.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : red.status === "Pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {red.status === "Approved" && <Check className="w-3 h-3" />}
                      {red.status === "Pending" && <Clock className="w-3 h-3 animate-pulse" />}
                      {red.status === "Redeemed" && <ShoppingBag className="w-3 h-3" />}
                      {red.status}
                    </span>
                  </td>
                </tr>
              ))}
              {studentRedemptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/55" />
                    No vouchers redeemed yet. Earn credits and claim rewards above!
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
