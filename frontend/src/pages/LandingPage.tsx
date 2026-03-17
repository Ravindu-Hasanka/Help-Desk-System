import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Ticket,
    title: "Ticket Management",
    description:
      "Create, assign, and track support tickets with priorities and categories.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Admin, agent, and user roles with appropriate permissions for each.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description:
      "Real-time charts and stats for ticket volume, agent performance, and more.",
  },
  {
    icon: Clock,
    title: "Status Workflows",
    description:
      "Track tickets from open through in-progress, resolved, and closed.",
  },
];

const highlights = [
  "Priority-based ticket routing",
  "Internal notes for agents",
  "Category-based organization",
  "Notification system",
  "Agent performance tracking",
  "Search and filter tickets",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Sentinel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-status-resolved" />
          Enterprise-grade help desk
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Support tickets, <span className="text-primary">simplified.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Sentinel helps your team manage support tickets efficiently with
          role-based workflows, real-time tracking, and powerful analytics.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-2 text-center text-lg font-semibold text-foreground">
          Everything you need
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          A complete help desk solution for teams of any size.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-5 transition-snappy hover:shadow-sm"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-8 sm:p-10">
          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Built for support teams
              </h2>
              <p className="text-sm text-muted-foreground">
                From ticket creation to resolution, Sentinel streamlines every
                step of your support workflow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-xs text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Ready to get started?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your account and start managing tickets in minutes.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90"
        >
          Create Account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Sentinel Help Desk
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            (c) 2026 Sentinel. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
