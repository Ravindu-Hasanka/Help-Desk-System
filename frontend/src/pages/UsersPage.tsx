import { useState } from "react";
import { mockUsers } from "../lib/mock-data";
import type { User, UserRole } from "../lib/mock-data";
import { Plus, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "user" as UserRole, password: "" });
  const [addError, setAddError] = useState("");

  const filtered = users.filter((u) => {
    if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      setAddError("All fields are required.");
      return;
    }
    if (users.some((u) => u.email === newUser.email)) {
      setAddError("Email already exists.");
      return;
    }
    const created: User = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, created]);
    setNewUser({ fullName: "", email: "", role: "user", password: "" });
    setShowAddModal(false);
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-sm rounded-md border border-input bg-card pl-3 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <tr key={user.id} className="transition-snappy hover:bg-muted/50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive ? "text-status-resolved" : "text-muted-foreground"}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-status-resolved" : "bg-muted-foreground"}`} />
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleAddUser}>
              {addError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{addError}</div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Jane Doe"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((f) => ({ ...f, role: e.target.value as UserRole }))}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
