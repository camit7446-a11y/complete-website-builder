import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { useData, type Rule } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

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
  const { rules, run } = useData();
  return (
    <>
      <PageHeader title="Auto Reply Rules" subtitle="Templates load automatically in the reply console. Use {name} for the reviewer's first name." />
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => <RuleCard key={r.id} rule={r} />)}
      </div>
      <button onClick={() => run("rules", supabase.from("reply_rules").insert({ name: "New rule", stars: [5], template: "Hi {name}, thank you!" }), "Rule added")}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow"><Plus className="size-4" />Add Rule</button>
    </>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const { run } = useData();
  const [d, setD] = useState(rule);
  useEffect(() => setD(rule), [rule]);
  const field = "w-full rounded-xl border bg-background/50 p-2.5 text-sm outline-none focus:border-primary";
  const save = (patch: Partial<Rule>, msg?: string) =>
    run("rules", supabase.from("reply_rules").update({ name: patch.name ?? d.name, stars: patch.stars ?? d.stars, template: patch.template ?? d.template, enabled: patch.enabled ?? d.enabled }).eq("id", rule.id), msg);
  return (
    <div className="panel space-y-3 p-5">
      <div className="flex items-center gap-3">
        <input className={`${field} font-bold`} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        <button aria-label="Toggle" onClick={() => save({ enabled: !d.enabled })} className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${d.enabled ? "bg-success" : "bg-muted"}`}>
          <span className={`block size-5 rounded-full bg-foreground transition-transform ${d.enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setD({ ...d, stars: d.stars.includes(s) ? d.stars.filter((x) => x !== s) : [...d.stars, s].sort() })}
            className={`rounded-md border px-2.5 py-1 text-xs font-bold ${d.stars.includes(s) ? "border-primary bg-primary/15 text-primary" : "text-muted-foreground"}`}>{s}★</button>
        ))}
      </div>
      <textarea value={d.template} onChange={(e) => setD({ ...d, template: e.target.value })} rows={3} className={`${field} resize-none`} />
      <div className="flex gap-2">
        <button onClick={() => save({}, "Rule saved")} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
        <button aria-label="Delete rule" onClick={() => confirm("Delete this rule?") && run("rules", supabase.from("reply_rules").delete().eq("id", rule.id), "Rule deleted")}
          className="ml-auto rounded-lg border px-3 py-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}
