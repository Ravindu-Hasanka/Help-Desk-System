import { apiClient, apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";

type RawTicket = {
  ticketId?: number;
  id?: number;
  ticketNumber?: string | null;
  title?: string | null;
  description?: string | null;
  categoryId?: number | null;
  status?: string | number | null;
  priority?: string | number | null;
  createdByUserId?: number | null;
  assignedToUserId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type RawAttachment = {
  attachmentId?: number;
  id?: number;
  ticketId?: number | null;
  originalFileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
};

export type TicketStatus = "open" | "in-progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export type Ticket = {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  categoryId: number;
  status: TicketStatus;
  priority: TicketPriority;
  createdByUserId: number;
  assignedToUserId: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type TicketAttachment = {
  attachmentId: number;
  ticketId: number;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type TicketFilters = {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  categoryId?: number;
  assignedTo?: number;
  createdBy?: number;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
};

export type UpdateTicketPayload = {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
};

function normalizeStatus(status: RawTicket["status"]): TicketStatus {
  switch (String(status ?? "").trim().toLowerCase()) {
    case "1":
    case "open":
      return "open";
    case "2":
    case "inprogress":
    case "in-progress":
      return "in-progress";
    case "3":
    case "pending":
      return "pending";
    case "4":
    case "resolved":
      return "resolved";
    case "5":
    case "closed":
      return "closed";
    default:
      return "open";
  }
}

function normalizePriority(priority: RawTicket["priority"]): TicketPriority {
  switch (String(priority ?? "").trim().toLowerCase()) {
    case "1":
    case "low":
      return "low";
    case "2":
    case "medium":
      return "medium";
    case "3":
    case "high":
      return "high";
    case "4":
    case "critical":
      return "critical";
    default:
      return "medium";
  }
}

function statusToBackendValue(status: TicketStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "in-progress":
      return "InProgress";
    case "pending":
      return "Pending";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
  }
}

function statusToBackendNumber(status: TicketStatus) {
  switch (status) {
    case "open":
      return 1;
    case "in-progress":
      return 2;
    case "pending":
      return 3;
    case "resolved":
      return 4;
    case "closed":
      return 5;
  }
}

function priorityToBackendValue(priority: TicketPriority) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "critical":
      return "Critical";
  }
}

function priorityToBackendNumber(priority: TicketPriority) {
  switch (priority) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    case "critical":
      return 4;
  }
}

function normalizeTicket(ticket: RawTicket): Ticket {
  return {
    id: ticket.ticketId ?? ticket.id ?? 0,
    ticketNumber: ticket.ticketNumber?.trim() || "TKT-UNKNOWN",
    title: ticket.title?.trim() || "Untitled ticket",
    description: ticket.description?.trim() || "",
    categoryId: ticket.categoryId ?? 0,
    status: normalizeStatus(ticket.status),
    priority: normalizePriority(ticket.priority),
    createdByUserId: ticket.createdByUserId ?? 0,
    assignedToUserId: ticket.assignedToUserId ?? null,
    createdAt: ticket.createdAt ?? new Date().toISOString(),
    updatedAt: ticket.updatedAt ?? null,
  };
}

function normalizeAttachment(attachment: RawAttachment): TicketAttachment {
  return {
    attachmentId: attachment.attachmentId ?? attachment.id ?? 0,
    ticketId: attachment.ticketId ?? 0,
    originalFileName: attachment.originalFileName?.trim() || "attachment",
    fileType: attachment.fileType?.trim() || "application/octet-stream",
    fileSize: attachment.fileSize ?? 0,
    uploadedAt: attachment.uploadedAt ?? new Date().toISOString(),
  };
}

export async function getTickets(filters?: TicketFilters) {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? 100,
  };

  if (filters?.status && filters.status !== "all") {
    params.status = statusToBackendValue(filters.status);
  }

  if (filters?.priority && filters.priority !== "all") {
    params.priority = priorityToBackendValue(filters.priority);
  }

  if (typeof filters?.categoryId === "number") {
    params.categoryId = filters.categoryId;
  }

  if (typeof filters?.assignedTo === "number") {
    params.assignedTo = filters.assignedTo;
  }

  if (typeof filters?.createdBy === "number") {
    params.createdBy = filters.createdBy;
  }

  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters?.from) {
    params.from = filters.from;
  }

  if (filters?.to) {
    params.to = filters.to;
  }

  const tickets = await apiGet<RawTicket[]>("/tickets", { params });
  return tickets.map(normalizeTicket);
}

export async function getTicketById(ticketId: number) {
  const ticket = await apiGet<RawTicket>(`/tickets/${ticketId}`);
  return normalizeTicket(ticket);
}

export async function createTicket(payload: CreateTicketPayload) {
  const ticket = await apiPost<
    RawTicket,
    { title: string; description: string; categoryId: number; priority: number }
  >("/tickets", {
    title: payload.title.trim(),
    description: payload.description.trim(),
    categoryId: payload.categoryId,
    priority: priorityToBackendNumber(payload.priority),
  });

  return normalizeTicket(ticket);
}

export async function updateTicket(ticketId: number, payload: UpdateTicketPayload) {
  const ticket = await apiPut<
    RawTicket,
    { title: string; description: string; categoryId: number; priority: number }
  >(`/tickets/${ticketId}`, {
    title: payload.title.trim(),
    description: payload.description.trim(),
    categoryId: payload.categoryId,
    priority: priorityToBackendNumber(payload.priority),
  });

  return normalizeTicket(ticket);
}

export function deleteTicket(ticketId: number) {
  return apiDelete<unknown>(`/tickets/${ticketId}`);
}

export function updateTicketStatus(ticketId: number, status: TicketStatus) {
  return apiPatch<unknown>(`/tickets/${ticketId}/status`, undefined, {
    params: { status: statusToBackendNumber(status) },
  });
}

export function updateTicketPriority(ticketId: number, priority: TicketPriority) {
  return apiPatch<unknown>(`/tickets/${ticketId}/priority`, undefined, {
    params: { priority: priorityToBackendNumber(priority) },
  });
}

export function assignTicket(ticketId: number, assignedToUserId: number) {
  return apiPatch<unknown>(`/tickets/${ticketId}/assign`, undefined, {
    params: { assignedToUserId },
  });
}

export async function getTicketAttachments(ticketId: number) {
  const attachments = await apiGet<RawAttachment[]>(`/tickets/attachments/${ticketId}`);
  return attachments.map(normalizeAttachment);
}

export async function uploadTicketAttachment(ticketId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<RawAttachment>(`/tickets/attachments/${ticketId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizeAttachment(data);
}

export async function downloadTicketAttachment(ticketId: number, attachmentId: number) {
  const { data } = await apiClient.get<Blob>(`/tickets/attachments/${ticketId}/${attachmentId}`, {
    responseType: "blob",
  });

  return data;
}

export function deleteTicketAttachment(ticketId: number, attachmentId: number) {
  return apiDelete<unknown>(`/tickets/attachments/${ticketId}/${attachmentId}`);
}
