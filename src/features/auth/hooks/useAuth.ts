import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { toast } from "@/lib/toast";

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logoutStore = useAuthStore((state) => state.logout);

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/auth/signup", data);
      return response.data;
    },
    onSuccess: async (data) => {
      const { user, accessToken, refreshToken } = data.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }
      setUser(user);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/auth/login", data);
      return response.data;
    },
    onSuccess: async (data) => {
      const { user, accessToken, refreshToken } = data.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }
      setUser(user);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: async () => {
      await logoutStore();
      router.replace("/(auth)/login");
    },
  });

  return {
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
