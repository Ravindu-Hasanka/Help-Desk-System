import { mockNotifications } from "../lib/mock-data";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{mockNotifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-snappy hover:bg-muted">
          <Check className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {mockNotifications.map(notif => (
          <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 transition-snappy ${!notif.isRead ? 'bg-sidebar-accent' : ''}`}>
            <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${!notif.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{notif.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleString()}</p>
            </div>
            {notif.ticketId && (
              <Link to={`/tickets/${notif.ticketId}`} className="shrink-0 text-xs font-medium text-primary hover:underline">
                View
              </Link>
            )}
          </div>
        ))}
        {mockNotifications.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No notifications</div>
        )}
      </div>
    </div>
  );
}
