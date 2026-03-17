import { mockCategories } from "../lib/mock-data";
import { mockTickets } from "../lib/mock-data";

export default function CategoriesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage ticket categories</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockCategories.map(cat => {
          const count = mockTickets.filter(t => t.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="rounded-lg border border-border bg-card p-4 transition-snappy hover:border-primary/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{cat.categoryName}</h3>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count} tickets</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
