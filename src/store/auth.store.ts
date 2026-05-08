import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "@/api/client";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  verified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasSessionToken: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasSessionToken: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, hasSessionToken: !!user, isLoading: false }),
  logout: async () => {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    set({ user: null, isAuthenticated: false, hasSessionToken: false, isLoading: false });
  },
  initialize: async () => {
    const [accessToken, refreshToken] = await AsyncStorage.multiGet(["accessToken", "refreshToken"]).then(
      (pairs) => [pairs[0][1], pairs[1][1]]
    );
    const hasAnyToken = !!(accessToken || refreshToken);

    if (!hasAnyToken) {
      set({ user: null, isAuthenticated: false, hasSessionToken: false, isLoading: false });
      return;
    }

    // Persisted session exists; keep user in the app while validation runs.
    set({ hasSessionToken: true, isLoading: true });

    try {
      const response = await apiClient.get("/user/me");
      set({ user: response.data.data.user, isAuthenticated: true, hasSessionToken: true, isLoading: false });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      // Only clear tokens when auth is definitely invalid.
      // Network/cold-start/server errors should not force logout.
      if (status === 401 || status === 403) {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        set({ user: null, isAuthenticated: false, hasSessionToken: false, isLoading: false });
        return;
      }

      set({
        user: null,
        isAuthenticated: hasAnyToken,
        hasSessionToken: hasAnyToken,
        isLoading: false,
      });
    }
  },
}));
