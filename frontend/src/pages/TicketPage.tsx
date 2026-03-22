import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { getApiErrorMessage, getCategories, getTickets, getUsers, type ApiTicket, type ApiUser, type Category, type TicketPriority, type TicketStatus } from "../api";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";

export default function TicketsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesResponse, usersResponse] = await Promise.all([
          getCategories(),
          user?.role === "Admin" ? getUsers() : Promise.resolve([]),
        ]);

        setCategories(categoriesResponse);
        setUsers(usersResponse);
      } catch (metadataError) {
        setPageError(getApiErrorMessage(metadataError));
      }
    };

    void loadMetadata();
  }, [user?.role]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const response = await getTickets({
          search,
          status: statusFilter,
          priority: priorityFilter,
          pageSize: 100,
        });

        setTickets(response);
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTickets();
  }, [priorityFilter, search, statusFilter]);

  const getCategoryName = (categoryId: number) =>
    categories.find((category) => category.categoryId === categoryId)?.categoryName ?? `Category #${categoryId}`;

  const getAssigneeName = (assigneeId: number | null) => {
    if (assigneeId === null) {
      return "Unassigned";
    }

    const matchedUser =
      users.find((existingUser) => existingUser.id === assigneeId) ??
      (user?.id === assigneeId
        ? {
            id: user.id,
            fullName: user.name,
          }
        : null);

    return matchedUser?.fullName ?? `User #${assigneeId}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tickets</h1>
          <p className="text-sm text-muted-foreground">{tickets.length} tickets found</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as TicketStatus | "all")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as TicketPriority | "all")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">Loading tickets...</div>
        ) : (
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
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="transition-snappy hover:bg-muted/50">
                  <td className="px-4 py-2.5">
                    <Link to={`/tickets/${ticket.id}`} className="text-xs font-medium text-primary hover:underline">
                      {ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:underline">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {getCategoryName(ticket.categoryId)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {getAssigneeName(ticket.assignedToUserId)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
