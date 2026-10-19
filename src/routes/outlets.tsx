import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { outlets, useData } from "@/lib/data";

export const Route = createFileRoute("/outlets")({
  head: () => ({
    meta: [
      { title: "Outlets Grid — Roastery" },
      { name: "description", content: "Every Roastery outlet at a glance with ratings and pending replies." },
      { property: "og:title", content: "Outlets Grid — Roastery" },
      { property: "og:description", content: "Every Roastery outlet at a glance with ratings and pending replies." },
    ],
  }),
  component: Outlets,
});

function Outlets() {
  const { setFilter } = useData();
  const nav = useNavigate();
  return (
    <>
      <PageHeader title="Outlets Grid" subtitle={`${outlets.length} connected Google Business locations`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {outlets.map((o) => (
          <button key={o.id} onClick={() => { setFilter(o.id); nav({ to: "/reviews" }); }} className="panel p-5 text-left transition-colors hover:border-primary">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{o.city}</div>
            <h3 className="mt-1 font-bold">{o.name}</h3>
            <div className="mt-4 font-display text-4xl font-bold text-primary">{o.rating.toFixed(1)}<span className="text-lg"> ★</span></div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">{o.reviews} reviews</span>
              <span className="font-bold text-violet">{o.pending} pending</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
