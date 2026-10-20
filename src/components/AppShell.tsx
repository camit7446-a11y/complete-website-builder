import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PieChart, Star, Wand2, Store, Users, History, SlidersHorizontal, Globe, Bot, RefreshCw, Power, Coffee } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useData } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Dashboard Center", icon: PieChart },
  { to: "/reviews", label: "Reviews Feed", icon: Star },
  { to: "/auto-rules", label: "Auto Rules", icon: Wand2, badge: "AI" },
  { to: "/outlets", label: "Outlets Grid", icon: Store },
  { to: "/team", label: "Team Users", icon: Users },
  { to: "/audit", label: "Response Audit", icon: History },
  { to: "/settings", label: "API & Settings", icon: SlidersHorizontal },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { filter, setFilter, outlets } = useData();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Coffee className="size-5" /></div>
          <div>
            <div className="font-display font-bold tracking-wide">ROASTERY</div>
            <div className="text-[11px] font-bold tracking-widest text-primary">REVIEW INTELLIGENCE</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-xl border-l-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "!border-primary bg-accent !text-primary font-semibold" }}>
              <n.icon className="size-4 text-primary" />
              <span className="flex-1">{n.label}</span>
              {"badge" in n && <span className="rounded-md bg-violet/20 px-1.5 py-0.5 text-[10px] font-bold text-violet">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t pt-4">
          <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground">FILTER OUTLET LOCATION</div>
          <label className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
            <Globe className="size-4 text-primary" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-primary outline-none">
              <option value="all" className="bg-popover">All Outlets (Unified)</option>
              {outlets.map((o) => <option key={o.id} value={o.id} className="bg-popover">{o.name} · {o.city}</option>)}
            </select>
          </label>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const qc = useQueryClient();
  return (
    <header className="panel mb-6 flex flex-wrap items-center gap-4 p-5">
      <div className="mr-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" /> LIVE GOOGLE SYNC
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Link to="/auto-rules" className="flex items-center gap-2 rounded-xl bg-gradient-violet px-4 py-2.5 text-sm font-bold text-violet-foreground">
        <Bot className="size-4" /> AUTO REPLY VIEW
      </Link>
      <button onClick={async () => { await qc.invalidateQueries(); toast.success("Data refreshed from database"); }}
        className="flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
        <RefreshCw className="size-4" /> Sync Reviews
      </button>
      <div className="flex items-center gap-2 border-l pl-4">
        <div className="grid size-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">VI</div>
        <span className="text-sm font-semibold">Vivek Sir Admin</span>
        <button aria-label="Sign out" onClick={() => supabase.auth.signOut()}><Power className="size-4 text-muted-foreground hover:text-destructive" /></button>
      </div>
    </header>
  );
}

export function Stars({ n }: { n: number }) {
  return <span className="text-primary">{"★".repeat(n)}<span className="text-muted">{"★".repeat(5 - n)}</span></span>;
}
