import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5197/api";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function clearAuthTokens() {
  clearAccessToken();
  clearRefreshToken();
}

let refreshRequest: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshRequest) {
    refreshRequest = axios
      .post<{ accessToken: string }>(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        null,
        {
          params: { refreshToken },
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        clearAuthTokens();
        return null;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const requestUrl = originalRequest?.url ?? "";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      return refreshAccessToken().then((newAccessToken) => {
        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return apiClient(originalRequest);
      });
    }

    if (error.response?.status === 401) {
      clearAuthTokens();
    }

    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig<TPayload>,
) {
  const { data } = await apiClient.post<TResponse>(url, payload, config);
  return data;
}

export async function apiPut<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig<TPayload>,
) {
  const { data } = await apiClient.put<TResponse>(url, payload, config);
  return data;
}

export async function apiPatch<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig<TPayload>,
) {
  const { data } = await apiClient.patch<TResponse>(url, payload, config);
  return data;
}

export async function apiDelete<TResponse>(url: string, config?: AxiosRequestConfig) {
  const { data } = await apiClient.delete<TResponse>(url, config);
  return data;
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Something went wrong. Please try again.";
  }

  const response = error.response?.data;

  if (response?.message) {
    return response.message;
  }

  if (response?.error) {
    return response.error;
  }

  const firstValidationMessage = response?.errors
    ? Object.values(response.errors).flat()[0]
    : undefined;

  return firstValidationMessage ?? error.message ?? "Something went wrong. Please try again.";
}
