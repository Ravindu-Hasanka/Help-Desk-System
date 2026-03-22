import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";

export type UserRole = "admin" | "agent" | "user";

type RawUser = {
  id: number;
  email: string;
  name?: string | null;
  phoneNo?: string | null;
  role?: string | number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
  phoneNo: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type UserFilters = {
  role?: UserRole | "all";
  isActive?: boolean;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNo?: string;
};

export type UpdateUserPayload = {
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phoneNo?: string;
};

export type UpdateUserStatusPayload = {
  isActive: boolean;
};

export type DeleteUserResponse = {
  message: string;
};

function normalizeRole(role: RawUser["role"]): UserRole {
  switch (String(role ?? "").trim().toLowerCase()) {
    case "1":
    case "admin":
      return "admin";
    case "2":
    case "supportagent":
    case "support agent":
    case "agent":
      return "agent";
    default:
      return "user";
  }
}

function roleToBackendValue(role: UserRole) {
  switch (role) {
    case "admin":
      return 1;
    case "agent":
      return 2;
    default:
      return 3;
  }
}

function normalizeUser(user: RawUser): User {
  return {
    id: user.id,
    fullName: user.name?.trim() || user.email,
    email: user.email,
    phoneNo: user.phoneNo?.trim() ?? "",
    role: normalizeRole(user.role),
    isActive: user.isActive ?? true,
    createdAt: user.createdAt ?? new Date().toISOString(),
    updatedAt: user.updatedAt ?? null,
  };
}

export async function getUsers(filters?: UserFilters) {
  const params: Record<string, string | boolean> = {};

  if (filters?.role && filters.role !== "all") {
    params.role =
      filters.role === "admin"
        ? "Admin"
        : filters.role === "agent"
          ? "SupportAgent"
          : "User";
  }

  if (typeof filters?.isActive === "boolean") {
    params.isActive = filters.isActive;
  }

  const users = await apiGet<RawUser[]>("/users", { params });
  return users.map(normalizeUser);
}

export async function getUserById(userId: number) {
  const user = await apiGet<RawUser>(`/users/${userId}`);
  return normalizeUser(user);
}

export async function createUser(payload: CreateUserPayload) {
  const user = await apiPost<
    RawUser,
    { name: string; email: string; password: string; phoneNo: string; role: number }
  >("/users", {
    name: payload.fullName.trim(),
    email: payload.email.trim(),
    password: payload.password,
    phoneNo: payload.phoneNo?.trim() ?? "",
    role: roleToBackendValue(payload.role),
  });

  return normalizeUser(user);
}

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  const user = await apiPut<
    RawUser,
    { name: string; email: string; phoneNo: string; role: number; isActive: boolean }
  >(`/users/${userId}`, {
    name: payload.fullName.trim(),
    email: payload.email.trim(),
    phoneNo: payload.phoneNo?.trim() ?? "",
    role: roleToBackendValue(payload.role),
    isActive: payload.isActive,
  });

  return normalizeUser(user);
}

export function updateUserStatus(userId: number, payload: UpdateUserStatusPayload) {
  return apiPatch<{ message: string }, UpdateUserStatusPayload>(`/users/${userId}/status`, payload);
}

export function deleteUser(userId: number) {
  return apiDelete<DeleteUserResponse>(`/users/${userId}`);
}
