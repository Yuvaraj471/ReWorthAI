import { create } from "zustand";
import api from "@/lib/api";
import { useAuthStore } from "./useAuthStore";
import { useSessionStore } from "./useSessionStore";
import { useToastStore } from "./useToastStore";
import { useLeaderboardStore } from "./useLeaderboardStore";

interface Config {
  credits: Record<string, number>;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: Config = {
  credits: {
    "Plastic Bottle": 10,
    "Plastic Bag": 5,
    "Plastic Other": 10,
    Cardboard: 5,
    Glass: 15,
    "Biodegradable Waste": 3,
    Paper: 5,
    Metal: 20,
  },
  confidenceThreshold: 75.0,
};

interface WebSocketState {
  isConnected: boolean;
  isSimulating: boolean;
  socketUrl: string;
  config: Config;
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateConfig: (newConfig: Partial<Config>) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  let socket: WebSocket | null = null;
  const isClient = typeof window !== "undefined";

  // Load configured values
  const loadedConfig = isClient ? localStorage.getItem("rw_credits_config") : null;
  const initialConfig = loadedConfig ? JSON.parse(loadedConfig) : DEFAULT_CONFIG;

  return {
    isConnected: true, // Mock connected by default for seamless UX
    isSimulating: false,
    socketUrl: "wss://api.reworth.ai/live",
    config: initialConfig,

    updateConfig: (newConfig) => {
      set((state) => {
        const updated = {
          config: {
            ...state.config,
            ...newConfig,
          },
        };
        if (isClient) {
          localStorage.setItem("rw_credits_config", JSON.stringify(updated.config));
        }
        return updated;
      });
      useToastStore.getState().addToast("Recycling configuration updated by admin", "info");
    },

    connectSocket: () => {
      const { useBackend, token } = useAuthStore.getState();

      if (useBackend && token && !token.startsWith("mock-")) {
        if (socket) {
          socket.close();
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const defaultWsUrl = `${protocol}//${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL ? `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}` : defaultWsUrl;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          set({ isConnected: true });
          useToastStore.getState().addToast("Connected to ReWorth IoT Gateway", "info");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "detection") {
              const category = data.class;
              const confidence = parseFloat((data.confidence * 100).toFixed(1));
              const credits = get().config.credits[category] || 10;
              useSessionStore.getState().addDetection(category, confidence, credits);
            } else if (data.event === "credits_updated") {
              useAuthStore.getState().updateProfile({ ecoCredits: data.credits });
            } else if (data.event === "leaderboard_updated") {
              useLeaderboardStore.getState().loadLeaderboard();
            }
          } catch (e) {
            console.error("[WebSocketStore] Message parsing error:", e);
          }
        };

        ws.onclose = (event) => {
          set({ isConnected: false });
          // Only show disconnected toast if we were previously connected
          if (event.code !== 1006) {
            useToastStore.getState().addToast("Disconnected from IoT Gateway", "warning");
          }
        };

        ws.onerror = (event: Event) => {
          const target = event.target as WebSocket | null;
          const url = target?.url ?? wsUrl;
          const readyState = target?.readyState ?? "unknown";
          console.warn(
            `[WebSocketStore] WebSocket connection failed. URL: ${url} | readyState: ${readyState}`
          );
        };

        socket = ws;
        return;
      }
    },

    disconnectSocket: () => {
      set({ isConnected: false });
      if (socket) {
        socket.close();
        socket = null;
      }
      useToastStore.getState().addToast("Disconnected from IoT Gateway", "warning");
    },
  };
});
