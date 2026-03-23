import { apiGet } from "./client";

export type DashboardSummary = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
};

type RawDashboardSummary = {
  totalTickets?: number | null;
  openTickets?: number | null;
  inProgressTickets?: number | null;
  resolvedTickets?: number | null;
  closedTickets?: number | null;
};

type RawChartItem = {
  label?: string | null;
  count?: number | null;
};

type RawAgentPerformance = {
  userId?: number | null;
  name?: string | null;
  ticketCount?: number | null;
};

export type DashboardChartItem = {
  label: string;
  count: number;
};

export type AgentPerformanceItem = {
  userId: number;
  name: string;
  ticketCount: number;
};

function normalizeSummary(summary: RawDashboardSummary): DashboardSummary {
  return {
    totalTickets: summary.totalTickets ?? 0,
    openTickets: summary.openTickets ?? 0,
    inProgressTickets: summary.inProgressTickets ?? 0,
    resolvedTickets: summary.resolvedTickets ?? 0,
    closedTickets: summary.closedTickets ?? 0,
  };
}

function normalizeChartItem(item: RawChartItem): DashboardChartItem {
  return {
    label: item.label?.trim() || "Unknown",
    count: item.count ?? 0,
  };
}

function normalizeAgentPerformance(item: RawAgentPerformance): AgentPerformanceItem {
  return {
    userId: item.userId ?? 0,
    name: item.name?.trim() || "Unknown",
    ticketCount: item.ticketCount ?? 0,
  };
}

export async function getDashboardSummary() {
  const summary = await apiGet<RawDashboardSummary>("/dashboard/summary");
  return normalizeSummary(summary);
}

export async function getTicketsByCategory() {
  const items = await apiGet<RawChartItem[]>("/dashboard/tickets-by-category");
  return items.map(normalizeChartItem);
}

export async function getTicketsByPriority() {
  const items = await apiGet<RawChartItem[]>("/dashboard/tickets-by-priority");
  return items.map(normalizeChartItem);
}

export async function getTicketsByStatus() {
  const items = await apiGet<RawChartItem[]>("/dashboard/tickets-by-status");
  return items.map(normalizeChartItem);
}

export async function getAgentPerformance() {
  const items = await apiGet<RawAgentPerformance[]>("/dashboard/agent-performance");
  return items.map(normalizeAgentPerformance);
}
