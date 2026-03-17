import { Ticket, AlertCircle, CheckCircle2, Clock, BarChart3, Users } from "lucide-react";
import StatCard from "../components/StatCard.tsx";
import { mockTickets, mockUsers, mockCategories, getUserById } from "../lib/mock-data";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statusCounts = {
  total: mockTickets.length,
  open: mockTickets.filter(t => t.status === 'open').length,
  inProgress: mockTickets.filter(t => t.status === 'in-progress').length,
  resolved: mockTickets.filter(t => t.status === 'resolved').length,
  closed: mockTickets.filter(t => t.status === 'closed').length,
};

const categoryData = mockCategories.map(cat => ({
  name: cat.categoryName,
  count: mockTickets.filter(t => t.categoryId === cat.id).length,
})).filter(d => d.count > 0);

const agentData = mockUsers
  .filter(u => u.role === 'agent')
  .map(agent => ({
    name: agent.fullName.split(' ')[0],
    assigned: mockTickets.filter(t => t.assignedToUserId === agent.id).length,
    resolved: mockTickets.filter(t => t.assignedToUserId === agent.id && t.status === 'resolved').length,
  }));

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(160, 84%, 39%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 52%, 47%)",
];

export default function DashboardPage() {
  const recentTickets = [...mockTickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your help desk activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={statusCounts.total} icon={<Ticket className="h-4 w-4" />} trend="+3 this week" />
        <StatCard label="Open" value={statusCounts.open} icon={<AlertCircle className="h-4 w-4" />} />
        <StatCard label="In Progress" value={statusCounts.inProgress} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Resolved" value={statusCounts.resolved} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Tickets by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(220, 13%, 91%)' }} />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Agent Performance</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid hsl(220, 13%, 91%)' }} />
              <Bar dataKey="assigned" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Assigned" />
              <Bar dataKey="resolved" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs font-medium text-primary transition-snappy hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {recentTickets.map(ticket => {
            const creator = getUserById(ticket.createdByUserId);
            return (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="flex items-center gap-4 px-5 py-3 transition-snappy hover:bg-muted/50">
                <span className="w-20 text-xs font-medium text-muted-foreground">{ticket.ticketNumber}</span>
                <span className="flex-1 truncate text-sm font-medium text-foreground">{ticket.title}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="w-24 truncate text-xs text-muted-foreground">{creator?.fullName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
