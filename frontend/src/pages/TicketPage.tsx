import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { mockTickets, mockCategories, getUserById, getCategoryById } from "../lib/mock-data";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import type { TicketStatus, TicketPriority } from "../lib/mock-data";

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");

  const filtered = mockTickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.ticketNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tickets</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} tickets found</p>
        </div>
        <Link to="/tickets/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as TicketStatus | "all")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as TicketPriority | "all")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Assignee</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(ticket => {
              const assignee = ticket.assignedToUserId ? getUserById(ticket.assignedToUserId) : null;
              const category = getCategoryById(ticket.categoryId);
              return (
                <tr key={ticket.id} className="transition-snappy hover:bg-muted/50">
                  <td className="px-4 py-2.5">
                    <Link to={`/tickets/${ticket.id}`} className="text-xs font-medium text-primary hover:underline">{ticket.ticketNumber}</Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:underline">{ticket.title}</Link>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-2.5"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{category?.categoryName}</td>
                  <td className="px-4 py-2.5">
                    {assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {assignee.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-muted-foreground">{assignee.fullName.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No tickets found</div>
        )}
      </div>
    </div>
  );
}
