import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mockCategories } from "../lib/mock-data";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", categoryId: "1", priority: "medium" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: just navigate back
    navigate("/tickets");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/tickets" className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Create Ticket</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Brief summary of the issue"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the issue in detail..."
            className="mt-1 block w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {mockCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link to="/tickets" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted">
            Cancel
          </Link>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90">
            Create Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
