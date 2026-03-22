import { LayoutDashboard, Ticket, Users, FolderOpen, Bell, Settings, LogOut, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../lib/utils";
import { mockNotifications } from "../lib/mock-data";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Tickets", icon: Ticket, path: "/tickets" },
  { label: "Users", icon: Users, path: "/users" },
  { label: "Categories", icon: FolderOpen, path: "/categories" },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map(namePart => namePart[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">Sentinel Help Desk</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-snappy",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <Link
          to="/notifications"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-snappy",
            location.pathname === "/notifications"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-snappy hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {/* User profile */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md p-1 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
