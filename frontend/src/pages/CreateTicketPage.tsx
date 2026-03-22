import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createTicket, getApiErrorMessage, getCategories, type Category, type TicketPriority } from "../api";

type TicketFormState = {
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
};

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<TicketFormState>({
    title: "",
    description: "",
    categoryId: "",
    priority: "medium",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const response = await getCategories();
        setCategories(response);

        if (response.length > 0) {
          setForm((currentForm) => ({
            ...currentForm,
            categoryId: String(response[0].categoryId),
          }));
        }
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.description.trim() || !form.categoryId) {
      setFormError("Title, description, and category are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const createdTicket = await createTicket({
        title: form.title,
        description: form.description,
        categoryId: Number(form.categoryId),
        priority: form.priority,
      });

      navigate(`/tickets/${createdTicket.id}`);
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/tickets"
          className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Create Ticket</h1>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5">
        {formError && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
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
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                description: event.target.value,
              }))
            }
            placeholder="Describe the issue in detail..."
            className="mt-1 block w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={form.categoryId}
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, categoryId: event.target.value }))}
              disabled={isLoading || categories.length === 0}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Priority</label>
            <select
              value={form.priority}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  priority: event.target.value as TicketPriority,
                }))
              }
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
          <Link
            to="/tickets"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isLoading || categories.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
