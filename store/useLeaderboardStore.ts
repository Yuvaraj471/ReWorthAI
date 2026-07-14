import { create } from "zustand";
import api from "@/lib/api";
import { useAuthStore } from "./useAuthStore";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  department: string;
  ecoCredits: number;
  isCurrentUser?: boolean;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  loadLeaderboard: () => void;
  getFilteredEntries: (searchQuery: string, departmentFilter: string) => LeaderboardEntry[];
}

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Machine Learning",
];

const MOCK_NAMES = [
  "Emily Watson", "Marcus Chen", "Sarah Jenkins", "Devin Kumar", "Chloe Vance",
  "David Miller", "Sophia Martinez", "Ryan Taylor", "Olivia Anderson", "James Thomas",
  "Amara Okafor", "Yuki Sato", "Carlos Ruiz", "Priya Patel", "Liam Connor",
  "Isabella Rossi", "Ahmed Al-Mansoor", "Zara Begum", "Lucas Dubois", "Zoe Carter",
  "Daniel Kim", "Mia Novak", "Ivan Petrov", "Freja Nielsen", "Siddharth Nair",
  "Anna Kowalski", "Ethan Hunt", "Selena Gomez", "Bruce Wayne", "Clark Kent",
  "Diana Prince", "Peter Parker", "Tony Stark", "Steve Rogers", "Natasha Romanoff",
  "Wanda Maximoff", "Barry Allen", "Arthur Curry", "Hal Jordan", "Victor Stone",
  "Oliver Queen", "John Diggle", "Felicity Smoak", "Barry Berkman", "Walter White",
  "Jesse Pinkman", "Saul Goodman", "Kim Wexler", "Gustavo Fring", "Lalo Salamanca",
];

function generateMockLeaderboard(): LeaderboardEntry[] {
  const user = useAuthStore.getState().user;

  const generated: LeaderboardEntry[] = MOCK_NAMES.map((name, index) => {
    const dept = DEPARTMENTS[index % DEPARTMENTS.length];
    const baseCredits = 650 - index * 11 + Math.floor(Math.random() * 5);
    return { rank: index + 1, name, department: dept, ecoCredits: baseCredits };
  });

  // Insert or update current user
  if (user && !user.registerNumber.startsWith("ADMIN")) {
    const existingIndex = generated.findIndex((e) => e.name === user.name);
    if (existingIndex !== -1) {
      generated[existingIndex].ecoCredits = user.ecoCredits;
      generated[existingIndex].isCurrentUser = true;
    } else {
      generated.push({
        rank: 99,
        name: user.name,
        department: user.department,
        ecoCredits: user.ecoCredits,
        isCurrentUser: true,
      });
    }
  }

  generated.sort((a, b) => b.ecoCredits - a.ecoCredits);
  return generated.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => {
  return {
    entries: [],

    loadLeaderboard: async () => {
      const { useBackend } = useAuthStore.getState();
      const user = useAuthStore.getState().user;

      // ── Try backend API ──
      if (useBackend) {
        try {
          const { data } = await api.get("/api/v1/leaderboard/", { params: { limit: 100 } });

          const entries: LeaderboardEntry[] = (data as Record<string, unknown>[]).map((item, idx) => ({
            rank: (item.rank as number) || idx + 1,
            name: item.name as string,
            department: (item.department as string) || DEPARTMENTS[idx % DEPARTMENTS.length],
            ecoCredits: (item.eco_credits as number) || 0,
            isCurrentUser: user ? (item.name as string) === user.name || (item.id as number) === user.id : false,
          }));

          // Sync user rank
          if (user && !user.registerNumber.startsWith("ADMIN")) {
            const myEntry = entries.find((e) => e.isCurrentUser);
            if (myEntry && myEntry.rank !== user.rank) {
              setTimeout(() => {
                useAuthStore.getState().updateProfile({ rank: myEntry.rank });
              }, 0);
            }
          }

          set({ entries });
          return;
        } catch (err) {
          console.warn("[Leaderboard] Backend fetch failed, falling back to mock:", err);
        }
      }

      // ── Mock fallback ──
      const ranked = generateMockLeaderboard();

      if (user && !user.registerNumber.startsWith("ADMIN")) {
        const myEntry = ranked.find((e) => e.isCurrentUser);
        if (myEntry && myEntry.rank !== user.rank) {
          setTimeout(() => {
            useAuthStore.getState().updateProfile({ rank: myEntry.rank });
          }, 0);
        }
      }

      set({ entries: ranked });
    },

    getFilteredEntries: (searchQuery, departmentFilter) => {
      const { entries } = get();
      return entries.filter((e) => {
        const matchesSearch =
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = departmentFilter === "All" || e.department === departmentFilter;
        return matchesSearch && matchesDept;
      });
    },
  };
});
