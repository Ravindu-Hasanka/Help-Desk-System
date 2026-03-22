import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AlertDialog from "../components/AlertDialog";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getApiErrorMessage,
  updateCategory,
  type Category,
} from "../api";
import { useAuth } from "../auth/AuthContext";

type CategoryFormState = {
  categoryName: string;
  description: string;
};

const initialFormState: CategoryFormState = {
  categoryName: "",
  description: "",
};

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryFormState>(initialFormState);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getCategories();
        setCategories(response);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingCategoryId(null);
    setFormError("");
  };

  const handleEdit = async (categoryId: number) => {
    try {
      setFormError("");
      const category = await getCategoryById(categoryId);
      setForm({
        categoryName: category.categoryName,
        description: category.description ?? "",
      });
      setEditingCategoryId(categoryId);
    } catch (editError) {
      setFormError(getApiErrorMessage(editError));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.categoryName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    const payload = {
      categoryName: form.categoryName.trim(),
      description: form.description.trim() || null,
    };

    try {
      setIsSubmitting(true);

      if (editingCategoryId === null) {
        const createdCategory = await createCategory(payload);
        setCategories((currentCategories) => [...currentCategories, createdCategory]);
      } else {
        const updatedCategory = await updateCategory(editingCategoryId, payload);
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.categoryId === editingCategoryId ? updatedCategory : category,
          ),
        );
      }

      resetForm();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      setIsDeletingId(categoryId);
      await deleteCategory(categoryId);
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.categoryId !== categoryId),
      );

      if (editingCategoryId === categoryId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeletingId(null);
      setPendingDeleteCategory(null);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog
        open={pendingDeleteCategory !== null}
        title="Delete category"
        description={`Are you sure you want to delete "${pendingDeleteCategory?.categoryName ?? "this category"}"?`}
        confirmLabel="Delete"
        isConfirming={isDeletingId !== null}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            void handleDelete(pendingDeleteCategory.categoryId);
          }
        }}
      />

      <div>
        <h1 className="text-xl font-semibold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage ticket categories</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {editingCategoryId === null ? "Create category" : "Edit category"}
            </h2>
          </div>

          {formError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),minmax(0,1.4fr)]">
            <div>
              <label className="text-sm font-medium text-foreground">Category name</label>
              <input
                type="text"
                value={form.categoryName}
                onChange={(e) => setForm((currentForm) => ({ ...currentForm, categoryName: e.target.value }))}
                placeholder="Billing"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((currentForm) => ({ ...currentForm, description: e.target.value }))}
                placeholder="Payment and subscription issues"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {editingCategoryId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? editingCategoryId === null
                  ? "Creating..."
                  : "Saving..."
                : editingCategoryId === null
                  ? "Create Category"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.categoryId}
              className="rounded-lg border border-border bg-card p-4 transition-snappy hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{category.categoryName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.description || "No description provided."}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleEdit(category.categoryId)}
                      className="rounded-md p-2 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${category.categoryName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteCategory(category)}
                      disabled={isDeletingId === category.categoryId}
                      className="rounded-md p-2 text-muted-foreground transition-snappy hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label={`Delete ${category.categoryName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
