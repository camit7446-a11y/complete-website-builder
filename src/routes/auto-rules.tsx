import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { useData } from "@/lib/data";

export const Route = createFileRoute("/auto-rules")({
  head: () => ({
    meta: [
      { title: "Auto Reply Rules — Roastery" },
      { name: "description", content: "Configure AI auto-reply templates by star rating." },
      { property: "og:title", content: "Auto Reply Rules — Roastery" },
      { property: "og:description", content: "Configure AI auto-reply templates by star rating." },
    ],
  }),
  component: Rules,
});

function Rules() {
  const { rules, setRules } = useData();
  const upd = (id: string, p: Partial<(typeof rules)[number]>) => setRules(rules.map((r) => (r.id === id ? { ...r, ...p } : r)));
  return (
    <>
      <PageHeader title="Auto Reply Rules" subtitle="Templates load automatically in the reply console. Use {name} for the reviewer's first name." />
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <div key={r.id} className="panel p-5">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="flex-1 font-bold">{r.name}</h3>
              <span className="text-sm text-primary">{r.stars.map((s) => `${s}★`).join(" / ")}</span>
              <button onClick={() => upd(r.id, { enabled: !r.enabled })} className={`h-6 w-11 rounded-full p-0.5 transition-colors ${r.enabled ? "bg-success" : "bg-muted"}`}>
                <span className={`block size-5 rounded-full bg-foreground transition-transform ${r.enabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <textarea value={r.template} onChange={(e) => upd(r.id, { template: e.target.value })} rows={3} className="w-full resize-none rounded-xl border bg-background/50 p-3 text-sm outline-none focus:border-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{r.enabled ? "Auto-posting enabled for new reviews" : "Suggestion only — requires manual publish"}</p>
          </div>
        ))}
      </div>
      <button onClick={() => toast.success("Rules saved")} className="mt-6 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow">Save Rules</button>
    </>
  );
}
