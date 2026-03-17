import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar.tsx";

export default function AppLayout() {
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
