import { create } from "zustand";
import api from "@/lib/api";
import { useAuthStore } from "./useAuthStore";
import { useToastStore } from "./useToastStore";

export interface DetectionLog {
  id: string;
  category: string;
  confidence: number;
  credits: number;
  timestamp: string;
}

export interface RecyclingActivity {
  id: string;
  category: string;
  credits: number;
  confidence: number;
  date: string;
  time: string;
  sessionId: string;
}

interface SessionState {
  activeSession: {
    id: string | null;
    status: "idle" | "scanning" | "completed";
    timeLeft: number;
    detections: DetectionLog[];
    latestDetection: { category: string; confidence: number; credits: number; x?: number; y?: number; width?: number; height?: number } | null;
    totalCredits: number;
    totalItems: number;
  };
  history: RecyclingActivity[];
  startSession: () => void;
  tick: () => void;
  addDetection: (category: string, confidence: number, credits: number) => void;
  setLatestDetection: (detection: { category: string; confidence: number; credits: number; x?: number; y?: number; width?: number; height?: number } | null) => void;
  completeSession: () => void;
  cancelSession: () => void;
  loadHistory: () => void;
}

let sessionInterval: NodeJS.Timeout | null = null;

const DEFAULT_HISTORY: RecyclingActivity[] = [
  {
    id: "act_1",
    category: "Plastic Bottle",
    credits: 15,
    confidence: 94.8,
    date: "2026-07-10",
    time: "14:24",
    sessionId: "SES-9821-4B",
  },
  {
    id: "act_2",
    category: "Cardboard",
    credits: 25,
    confidence: 89.2,
    date: "2026-07-09",
    time: "09:15",
    sessionId: "SES-9204-7C",
  },
  {
    id: "act_3",
    category: "Glass Bottle",
    credits: 20,
    confidence: 97.5,
    date: "2026-07-08",
    time: "16:40",
    sessionId: "SES-8419-1A",
  },
  {
    id: "act_4",
    category: "Metal Can",
    credits: 15,
    confidence: 91.0,
    date: "2026-07-05",
    time: "11:02",
    sessionId: "SES-7128-5D",
  },
];

export const useSessionStore = create<SessionState>((set, get) => {
  const isClient = typeof window !== "undefined";

  return {
    activeSession: {
      id: null,
      status: "idle",
      timeLeft: 60,
      detections: [],
      latestDetection: null,
      totalCredits: 0,
      totalItems: 0,
    },
    history: [],

    loadHistory: async () => {
      const { useBackend, token } = useAuthStore.getState();
      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const { data } = await api.get("/api/v1/detect/history");
          const history = (data as any[]).map((d: any) => {
            const dateObj = new Date(d.created_at);
            const date = dateObj.toISOString().split("T")[0];
            const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return {
              id: `act_${d.id}`,
              category: d.waste_type,
              credits: d.credits_earned,
              confidence: d.confidence,
              date,
              time,
              sessionId: `SES-${d.session_id}`,
            };
          });
          set({ history });
          return;
        } catch (err) {
          console.warn("[SessionStore] Failed to load history from backend:", err);
        }
      }

      if (!isClient) return;
      const stored = localStorage.getItem("rw_recycling_history");
      if (stored) {
        set({ history: JSON.parse(stored) });
      } else {
        localStorage.setItem("rw_recycling_history", JSON.stringify(DEFAULT_HISTORY));
        set({ history: DEFAULT_HISTORY });
      }
    },

    startSession: async () => {
      const { useBackend, token } = useAuthStore.getState();
      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          const { data } = await api.post("/api/v1/sessions/start");
          set({
            activeSession: {
              id: data.session_code || String(Math.random()),
              status: "scanning",
              timeLeft: data.remaining_time,
              detections: [],
              latestDetection: null,
              totalCredits: 0,
              totalItems: 0,
            },
          });
          
          if (sessionInterval) clearInterval(sessionInterval);
          sessionInterval = setInterval(() => {
            get().tick();
          }, 1000);

          useToastStore.getState().addToast(`Session ${data.session_code} started! Deposit items now.`, "info");
          return;
        } catch (err: any) {
          const message = err.response?.data?.detail || "Another recycling terminal session is currently active. Please try again shortly.";
          useToastStore.getState().addToast(message, "error");
          return;
        }
      }

      const sessionId = `SES-${Math.floor(1000 + Math.random() * 9000)}-${Math.random()
        .toString(36)
        .substring(2, 4)
        .toUpperCase()}`;
      
      set({
        activeSession: {
          id: sessionId,
          status: "scanning",
          timeLeft: 60,
          detections: [],
          latestDetection: null,
          totalCredits: 0,
          totalItems: 0,
        },
      });

      if (sessionInterval) clearInterval(sessionInterval);
      sessionInterval = setInterval(() => {
        get().tick();
      }, 1000);

      useToastStore.getState().addToast(`Session ${sessionId} started! Deposit items now.`, "info");
    },

    tick: () => {
      const { activeSession, completeSession } = get();
      if (activeSession.status !== "scanning") return;

      if (activeSession.timeLeft <= 1) {
        completeSession();
      } else {
        set((state) => ({
          activeSession: {
            ...state.activeSession,
            timeLeft: state.activeSession.timeLeft - 1,
          },
        }));
      }
    },

    addDetection: (category, confidence, credits) => {
      const { activeSession } = get();
      if (activeSession.status !== "scanning") return;

      const newDetection: DetectionLog = {
        id: `det_${Math.random().toString(36).substring(2, 9)}`,
        category,
        confidence,
        credits,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      set((state) => ({
        activeSession: {
          ...state.activeSession,
          detections: [newDetection, ...state.activeSession.detections],
          totalCredits: state.activeSession.totalCredits + credits,
          totalItems: state.activeSession.totalItems + 1,
        },
      }));

      useToastStore.getState().addToast(`Detected ${category}! +${credits} Credits`, "success");
    },

    setLatestDetection: (detection) => {
      const { activeSession } = get();
      if (activeSession.status !== "scanning") return;

      set((state) => ({
        activeSession: {
          ...state.activeSession,
          latestDetection: detection,
        },
      }));
    },

    completeSession: async () => {
      const { activeSession, history } = get();
      if (activeSession.status !== "scanning") return;

      if (activeSession.detections.length === 0) {
        useToastStore.getState().addToast("No items detected! Please ensure items are in view.", "error");
        return;
      }

      const { useBackend, token } = useAuthStore.getState();
      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          if (activeSession.detections.length > 0) {
            const { detectionService } = await import("@/api/DetectionService");
            
            const payload = activeSession.detections.map(d => ({
              category: d.category,
              confidence: d.confidence / 100
            }));

            await detectionService.finalizeDetection(payload);
          }

          await api.post("/api/v1/sessions/end", null, { params: { status: "COMPLETED" } });
          await useAuthStore.getState().loadCurrentUser();
          await get().loadHistory();

          const totalCredits = activeSession.totalCredits;
          const totalItems = activeSession.totalItems;

          set({
            activeSession: {
              ...activeSession,
              status: "completed",
            },
          });

          if (sessionInterval) clearInterval(sessionInterval);

          useToastStore.getState().addToast(
            `Session complete! Earned ${totalCredits} EcoCredits for ${totalItems} items.`,
            "success"
          );
          
          setTimeout(() => {
            set((state) => ({
              activeSession: {
                id: null,
                status: "idle",
                timeLeft: 60,
                detections: [],
                latestDetection: null,
                totalCredits: 0,
                totalItems: 0,
              },
            }));
          }, 2500);
          
          return;
        } catch (err: any) {
          const message = err.response?.data?.detail || "Failed to finalize recycling session.";
          useToastStore.getState().addToast(message, "error");
          return;
        }
      }

      // Add to auth credits
      if (activeSession.detections.length > 0) {
        useAuthStore.getState().addCredits(activeSession.totalCredits, activeSession.detections.length);
      }

      // Add each detection to global activity history
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newActivities: RecyclingActivity[] = activeSession.detections.map((d) => ({
        id: `act_${Math.random().toString(36).substring(2, 9)}`,
        category: d.category,
        credits: d.credits,
        confidence: d.confidence,
        date: dateStr,
        time: timeStr,
        sessionId: activeSession.id || "UNKNOWN",
      }));

      const updatedHistory = [...newActivities, ...history];
      
      const totalCredits = activeSession.totalCredits;
      const totalItems = activeSession.totalItems;
      
      set({
        activeSession: {
          ...activeSession,
          status: "completed",
        },
        history: updatedHistory,
      });

      if (sessionInterval) clearInterval(sessionInterval);

      if (isClient) {
        localStorage.setItem("rw_recycling_history", JSON.stringify(updatedHistory));
      }

      useToastStore
        .getState()
        .addToast(
          `Session complete! Earned ${totalCredits} EcoCredits for ${totalItems} items.`,
          "success"
        );
        
      setTimeout(() => {
        set((state) => ({
          activeSession: {
            id: null,
            status: "idle",
            timeLeft: 60,
            detections: [],
            latestDetection: null,
            totalCredits: 0,
            totalItems: 0,
          },
        }));
      }, 2500);
    },

    cancelSession: async () => {
      const { activeSession } = get();
      if (activeSession.status !== "scanning") return;

      const { useBackend, token } = useAuthStore.getState();
      if (useBackend && token && !token.startsWith("mock-")) {
        try {
          await api.post("/api/v1/sessions/end", null, { params: { status: "EXPIRED" } });
        } catch (err) {
          console.warn("[SessionStore] Failed to end session on cancel:", err);
        }
      }

      set({
        activeSession: {
          id: null,
          status: "idle",
          timeLeft: 60,
          detections: [],
          latestDetection: null,
          totalCredits: 0,
          totalItems: 0,
        },
      });

      if (sessionInterval) clearInterval(sessionInterval);

      useToastStore.getState().addToast("Session cancelled by user.", "warning");
    },
  };
});
