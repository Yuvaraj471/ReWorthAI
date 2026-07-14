import { create } from "zustand";
import api, { isBackendReachable } from "@/lib/api";

export interface UserProfile {
  id?: number;
  name: string;
  registerNumber: string;
  department: string;
  year: string;
  email: string;
  ecoCredits: number;
  rank: number;
  carbonSaved: number;
  bottlesRecycled: number;
  totalSessions: number;
  role?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  useBackend: boolean; // true when backend is reachable
  login: (email: string, password: string, type: "student" | "admin") => Promise<boolean>;
  register: (data: Omit<UserProfile, "ecoCredits" | "rank" | "carbonSaved" | "bottlesRecycled" | "totalSessions"> & { password?: string; confirm_password?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addCredits: (amount: number, count?: number) => void;
  loadCurrentUser: () => Promise<void>;
  checkBackend: () => Promise<void>;
}

const isClient = typeof window !== "undefined";

// Convert backend user response to our frontend UserProfile shape
function mapBackendUser(data: Record<string, unknown>, isAdminRole: boolean): UserProfile {
  return {
    id: data.id as number,
    name: data.name as string,
    email: data.email as string,
    registerNumber: (data.register_number as string) || (isAdminRole ? "ADMIN001" : ""),
    department: (data.department as string) || (isAdminRole ? "Sustainability Office" : ""),
    year: (data.year as string) || (isAdminRole ? "Staff" : ""),
    ecoCredits: (data.eco_credits as number) || 0,
    rank: (data.rank as number) || 99,
    carbonSaved: (data.carbon_saved as number) || 0,
    bottlesRecycled: (data.bottles_recycled as number) || 0,
    totalSessions: (data.total_sessions as number) || 0,
    role: data.role as string,
  };
}

// Fallback mock data for when the backend is offline
const DEFAULT_STUDENT: UserProfile = {
  name: "Alex Rivera",
  registerNumber: "2024CS1082",
  department: "Computer Science",
  year: "3rd Year",
  email: "alex.rivera@reworth.ai",
  ecoCredits: 450,
  rank: 12,
  carbonSaved: 14.5,
  bottlesRecycled: 58,
  totalSessions: 18,
};

const DEFAULT_ADMIN: UserProfile = {
  name: "Admin Coordinator",
  registerNumber: "ADMIN001",
  department: "Sustainability Office",
  year: "Staff",
  email: "admin@reworth.ai",
  ecoCredits: 0,
  rank: 0,
  carbonSaved: 0,
  bottlesRecycled: 0,
  totalSessions: 0,
};

function persist(user: UserProfile | null, isAdmin: boolean, isAuth: boolean, token: string | null, refreshToken: string | null) {
  if (!isClient) return;
  if (user) {
    localStorage.setItem("rw_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("rw_user");
  }
  localStorage.setItem("rw_is_admin", String(isAdmin));
  localStorage.setItem("rw_is_auth", String(isAuth));
  if (token) localStorage.setItem("rw_token", token); else localStorage.removeItem("rw_token");
  if (refreshToken) localStorage.setItem("rw_refresh_token", refreshToken); else localStorage.removeItem("rw_refresh_token");
}

export const useAuthStore = create<AuthState>((set, get) => {
  const storedUser = isClient ? localStorage.getItem("rw_user") : null;
  const storedIsAdmin = isClient ? localStorage.getItem("rw_is_admin") === "true" : false;
  const storedIsAuth = isClient ? localStorage.getItem("rw_is_auth") === "true" : false;
  const storedToken = isClient ? localStorage.getItem("rw_token") : null;
  const storedRefreshToken = isClient ? localStorage.getItem("rw_refresh_token") : null;

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAdmin: storedIsAdmin,
    isAuthenticated: storedIsAuth,
    token: storedToken,
    refreshToken: storedRefreshToken,
    useBackend: true,

    checkBackend: async () => {
      const reachable = await isBackendReachable();
      set({ useBackend: reachable });
    },

    login: async (email, password, type) => {
      const { useBackend } = get();

      // ── Try backend API first ──
      if (useBackend) {
        try {
          const endpoint = type === "admin"
            ? "/api/v1/auth/admin/login"
            : "/api/v1/auth/student/login";

          const { data: tokens } = await api.post(endpoint, { email, password });

          // Store tokens immediately so /me can read them
          localStorage.setItem("rw_token", tokens.access_token);
          localStorage.setItem("rw_refresh_token", tokens.refresh_token);

          // Fetch full user profile
          const { data: meData } = await api.get("/api/v1/auth/me");
          const isAdminRole = meData.role === "ADMIN";
          const profile = mapBackendUser(meData, isAdminRole);

          // Hydrate any local-only fields from previous localStorage
          const localExtras = isClient ? localStorage.getItem("rw_user_extras_" + meData.id) : null;
          if (localExtras) {
            const extras = JSON.parse(localExtras);
            profile.registerNumber = extras.registerNumber || profile.registerNumber;
            profile.department = extras.department || profile.department;
            profile.year = extras.year || profile.year;
          }

          set({
            user: profile,
            isAdmin: isAdminRole,
            isAuthenticated: true,
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          persist(profile, isAdminRole, true, tokens.access_token, tokens.refresh_token);
          return true;
        } catch (err: unknown) {
          console.warn("[Auth] Backend login failed:", err);
          return false;
        }
      }

      // ── Mock fallback ──
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (type === "admin") {
        if (email === "admin@reworth.ai" && password === "admin123") {
          set({ user: DEFAULT_ADMIN, isAdmin: true, isAuthenticated: true, token: "mock-admin-jwt-token", refreshToken: null });
          persist(DEFAULT_ADMIN, true, true, "mock-admin-jwt-token", null);
          return true;
        }
        // Also try the seeded admin from backend
        if (email === "adminreworthai@gmail.com" && password === "sanjai.t112233") {
          set({ user: DEFAULT_ADMIN, isAdmin: true, isAuthenticated: true, token: "mock-admin-jwt-token", refreshToken: null });
          persist(DEFAULT_ADMIN, true, true, "mock-admin-jwt-token", null);
          return true;
        }
        return false;
      } else {
        if (email.includes("@")) {
          const registeredUsers = isClient ? localStorage.getItem("rw_registered_students") : null;
          let studentUser = DEFAULT_STUDENT;

          if (registeredUsers) {
            const parsed = JSON.parse(registeredUsers);
            const matched = parsed.find((u: Record<string, unknown>) => u.email === email);
            if (matched) {
              studentUser = { ...DEFAULT_STUDENT, ...matched };
            }
          }

          set({ user: studentUser, isAdmin: false, isAuthenticated: true, token: "mock-student-jwt-token", refreshToken: null });
          persist(studentUser, false, true, "mock-student-jwt-token", null);
          return true;
        }
        return false;
      }
    },

    register: async (data) => {
      const { useBackend } = get();

      if (useBackend) {
        try {
          await api.post("/api/v1/auth/student/register", {
            name: data.name,
            email: data.email,
            password: data.password || "password123",
            confirm_password: data.confirm_password || data.password || "password123",
            register_number: data.registerNumber,
            department: data.department,
            year: data.year,
          });
          return true;
        } catch (err: unknown) {
          console.warn("[Auth] Backend registration failed:", err);
          return false;
        }
      }

      // Mock fallback
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newStudent: UserProfile = {
        ...data,
        ecoCredits: 0,
        rank: 99,
        carbonSaved: 0,
        bottlesRecycled: 0,
        totalSessions: 0,
      };
      if (isClient) {
        const registeredUsers = localStorage.getItem("rw_registered_students");
        const list = registeredUsers ? JSON.parse(registeredUsers) : [];
        list.push(newStudent);
        localStorage.setItem("rw_registered_students", JSON.stringify(list));
      }
      return true;
    },

    logout: () => {
      set({ user: null, isAdmin: false, isAuthenticated: false, token: null, refreshToken: null });
      persist(null, false, false, null, null);
    },

    loadCurrentUser: async () => {
      const { token, useBackend } = get();
      if (!token || !useBackend || token.startsWith("mock-")) return;

      try {
        const { data: meData } = await api.get("/api/v1/auth/me");
        const isAdminRole = meData.role === "ADMIN";
        const profile = mapBackendUser(meData, isAdminRole);

        // Preserve local-only fields
        const currentUser = get().user;
        if (currentUser) {
          profile.registerNumber = profile.registerNumber || currentUser.registerNumber;
          profile.department = profile.department || currentUser.department;
          profile.year = profile.year || currentUser.year;
        }

        set({ user: profile, isAdmin: isAdminRole });
        persist(profile, isAdminRole, true, token, get().refreshToken);
      } catch {
        // Token invalid or expired — already handled by interceptor
      }
    },

    updateProfile: (data) => {
      const currentUser = get().user;
      if (!currentUser) return;
      const updated = { ...currentUser, ...data };
      set({ user: updated });

      if (isClient) {
        localStorage.setItem("rw_user", JSON.stringify(updated));
        // Persist local-only fields keyed by user id
        if (currentUser.id) {
          localStorage.setItem("rw_user_extras_" + currentUser.id, JSON.stringify({
            registerNumber: updated.registerNumber,
            department: updated.department,
            year: updated.year,
          }));
        }
      }
    },

    addCredits: (amount, count = 1) => {
      const currentUser = get().user;
      if (!currentUser) return;
      const updated = {
        ...currentUser,
        ecoCredits: currentUser.ecoCredits + amount,
        bottlesRecycled: currentUser.bottlesRecycled + count,
        carbonSaved: parseFloat((currentUser.carbonSaved + count * 0.25).toFixed(2)),
        totalSessions: currentUser.totalSessions + 1,
      };
      set({ user: updated });
      if (isClient) {
        localStorage.setItem("rw_user", JSON.stringify(updated));
      }
    },
  };
});
