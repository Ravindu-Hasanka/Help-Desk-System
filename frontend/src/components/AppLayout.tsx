import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AppSidebar from "./AppSidebar.tsx";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
