"use client";

import React, { useEffect, useState } from "react";
import { useRewardsStore, RewardItem } from "@/store/useRewardsStore";
import { Plus, Edit, Trash, X, Coins } from "lucide-react";

export default function AdminRewardsPage() {
  const { rewards, loadRewards, addReward, editReward, deleteReward } = useRewardsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<RewardItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Cafe Voucher");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(50);
  const [stock, setStock] = useState(10);
  const [image, setImage] = useState("☕"); // Standard emoji placeholder as icon

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const handleOpenAdd = () => {
    setEditItem(null);
    setTitle("");
    setCategory("Cafe Voucher");
    setDescription("");
    setCost(50);
    setStock(10);
    setImage("☕");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RewardItem) => {
    setEditItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description);
    setCost(item.cost);
    setStock(item.stock);
    setImage(item.image);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      category,
      description,
      cost,
      stock,
      image,
    };

    if (editItem) {
      editReward(editItem.id, payload);
    } else {
      addReward(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this reward from the store?")) {
      deleteReward(id);
    }
  };

  const categories = ["Cafe Voucher", "Stationery Voucher", "Merchandise", "Coupons"];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Eco Rewards Catalog</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Maintain the rewards inventory by creating new voucher offers, adjusting credit costs, and auditing remaining stock levels.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Reward Item
        </button>
      </div>

      {/* Grid of catalog items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="glass-card rounded-2xl p-5 border border-border/80 flex flex-col justify-between hover:border-emerald-500/30 hover:shadow-lg transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {reward.category}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Stock: <span className="font-bold text-foreground">{reward.stock} units</span>
                </span>
              </div>

              {/* Thumbnail representation */}
              <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 flex items-center justify-center text-2xl mb-4">
                {reward.image}
              </div>

              <h4 className="font-bold text-sm truncate">{reward.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {reward.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                <Coins className="w-4 h-4" />
                <span>{reward.cost} credits</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(reward)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="p-1.5 rounded-lg border border-border text-rose-500 hover:bg-rose-500/10 transition-all text-xs font-semibold cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md glass-card p-6 rounded-2xl border border-border z-10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-md mb-6 border-b border-border/85 pb-2">
              {editItem ? "Edit Catalog Item" : "Create New Reward"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Reward Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Recycled Thermal Mug"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-background text-foreground">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain details, terms, and redemption policies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Cost */}
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Cost</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
                  />
                </div>
                {/* Stock */}
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
                  />
                </div>
                {/* Emoji Icon */}
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Emoji Icon</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-center text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {editItem ? "Apply Changes" : "Publish to Shop"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
