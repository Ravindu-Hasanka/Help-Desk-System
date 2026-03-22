import { cva } from "class-variance-authority";
import type { TicketPriority, TicketStatus } from "../api";

const statusVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      status: {
        open: "bg-[hsl(var(--status-open)/0.1)] text-status-open ring-[hsl(var(--status-open)/0.2)]",
        "in-progress": "bg-[hsl(var(--status-in-progress)/0.1)] text-status-in-progress ring-[hsl(var(--status-in-progress)/0.2)]",
        pending: "bg-amber-100 text-amber-700 ring-amber-200",
        resolved: "bg-[hsl(var(--status-resolved)/0.1)] text-status-resolved ring-[hsl(var(--status-resolved)/0.2)]",
        closed: "bg-muted text-muted-foreground ring-border",
      },
    },
  }
);

const priorityVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      priority: {
        critical: "bg-[hsl(var(--priority-critical)/0.1)] text-priority-critical ring-[hsl(var(--priority-critical)/0.2)]",
        high: "bg-[hsl(var(--priority-high)/0.1)] text-priority-high ring-[hsl(var(--priority-high)/0.2)]",
        medium: "bg-[hsl(var(--priority-medium)/0.1)] text-priority-medium ring-[hsl(var(--priority-medium)/0.2)]",
        low: "bg-[hsl(var(--priority-low)/0.1)] text-priority-low ring-[hsl(var(--priority-low)/0.2)]",
      },
    },
  }
);

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityLabels: Record<TicketPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={statusVariants({ status })}>{statusLabels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={priorityVariants({ priority })}>{priorityLabels[priority]}</span>;
}
