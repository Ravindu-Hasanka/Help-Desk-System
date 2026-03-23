import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BarChart3, CheckCircle2, Clock, Ticket } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../components/StatCard";
import {
  getAgentPerformance,
  getApiErrorMessage,
  getDashboardSummary,
  getTickets,
  getTicketsByCategory,
  getTicketsByPriority,
  getTicketsByStatus,
  type AgentPerformanceItem,
  type ApiTicket,
  type DashboardChartItem,
  type DashboardSummary,
} from "../api";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";

const EMPTY_SUMMARY: DashboardSummary = {
  totalTickets: 0,
  openTickets: 0,
  inProgressTickets: 0,
  resolvedTickets: 0,
  closedTickets: 0,
};

function normalizeChartLabel(label: string) {
  switch (label.trim().toLowerCase()) {
    case "inprogress":
      return "In Progress";
    default:
      return label;
  }
}

function ChartCard({
  title,
  data,
  barColor,
  emptyMessage,
  dataKey = "count",
}: {
  title: string;
  data: Array<{ label: string; count: number }>;
  barColor: string;
  emptyMessage: string;
  dataKey?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {data.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(220, 13%, 91%)" }} />
            <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [categoryData, setCategoryData] = useState<DashboardChartItem[]>([]);
  const [priorityData, setPriorityData] = useState<DashboardChartItem[]>([]);
  const [statusData, setStatusData] = useState<DashboardChartItem[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceItem[]>([]);
  const [recentTickets, setRecentTickets] = useState<ApiTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const [
          summaryResponse,
          categoryResponse,
          priorityResponse,
          statusResponse,
          agentPerformanceResponse,
          recentTicketsResponse,
        ] = await Promise.all([
          getDashboardSummary(),
          getTicketsByCategory(),
          getTicketsByPriority(),
          getTicketsByStatus(),
          getAgentPerformance(),
          getTickets({ page: 1, pageSize: 5 }),
        ]);

        setSummary(summaryResponse);
        setCategoryData(categoryResponse.map((item) => ({ ...item, label: normalizeChartLabel(item.label) })));
        setPriorityData(priorityResponse.map((item) => ({ ...item, label: normalizeChartLabel(item.label) })));
        setStatusData(statusResponse.map((item) => ({ ...item, label: normalizeChartLabel(item.label) })));
        setAgentPerformance(
          agentPerformanceResponse.map((item) => ({
            ...item,
            name: item.name.trim() || `User #${item.userId}`,
          })),
        );
        setRecentTickets(recentTicketsResponse);
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your help desk activity</p>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tickets"
          value={summary.totalTickets}
          icon={<Ticket className="h-4 w-4" />}
          trend={isLoading ? "Loading..." : "Across the current ticket set"}
        />
        <StatCard label="Open" value={summary.openTickets} icon={<AlertCircle className="h-4 w-4" />} />
        <StatCard label="In Progress" value={summary.inProgressTickets} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Resolved" value={summary.resolvedTickets} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Tickets by Category"
          data={categoryData}
          barColor="hsl(217, 91%, 60%)"
          emptyMessage="No category data available."
        />
        <ChartCard
          title="Tickets by Priority"
          data={priorityData}
          barColor="hsl(38, 92%, 50%)"
          emptyMessage="No priority data available."
        />
        <ChartCard
          title="Tickets by Status"
          data={statusData}
          barColor="hsl(160, 84%, 39%)"
          emptyMessage="No status data available."
        />
        <ChartCard
          title="Agent Performance"
          data={agentPerformance.map((item) => ({
            label: item.name,
            count: item.ticketCount,
          }))}
          barColor="hsl(262, 52%, 47%)"
          emptyMessage="No assigned ticket data available."
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent Tickets</h2>
          </div>
          <Link to="/tickets" className="text-xs font-medium text-primary transition-snappy hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">Loading dashboard...</div>
        ) : recentTickets.length === 0 ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">No tickets found.</div>
        ) : (
          <div className="divide-y divide-border">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="grid gap-3 px-5 py-3 transition-snappy hover:bg-muted/50 md:grid-cols-[minmax(8rem,9rem)_minmax(0,1fr)_auto_auto_auto] md:items-center"
              >
                <span className="block truncate text-xs font-medium text-muted-foreground">{ticket.ticketNumber}</span>
                <span className="block min-w-0 truncate text-sm font-medium text-foreground">{ticket.title}</span>
                <div className="md:justify-self-start">
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="md:justify-self-start">
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <span className="text-xs text-muted-foreground md:justify-self-end">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
