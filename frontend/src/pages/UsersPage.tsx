import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AlertDialog from "../components/AlertDialog";
import {
  createUser,
  deleteUser,
  getApiErrorMessage,
  getUserById,
  getUsers,
  updateUser,
  updateUserStatus,
  type ApiUser,
  type UserRole,
} from "../api";

type UserFormState = {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
  phoneNo: string;
};

const initialFormState: UserFormState = {
  fullName: "",
  email: "",
  role: "user",
  password: "",
  phoneNo: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUserSnapshot, setEditingUserSnapshot] = useState<ApiUser | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isStatusUpdatingId, setIsStatusUpdatingId] = useState<number | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<ApiUser | null>(null);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setPageError("");
        const response = await getUsers();
        setUsers(response);
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const filtered = users.filter((user) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (
      normalizedSearch &&
      !user.fullName.toLowerCase().includes(normalizedSearch) &&
      !user.email.toLowerCase().includes(normalizedSearch) &&
      !user.phoneNo.toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }

    return true;
  });

  const resetForm = () => {
    setUserForm(initialFormState);
    setEditingUserId(null);
    setEditingUserSnapshot(null);
    setFormError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    resetForm();
  };

  const openEditModal = async (userId: number) => {
    try {
      setFormError("");
      const user = await getUserById(userId);
      setEditingUserId(userId);
      setEditingUserSnapshot(user);
      setUserForm({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: "",
        phoneNo: user.phoneNo,
      });
      setShowUserModal(true);
    } catch (editError) {
      setPageError(getApiErrorMessage(editError));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!userForm.fullName.trim() || !userForm.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    if (editingUserId === null && !userForm.password) {
      setFormError("Password is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingUserId === null) {
        const createdUser = await createUser({
          fullName: userForm.fullName,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          phoneNo: userForm.phoneNo,
        });

        setUsers((currentUsers) => [...currentUsers, createdUser]);
      } else {
        const updatedUser = await updateUser(editingUserId, {
          fullName: userForm.fullName,
          email: userForm.email,
          role: userForm.role,
          isActive: editingUserSnapshot?.isActive ?? true,
          phoneNo: userForm.phoneNo,
        });

        setUsers((currentUsers) =>
          currentUsers.map((user) => (user.id === editingUserId ? updatedUser : user)),
        );
      }

      closeModal();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: ApiUser) => {
    const nextStatus = !user.isActive;

    try {
      setIsStatusUpdatingId(user.id);
      await updateUserStatus(user.id, { isActive: nextStatus });
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? { ...currentUser, isActive: nextStatus } : currentUser,
        ),
      );

      if (editingUserSnapshot?.id === user.id) {
        setEditingUserSnapshot({ ...editingUserSnapshot, isActive: nextStatus });
      }
    } catch (statusError) {
      setPageError(getApiErrorMessage(statusError));
    } finally {
      setIsStatusUpdatingId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      setIsDeletingId(userId);
      await deleteUser(userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setPendingDeleteUser(null);

      if (editingUserId === userId) {
        closeModal();
      }
    } catch (deleteError) {
      setPageError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog
        open={pendingDeleteUser !== null}
        title="Delete user"
        description={`Are you sure you want to delete "${pendingDeleteUser?.fullName ?? "this user"}"?`}
        confirmLabel="Delete"
        isConfirming={isDeletingId !== null}
        onCancel={() => setPendingDeleteUser(null)}
        onConfirm={() => {
          if (pendingDeleteUser) {
            void handleDelete(pendingDeleteUser.id);
          }
        }}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

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
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Phone</th>
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
                          .map((namePart) => namePart[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">
                    {user.phoneNo || "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive ? "text-status-resolved" : "text-muted-foreground"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-status-resolved" : "bg-muted-foreground"}`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void openEditModal(user.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(user)}
                        disabled={isStatusUpdatingId === user.id}
                        className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteUser(user)}
                        className="rounded-md p-1 text-muted-foreground transition-snappy hover:bg-muted hover:text-destructive"
                        aria-label={`Delete ${user.fullName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingUserId !== null && <Pencil className="h-4 w-4 text-primary" />}
                <h2 className="text-base font-semibold text-foreground">
                  {editingUserId === null ? "Add New User" : "Edit User"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {formError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {formError}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm((currentForm) => ({ ...currentForm, fullName: e.target.value }))}
                  placeholder="Jane Doe"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((currentForm) => ({ ...currentForm, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {editingUserId === null && (
                <div>
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm((currentForm) => ({ ...currentForm, password: e.target.value }))}
                    placeholder="........"
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm((currentForm) => ({ ...currentForm, role: e.target.value as UserRole }))}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input
                  type="text"
                  value={userForm.phoneNo}
                  onChange={(e) => setUserForm((currentForm) => ({ ...currentForm, phoneNo: e.target.value }))}
                  placeholder="+94 77 123 4567"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? editingUserId === null
                      ? "Adding..."
                      : "Saving..."
                    : editingUserId === null
                      ? "Add User"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
