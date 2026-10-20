import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Outlet = { id: string; name: string; city: string; rating: number; reviews: number; pending: number };
export type Review = { id: string; outletId: string; author: string; rating: number; text: string; date: string; reply?: string | undefined };
export type Rule = { id: string; name: string; stars: number[]; template: string; enabled: boolean };
export type AuditEntry = { id: string; author: string; outlet: string; reply: string; by: string; at: string };
export type Member = { id: string; name: string; email: string; role: string; outlets: string };

async function must<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

function useTables() {
  const outletsQ = useQuery({ queryKey: ["outlets"], queryFn: () => must(supabase.from("outlets").select("*").order("created_at")) });
  const reviewsQ = useQuery({ queryKey: ["reviews"], queryFn: () => must(supabase.from("reviews").select("*").order("created_at", { ascending: false })) });
  const rulesQ = useQuery({ queryKey: ["rules"], queryFn: () => must(supabase.from("reply_rules").select("*").order("created_at")) });
  const teamQ = useQuery({ queryKey: ["team"], queryFn: () => must(supabase.from("team_members").select("*").order("created_at")) });
  const auditQ = useQuery({ queryKey: ["audit"], queryFn: () => must(supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200)) });

  const reviews: Review[] = (reviewsQ.data ?? []).map((r) => ({
    id: r.id, outletId: r.outlet_id, author: r.author, rating: r.rating, text: r.text, date: r.created_at, reply: r.reply ?? undefined,
  }));
  const outlets: Outlet[] = (outletsQ.data ?? []).map((o) => {
    const rs = reviews.filter((r) => r.outletId === o.id);
    return {
      id: o.id, name: o.name, city: o.city, reviews: rs.length,
      pending: rs.filter((r) => !r.reply).length,
      rating: rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0,
    };
  });
  const rules: Rule[] = (rulesQ.data ?? []).map((r) => ({ id: r.id, name: r.name, stars: r.stars, template: r.template, enabled: r.enabled }));
  const team: Member[] = teamQ.data ?? [];
  const audit: AuditEntry[] = (auditQ.data ?? []).map((a) => ({ id: a.id, author: a.author, outlet: a.outlet, reply: a.reply, by: a.by_email ?? "", at: a.created_at }));
  const loading = outletsQ.isLoading || reviewsQ.isLoading;
  return { outlets, reviews, rules, team, audit, loading };
}

export function templateFor(rules: Rule[], r: Review) {
  const rule = rules.find((x) => x.stars.includes(r.rating)) ?? rules[0];
  if (!rule) return "";
  return rule.template.replace("{name}", r.author.split(" ")[0] ?? r.author);
}

type Ctx = ReturnType<typeof useTables> & {
  filter: string; setFilter: (v: string) => void;
  selected: Review | null; select: (r: Review | null) => void;
  reply: (id: string, text: string) => Promise<void>;
  run: (key: string, op: PromiseLike<{ error: { message: string } | null }>, msg?: string) => Promise<boolean>;
  outletLabel: (id: string) => string;
};
const C = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const t = useTables();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [selected, select] = useState<Review | null>(null);

  const outletLabel = (id: string) => {
    const o = t.outlets.find((x) => x.id === id);
    return o ? `${o.name} · ${o.city}` : "";
  };

  const run: Ctx["run"] = async (key, op, msg) => {
    const { error } = await op;
    if (error) { toast.error(error.message); return false; }
    await qc.invalidateQueries({ queryKey: [key] });
    if (key === "outlets") await qc.invalidateQueries({ queryKey: ["reviews"] });
    if (msg) toast.success(msg);
    return true;
  };

  const reply: Ctx["reply"] = async (id, text) => {
    const r = t.reviews.find((x) => x.id === id);
    const ok = await run("reviews", supabase.from("reviews").update({ reply: text, replied_at: new Date().toISOString() }).eq("id", id));
    if (!ok || !r) return;
    const { data } = await supabase.auth.getUser();
    await run("audit", supabase.from("audit_log").insert({ review_id: id, author: r.author, outlet: outletLabel(r.outletId), reply: text, by_email: data.user?.email ?? null }), "Response published");
    select(null);
  };

  return <C.Provider value={{ ...t, filter, setFilter, selected, select, reply, run, outletLabel }}>{children}</C.Provider>;
}

export function useData() {
  const c = useContext(C);
  if (!c) throw new Error("useData outside provider");
  return c;
}
