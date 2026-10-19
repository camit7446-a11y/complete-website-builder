import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { ReplyConsole } from "@/components/ReplyConsole";
import { outlets, useData } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Roastery Review Intelligence" },
      { name: "description", content: "Executive analytics for Roastery's multi-outlet Google reviews." },
      { property: "og:title", content: "Dashboard — Roastery Review Intelligence" },
      { property: "og:description", content: "Executive analytics for Roastery's multi-outlet Google reviews." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { filter, setFilter, reviews, select } = useData();
  const nav = useNavigate();
  const list = filter === "all" ? outlets : outlets.filter((o) => o.id === filter);
  const total = list.reduce((s, o) => s + o.reviews, 0);
  const pending = list.reduce((s, o) => s + o.pending, 0);
  const rating = total ? list.reduce((s, o) => s + o.rating * o.reviews, 0) / total : 0;
  const negative = Math.round(total * 0.06);
  const resp = total ? ((total - pending) / total) * 100 : 0;
  const recent = reviews.filter((r) => !r.reply && (filter === "all" || r.outletId === filter)).slice(0, 4);

  const stats = [
    { l: "OVERALL RATING", v: `${rating.toFixed(1)} ★`, c: "text-primary", bar: rating / 5, bc: "bg-gradient-primary" },
    { l: "TOTAL REVIEWS", v: total, c: "", sub: "Combined Total" },
    { l: "RESPONSE RATE", v: `${resp.toFixed(1)}%`, c: "text-success", bar: resp / 100, bc: "bg-success" },
    { l: "PENDING REPLY", v: pending, c: "text-violet", sub: "Action Required" },
    { l: "NEGATIVE (1-2★)", v: negative, c: "text-destructive", sub: "Urgent Focus" },
  ];

  return (
    <>
      <PageHeader title="Executive Analytics Overview" subtitle="Roastery multi-outlet review portal" />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.l} className="panel p-5">
            <div className="text-xs font-bold tracking-wider text-muted-foreground">{s.l}</div>
            <div className={`mt-2 font-display text-3xl font-bold ${s.c}`}>{s.v}</div>
            {s.bar !== undefined ? (
              <div className="mt-3 h-1.5 rounded-full bg-muted"><div className={`h-full rounded-full ${s.bc}`} style={{ width: `${s.bar * 100}%` }} /></div>
            ) : <div className={`mt-2 flex items-center gap-1 text-xs ${s.c || "text-muted-foreground"}`}>{s.l === "TOTAL REVIEWS" && <TrendingUp className="size-3 text-success" />}{s.sub}</div>}
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="panel overflow-hidden p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h2 className="font-bold text-primary">OUTLET PERFORMANCE MATRIX</h2>
            <span className="ml-auto text-xs text-muted-foreground">Click a row to view reviews</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs tracking-wider text-muted-foreground">
                <tr className="border-b"><th className="py-3">OUTLET NAME</th><th>CITY</th><th className="text-center">AVG RATING</th><th className="text-center">REVIEWS</th><th className="text-center">PENDING</th></tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} onClick={() => { setFilter(o.id); nav({ to: "/reviews" }); }} className="cursor-pointer border-b last:border-0 hover:bg-accent">
                    <td className="py-3 font-semibold">{o.name}</td><td className="text-muted-foreground">{o.city}</td>
                    <td className="text-center"><span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-bold text-primary">★ {o.rating.toFixed(1)}</span></td>
                    <td className="text-center font-semibold">{o.reviews}</td>
                    <td className="text-center"><span className="inline-grid min-w-7 place-items-center rounded-full bg-violet/20 px-2 py-0.5 text-xs font-bold text-violet">{o.pending}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="space-y-6">
          <ReplyConsole />
          <section className="panel p-5">
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">AWAITING REPLY</h2>
            <div className="space-y-2">
              {recent.map((r) => (
                <button key={r.id} onClick={() => select(r)} className="w-full rounded-xl border p-3 text-left text-sm hover:border-primary">
                  <div className="flex justify-between"><b>{r.author}</b><span className="text-primary">{"★".repeat(r.rating)}</span></div>
                  <p className="truncate text-muted-foreground">{r.text}</p>
                </button>
              ))}
              {!recent.length && <p className="text-sm text-muted-foreground">All caught up 🎉</p>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
