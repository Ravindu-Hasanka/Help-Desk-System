import { Shield } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to Sentinel Help Desk</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              className="mt-1 block w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
