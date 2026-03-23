import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  getApiErrorMessage,
  getCategories,
  getTicketReports,
  type ApiTicketReport,
  type Category,
  type TicketStatus,
} from "../api";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";

export default function ReportsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<ApiTicketReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse);
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const reportResponse = await getTicketReports({
          status: statusFilter,
          categoryId: categoryFilter ? Number(categoryFilter) : undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        });

        setReports(reportResponse);
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, [categoryFilter, fromDate, statusFilter, toDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Review ticket data from the reports API</p>
        </div>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="text-sm font-medium text-foreground">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TicketStatus | "all")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Category</label>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Ticket Report Results</h2>
          <span className="text-xs text-muted-foreground">{reports.length} records</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="px-5 py-6 text-sm text-muted-foreground">No report data found for the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => (
                  <tr key={`${report.ticketNumber}-${report.createdAt}`} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{report.ticketNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{report.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={report.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
