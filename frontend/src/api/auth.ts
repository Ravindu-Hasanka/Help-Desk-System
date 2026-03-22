import { apiGet, apiPost } from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

export type RefreshAccessTokenResponse = {
  accessToken: string;
};

export function login(payload: LoginPayload) {
  return apiPost<AuthTokens, LoginPayload>("/auth/login", payload);
}

export function refresh(refreshToken: string) {
  return apiPost<RefreshAccessTokenResponse>("/auth/refresh", undefined, {
    params: { refreshToken },
  });
}

export function getMe() {
  return apiGet<CurrentUser>("/auth/me");
}
