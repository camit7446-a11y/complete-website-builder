import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Stars } from "@/components/AppShell";
import { ReplyConsole } from "@/components/ReplyConsole";
import { useData } from "@/lib/data";

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
  const { reviews, filter, select, selected, outletLabel, outlets, run } = useData();
  const [nf, setNf] = useState({ author: "", rating: 5, text: "", outlet_id: "" });
  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const outlet_id = nf.outlet_id || (filter !== "all" ? filter : outlets[0]?.id);
    if (!outlet_id) return;
    if (await run("reviews", supabase.from("reviews").insert({ ...nf, outlet_id }), "Review added")) setNf({ author: "", rating: 5, text: "", outlet_id: "" });
  };
  const fld = "rounded-xl border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary";
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
          <form onSubmit={addReview} className="panel mb-4 grid gap-2 p-4 md:grid-cols-[1fr_1fr_auto]">
            <input required className={fld} placeholder="Reviewer name" value={nf.author} onChange={(e) => setNf({ ...nf, author: e.target.value })} />
            <select className={fld} value={nf.outlet_id} onChange={(e) => setNf({ ...nf, outlet_id: e.target.value })}>
              <option value="">{filter !== "all" ? outletLabel(filter) : "Choose outlet"}</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name} · {o.city}</option>)}
            </select>
            <select className={fld} value={nf.rating} onChange={(e) => setNf({ ...nf, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} ★</option>)}</select>
            <input required className={`${fld} md:col-span-2`} placeholder="Review text" value={nf.text} onChange={(e) => setNf({ ...nf, text: e.target.value })} />
            <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Plus className="size-4" />Add Review</button>
          </form>
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
                  <button aria-label="Delete review" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this review?")) run("reviews", supabase.from("reviews").delete().eq("id", r.id), "Review deleted"); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
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
