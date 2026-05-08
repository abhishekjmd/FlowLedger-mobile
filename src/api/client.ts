import axios from "axios";

const BASE_URL = "https://flowledger-server.onrender.com/v1";

/**
 * Holds a getter function supplied by useApiAuth.
 * Called on every request so the token is always fresh — no race conditions.
 */
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (
  getter: (() => Promise<string | null>) | null
) => {
  tokenGetter = getter;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 15000,
});

export const getApiErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object") return "Something went wrong";

  const err = error as {
    code?: string;
    message?: string;
    response?: { data?: { message?: string } };
  };

  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (typeof err.message === "string" && err.message.length > 0) return err.message;

  return "Something went wrong";
};

// Dynamically inject fresh token on every request.
apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (__DEV__) {
        console.warn(`[API DEBUG] tokenGetter returned null for ${config.url}`);
      }
    } catch (error) {
      console.error(`[API DEBUG] Error fetching token for ${config.url}:`, error);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    if (response?.status === 401) {
      logApiError(config, response);
    }
    return Promise.reject(error);
  }
);

function logApiError(config: any, response: any) {
  const fullUrl = `${config.baseURL}${config.url}`;
  console.error(`[API ERROR] 401 Unauthorized at ${fullUrl}`);
  console.error(`[API ERROR] Method: ${config.method?.toUpperCase()}`);
  console.error(`[API ERROR] Auth Header: ${config.headers?.Authorization ? "Present (Bearer eyJhbGci...)" : "MISSING"}`);
  console.error(`[API ERROR] Response Body: ${JSON.stringify(response.data)}`);
  
  if (__DEV__) {
    console.warn(`[API TIP] Current BASE_URL is set to: ${BASE_URL}`);
  }
}
