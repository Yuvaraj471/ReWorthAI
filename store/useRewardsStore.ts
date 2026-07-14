import { create } from "zustand";
import api from "@/lib/api";
import { useAuthStore } from "./useAuthStore";
import { useToastStore } from "./useToastStore";

export interface RewardItem {
  id: string | number;
  title: string;
  category: "Cafe Voucher" | "Stationery Voucher" | "Merchandise" | "Coupons" | string;
  description: string;
  cost: number;
  image: string;
  stock: number;
}

export interface VoucherRedemption {
  id: string | number;
  voucherId: string | number;
  voucherTitle: string;
  category: string;
  cost: number;
  code: string;
  status: "Pending" | "Approved" | "Redeemed" | string;
  date: string;
  studentName: string;
  studentEmail: string;
}

interface RewardsState {
  rewards: RewardItem[];
  redemptions: VoucherRedemption[];
  loadRewards: () => void;
  loadRedemptions: () => void;
  redeemVoucher: (itemId: string | number) => boolean | Promise<boolean>;
  addReward: (reward: Omit<RewardItem, "id">) => void;
  editReward: (id: string | number, updated: Partial<RewardItem>) => void;
  deleteReward: (id: string | number) => void;
  updateVoucherStatus: (redemptionId: string | number, status: "Approved" | "Redeemed") => void;
}

const EMOJI_MAP: Record<string, string> = {
  "Cafe Voucher": "☕",
  "Stationery Voucher": "📓",
  "Merchandise": "🥤",
  "Coupons": "🏷️",
};

const DEFAULT_REWARDS: RewardItem[] = [
  { id: "rew_1", title: "Eco Cafe Latte", category: "Cafe Voucher", description: "Get one free premium organic Cafe Latte at the Green Campus Cafe.", cost: 80, image: "☕", stock: 25 },
  { id: "rew_2", title: "Recycled Spiral Notepad", category: "Stationery Voucher", description: "100-page notebook made entirely of post-consumer waste cardboard.", cost: 50, image: "📓", stock: 40 },
  { id: "rew_3", title: "ReWorth Metal Thermos", category: "Merchandise", description: "Insulated stainless steel water bottle. Double wall vacuum seal.", cost: 300, image: "🥤", stock: 12 },
  { id: "rew_4", title: "Campus Bookstore Discount", category: "Coupons", description: "20% off coupon applicable on all academic textbooks and bags.", cost: 150, image: "🏷️", stock: 100 },
  { id: "rew_5", title: "Free Campus Shuttle Ride", category: "Coupons", description: "Weekly pass for complimentary express eco-bus shuttle.", cost: 60, image: "🚌", stock: 50 },
  { id: "rew_6", title: "Recycled Plastic Tote Bag", category: "Merchandise", description: "Spacious bag crafted using 15 recycled ocean PET bottles.", cost: 120, image: "👜", stock: 18 },
];

const DEFAULT_REDEMPTIONS: VoucherRedemption[] = [
  { id: "rdm_1", voucherId: "rew_1", voucherTitle: "Eco Cafe Latte", category: "Cafe Voucher", cost: 80, code: "LATTE-GREEN-88", status: "Approved", date: "2026-07-10", studentName: "Alex Rivera", studentEmail: "alex.rivera@reworth.ai" },
  { id: "rdm_2", voucherId: "rew_2", voucherTitle: "Recycled Spiral Notepad", category: "Stationery Voucher", cost: 50, code: "NOTE-RECYC-12", status: "Redeemed", date: "2026-07-08", studentName: "Alex Rivera", studentEmail: "alex.rivera@reworth.ai" },
];

const isClient = typeof window !== "undefined";

// Map backend redemption to frontend shape
function mapRedemption(r: Record<string, unknown>): VoucherRedemption {
  const statusRaw = (r.status as string) || "PENDING";
  const statusMap: Record<string, string> = { PENDING: "Pending", APPROVED: "Approved", REDEEMED: "Redeemed" };
  return {
    id: r.id as number,
    voucherId: (r.reward_id as number) || 0,
    voucherTitle: (r.voucher_title as string) || "",
    category: (r.category as string) || "",
    cost: (r.cost as number) || 0,
    code: (r.code as string) || "",
    status: statusMap[statusRaw.toUpperCase()] || statusRaw,
    date: r.created_at ? (r.created_at as string).split("T")[0] : "",
    studentName: (r.student_name as string) || "",
    studentEmail: (r.student_email as string) || "",
  };
}

// Map backend reward to frontend shape
function mapReward(r: Record<string, unknown>): RewardItem {
  const category = (r.category as string) || "Coupons";
  return {
    id: r.id as number,
    title: (r.title as string) || "",
    category,
    description: (r.description as string) || "",
    cost: (r.cost as number) || 0,
    image: (r.image as string) || EMOJI_MAP[category] || "🎁",
    stock: (r.stock as number) || 0,
  };
}

export const useRewardsStore = create<RewardsState>((set, get) => {
  return {
    rewards: [],
    redemptions: [],

    loadRewards: async () => {
      const { useBackend } = useAuthStore.getState();

      if (useBackend) {
        try {
          const { data } = await api.get("/api/v1/rewards/");
          const rewards = (data as Record<string, unknown>[]).map(mapReward);
          set({ rewards });
          return;
        } catch (err) {
          console.warn("[Rewards] Backend fetch failed, falling back to mock:", err);
        }
      }

      // Mock fallback
      if (!isClient) return;
      const stored = localStorage.getItem("rw_rewards_items");
      if (stored) {
        set({ rewards: JSON.parse(stored) });
      } else {
        localStorage.setItem("rw_rewards_items", JSON.stringify(DEFAULT_REWARDS));
        set({ rewards: DEFAULT_REWARDS });
      }
    },

    loadRedemptions: async () => {
      const { useBackend, isAdmin, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const endpoint = isAdmin ? "/api/v1/admin/vouchers" : "/api/v1/rewards/my/vouchers";
          const { data } = await api.get(endpoint);
          const redemptions = (data as Record<string, unknown>[]).map(mapRedemption);
          set({ redemptions });
          return;
        } catch (err) {
          console.warn("[Rewards] Backend redemptions fetch failed:", err);
        }
      }

      // Mock fallback
      if (!isClient) return;
      const stored = localStorage.getItem("rw_vouchers_redemptions");
      if (stored) {
        set({ redemptions: JSON.parse(stored) });
      } else {
        localStorage.setItem("rw_vouchers_redemptions", JSON.stringify(DEFAULT_REDEMPTIONS));
        set({ redemptions: DEFAULT_REDEMPTIONS });
      }
    },

    redeemVoucher: async (itemId) => {
      const { rewards, redemptions } = get();
      const user = useAuthStore.getState().user;
      const { useBackend, token } = useAuthStore.getState();

      if (!user) {
        useToastStore.getState().addToast("Please login to redeem rewards.", "error");
        return false;
      }

      const item = rewards.find((r) => String(r.id) === String(itemId));
      if (!item) {
        useToastStore.getState().addToast("Item not found.", "error");
        return false;
      }

      if (item.stock <= 0) {
        useToastStore.getState().addToast("This item is currently out of stock.", "error");
        return false;
      }

      if (user.ecoCredits < item.cost) {
        useToastStore.getState().addToast(`Insufficient EcoCredits. You need ${item.cost} credits.`, "error");
        return false;
      }

      // ── Backend API ──
      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const { data } = await api.post("/api/v1/rewards/redeem", { reward_id: Number(itemId) });
          const newRedemption = mapRedemption(data as Record<string, unknown>);

          // Refresh user profile to get updated credits
          await useAuthStore.getState().loadCurrentUser();

          // Update local rewards stock
          const updatedRewards = rewards.map((r) =>
            String(r.id) === String(itemId) ? { ...r, stock: r.stock - 1 } : r
          );

          set({
            rewards: updatedRewards,
            redemptions: [newRedemption, ...redemptions],
          });

          useToastStore.getState().addToast(`Successfully redeemed! Code: ${newRedemption.code}`, "success");
          return true;
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Redemption failed";
          useToastStore.getState().addToast(message, "error");
          return false;
        }
      }

      // ── Mock fallback ──
      useAuthStore.getState().updateProfile({ ecoCredits: user.ecoCredits - item.cost });

      const codeStr = `${item.title.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      const newRedemption: VoucherRedemption = {
        id: `rdm_${Math.random().toString(36).substring(2, 9)}`,
        voucherId: item.id,
        voucherTitle: item.title,
        category: item.category,
        cost: item.cost,
        code: codeStr,
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
        studentName: user.name,
        studentEmail: user.email,
      };

      const updatedRewards = rewards.map((r) =>
        String(r.id) === String(itemId) ? { ...r, stock: r.stock - 1 } : r
      );
      const updatedRedemptions = [newRedemption, ...redemptions];

      set({ rewards: updatedRewards, redemptions: updatedRedemptions });
      if (isClient) {
        localStorage.setItem("rw_rewards_items", JSON.stringify(updatedRewards));
        localStorage.setItem("rw_vouchers_redemptions", JSON.stringify(updatedRedemptions));
      }
      useToastStore.getState().addToast(`Successfully redeemed! Code: ${codeStr}`, "success");
      return true;
    },

    addReward: async (reward) => {
      const { useBackend, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const { data } = await api.post("/api/v1/rewards/admin/create", {
            title: reward.title,
            category: reward.category,
            description: reward.description,
            cost: reward.cost,
            stock: reward.stock,
            image: reward.image || null,
          });
          const newReward = mapReward(data as Record<string, unknown>);
          set((state) => ({ rewards: [...state.rewards, newReward] }));
          useToastStore.getState().addToast(`Reward "${reward.title}" added successfully`, "success");
          return;
        } catch (err) {
          console.warn("[Rewards] Backend add failed:", err);
        }
      }

      // Mock fallback
      const { rewards } = get();
      const newReward: RewardItem = { ...reward, id: `rew_${Math.random().toString(36).substring(2, 9)}` };
      const updated = [...rewards, newReward];
      set({ rewards: updated });
      if (isClient) localStorage.setItem("rw_rewards_items", JSON.stringify(updated));
      useToastStore.getState().addToast(`Reward "${reward.title}" added successfully`, "success");
    },

    editReward: async (id, updatedFields) => {
      const { useBackend, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const { data } = await api.put(`/api/v1/rewards/admin/${id}`, updatedFields);
          const updatedReward = mapReward(data as Record<string, unknown>);
          set((state) => ({
            rewards: state.rewards.map((r) => (String(r.id) === String(id) ? updatedReward : r)),
          }));
          useToastStore.getState().addToast("Reward details updated", "success");
          return;
        } catch (err) {
          console.warn("[Rewards] Backend edit failed:", err);
        }
      }

      // Mock fallback
      const { rewards } = get();
      const updated = rewards.map((r) => (String(r.id) === String(id) ? { ...r, ...updatedFields } : r));
      set({ rewards: updated });
      if (isClient) localStorage.setItem("rw_rewards_items", JSON.stringify(updated));
      useToastStore.getState().addToast("Reward details updated", "success");
    },

    deleteReward: async (id) => {
      const { useBackend, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          await api.delete(`/api/v1/rewards/admin/${id}`);
          set((state) => ({ rewards: state.rewards.filter((r) => String(r.id) !== String(id)) }));
          useToastStore.getState().addToast("Reward deleted successfully", "success");
          return;
        } catch (err) {
          console.warn("[Rewards] Backend delete failed:", err);
        }
      }

      // Mock fallback
      const { rewards } = get();
      const updated = rewards.filter((r) => String(r.id) !== String(id));
      set({ rewards: updated });
      if (isClient) localStorage.setItem("rw_rewards_items", JSON.stringify(updated));
      useToastStore.getState().addToast("Reward deleted successfully", "success");
    },

    updateVoucherStatus: async (redemptionId, status) => {
      const { useBackend, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const endpoint = status === "Approved"
            ? `/api/v1/admin/vouchers/${redemptionId}/approve`
            : `/api/v1/admin/vouchers/${redemptionId}/redeem`;
          await api.patch(endpoint);
          set((state) => ({
            redemptions: state.redemptions.map((r) =>
              String(r.id) === String(redemptionId) ? { ...r, status } : r
            ),
          }));
          useToastStore.getState().addToast(`Voucher status updated to ${status}`, "success");
          return;
        } catch (err) {
          console.warn("[Rewards] Backend voucher update failed:", err);
        }
      }

      // Mock fallback
      const { redemptions } = get();
      const updated = redemptions.map((r) => (String(r.id) === String(redemptionId) ? { ...r, status } : r));
      set({ redemptions: updated });
      if (isClient) localStorage.setItem("rw_vouchers_redemptions", JSON.stringify(updated));
      useToastStore.getState().addToast(`Voucher status updated to ${status}`, "success");
    },
  };
});
