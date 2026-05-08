import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = "https://flowledger-server.onrender.com/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const logApiError = (error: any) => {
  const method = error?.config?.method?.toUpperCase?.() || "UNKNOWN";
  const url = error?.config?.url || "UNKNOWN_URL";
  const status = error?.response?.status ?? "NO_STATUS";
  const message = error?.message || "Unknown API error";
  const responseData = error?.response?.data;
  const requestData = error?.config?.data;
  const requestParams = error?.config?.params;

  console.error(`[API ERROR] ${method} ${url} -> ${status}`);
  console.error("[API ERROR] message:", message);

  if (requestParams) {
    console.error("[API ERROR] params:", requestParams);
  }

  if (requestData) {
    console.error("[API ERROR] request body:", requestData);
  }

  if (responseData) {
    console.error("[API ERROR] response body:", responseData);
  }
};

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    logApiError(error);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true },
        );
        const { accessToken, refreshToken: nextRefreshToken } = response.data.data;

        await AsyncStorage.setItem("accessToken", accessToken);
        if (nextRefreshToken) {
          await AsyncStorage.setItem("refreshToken", nextRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        logApiError(refreshError);
        const refreshStatus = axios.isAxiosError(refreshError) ? refreshError.response?.status : undefined;

        // Only clear tokens when refresh token is definitely invalid.
        // Do not log the user out for transient network/server errors.
        if (refreshStatus === 401 || refreshStatus === 403) {
          await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
