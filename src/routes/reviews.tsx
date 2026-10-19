import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Stars } from "@/components/AppShell";
import { ReplyConsole } from "@/components/ReplyConsole";
import { outletLabel, useData } from "@/lib/data";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews Feed — Roastery" },
      { name: "description", content: "Browse and reply to Google reviews across every Roastery outlet." },
      { property: "og:title", content: "Reviews Feed — Roastery" },
      { property: "og:description", content: "Browse and reply to Google reviews across every Roastery outlet." },
    ],
  }),
  component: Reviews,
});

const tabs = ["All", "Pending", "Replied", "Negative"] as const;

function Reviews() {
  const { reviews, filter, select, selected } = useData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [stars, setStars] = useState(0);
  const list = reviews.filter((r) =>
    (filter === "all" || r.outletId === filter) &&
    (stars === 0 || r.rating === stars) &&
    (tab === "All" || (tab === "Pending" && !r.reply) || (tab === "Replied" && r.reply) || (tab === "Negative" && r.rating <= 2)));
  return (
    <>
      <PageHeader title="Reviews Feed" subtitle={`${list.length} reviews match your filters`} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tab === t ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
            ))}
            <select value={stars} onChange={(e) => setStars(+e.target.value)} className="ml-auto rounded-full border bg-card px-3 text-sm">
              <option value={0}>All stars</option>{[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} ★</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {list.map((r) => (
              <article key={r.id} onClick={() => select(r)} className={`panel cursor-pointer p-4 transition-colors hover:border-primary/60 ${selected?.id === r.id ? "border-primary" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-accent font-bold">{r.author[0]}</div>
                  <div className="flex-1"><b>{r.author}</b><div className="text-xs text-muted-foreground">{outletLabel(r.outletId)} · {new Date(r.date).toLocaleDateString()}</div></div>
                  <Stars n={r.rating} />
                </div>
                <p className="mt-3 text-sm">{r.text}</p>
                {r.reply ? <div className="mt-3 rounded-lg border-l-2 border-success bg-success/10 p-2 text-xs"><b className="text-success">Owner reply:</b> {r.reply}</div>
                  : <span className="mt-3 inline-block rounded-full bg-violet/20 px-2 py-0.5 text-xs font-bold text-violet">Pending reply</span>}
              </article>
            ))}
            {!list.length && <p className="panel p-6 text-center text-muted-foreground">No reviews found.</p>}
          </div>
        </div>
        <div className="xl:sticky xl:top-8 xl:self-start"><ReplyConsole /></div>
      </div>
    </>
  );
}
