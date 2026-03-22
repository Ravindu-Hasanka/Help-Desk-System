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

type RawCurrentUser = {
  id: number;
  email: string;
  name?: string | null;
  role?: string | number | null;
  isActive?: boolean | null;
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

function normalizeRole(role: RawCurrentUser["role"]) {
  switch (String(role ?? "").trim().toLowerCase()) {
    case "1":
    case "admin":
      return "Admin";
    case "2":
    case "supportagent":
    case "support agent":
      return "SupportAgent";
    case "3":
    case "user":
      return "User";
    default:
      return typeof role === "string" && role.trim() ? role.trim() : "User";
  }
}

function normalizeCurrentUser(user: RawCurrentUser): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name?.trim() || user.email,
    role: normalizeRole(user.role),
    isActive: user.isActive ?? true,
  };
}

export async function getMe() {
  const user = await apiGet<RawCurrentUser>("/auth/me");
  return normalizeCurrentUser(user);
}
