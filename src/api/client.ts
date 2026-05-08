import axios from "axios";
const BASE_URL = "https://flowledger-server.onrender.com/v1";
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
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

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
apiClient.interceptors.response.use((response) => response, (error) => {
  logApiError(error);
  return Promise.reject(error);
});
