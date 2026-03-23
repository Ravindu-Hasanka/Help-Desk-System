import { apiGet } from "./client";
import type { TicketPriority, TicketStatus } from "./tickets";

type RawTicketReport = {
  ticketNumber?: string | null;
  title?: string | null;
  status?: string | null;
  priority?: string | null;
  createdAt?: string | null;
};

export type TicketReport = {
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
};

export type TicketReportFilters = {
  status?: TicketStatus | "all";
  categoryId?: number;
  from?: string;
  to?: string;
};

function normalizeStatus(status: RawTicketReport["status"]): TicketStatus {
  switch (String(status ?? "").trim().toLowerCase()) {
    case "inprogress":
    case "in-progress":
      return "in-progress";
    case "pending":
      return "pending";
    case "resolved":
      return "resolved";
    case "closed":
      return "closed";
    default:
      return "open";
  }
}

function normalizePriority(priority: RawTicketReport["priority"]): TicketPriority {
  switch (String(priority ?? "").trim().toLowerCase()) {
    case "low":
      return "low";
    case "high":
      return "high";
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

function normalizeTicketReport(ticket: RawTicketReport): TicketReport {
  return {
    ticketNumber: ticket.ticketNumber?.trim() || "TKT-UNKNOWN",
    title: ticket.title?.trim() || "Untitled ticket",
    status: normalizeStatus(ticket.status),
    priority: normalizePriority(ticket.priority),
    createdAt: ticket.createdAt ?? new Date().toISOString(),
  };
}

export async function getTicketReports(filters?: TicketReportFilters) {
  const params: Record<string, string | number> = {};

  if (filters?.status && filters.status !== "all") {
    params.status = statusToBackendValue(filters.status);
  }

  if (typeof filters?.categoryId === "number") {
    params.categoryId = filters.categoryId;
  }

  if (filters?.from) {
    params.from = filters.from;
  }

  if (filters?.to) {
    params.to = filters.to;
  }

  const tickets = await apiGet<RawTicketReport[]>("/reports/tickets", { params });
  return tickets.map(normalizeTicketReport);
}
