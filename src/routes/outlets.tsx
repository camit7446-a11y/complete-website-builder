import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

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

const field = "rounded-xl border bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-primary";

function Outlets() {
  const { outlets, setFilter, run } = useData();
  const nav = useNavigate();
  const [name, setName] = useState("Roastery Coffee House");
  const [city, setCity] = useState("");
  const [edit, setEdit] = useState<{ id: string; name: string; city: string } | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run("outlets", supabase.from("outlets").insert({ name, city }), "Outlet added")) setCity("");
  };

  return (
    <>
      <PageHeader title="Outlets Grid" subtitle={`${outlets.length} locations`} />
      <form onSubmit={add} className="panel mb-6 flex flex-wrap gap-3 p-4">
        <input required className={`${field} flex-1`} placeholder="Outlet name" value={name} onChange={(e) => setName(e.target.value)} />
        <input required className={`${field} flex-1`} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <button className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 font-bold text-primary-foreground"><Plus className="size-4" />Add Outlet</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {outlets.map((o) => edit?.id === o.id ? (
          <div key={o.id} className="panel space-y-2 border-primary p-5">
            <input className={`${field} w-full`} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <input className={`${field} w-full`} value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={async () => { if (await run("outlets", supabase.from("outlets").update({ name: edit.name, city: edit.city }).eq("id", o.id), "Outlet updated")) setEdit(null); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
              <button onClick={() => setEdit(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div key={o.id} className="panel p-5 transition-colors hover:border-primary">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{o.city}
              <button aria-label="Edit" onClick={() => setEdit(o)} className="ml-auto hover:text-primary"><Pencil className="size-3.5" /></button>
              <button aria-label="Delete" onClick={() => confirm(`Delete ${o.name}, ${o.city} and its reviews?`) && run("outlets", supabase.from("outlets").delete().eq("id", o.id), "Outlet deleted")} className="hover:text-destructive"><Trash2 className="size-3.5" /></button>
            </div>
            <button onClick={() => { setFilter(o.id); nav({ to: "/reviews" }); }} className="w-full text-left">
              <h3 className="mt-1 font-bold">{o.name}</h3>
              <div className="mt-4 font-display text-4xl font-bold text-primary">{o.rating.toFixed(1)}<span className="text-lg"> ★</span></div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">{o.reviews} reviews</span>
                <span className="font-bold text-violet">{o.pending} pending</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
