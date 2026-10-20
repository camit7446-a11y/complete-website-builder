import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { useData } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Users — Roastery" },
      { name: "description", content: "Manage who can view and respond to Roastery reviews." },
      { property: "og:title", content: "Team Users — Roastery" },
      { property: "og:description", content: "Manage who can view and respond to Roastery reviews." },
    ],
  }),
  component: Team,
});

const field = "rounded-xl border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary";
const roles = ["Admin", "Manager", "Responder", "Viewer"];

function Team() {
  const { team, run } = useData();
  const [f, setF] = useState({ name: "", email: "", role: "Responder", outlets: "" });
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run("team", supabase.from("team_members").insert(f), "Member added")) setF({ name: "", email: "", role: "Responder", outlets: "" });
  };
  return (
    <>
      <PageHeader title="Team Users" subtitle="Roles and outlet access for your review team" />
      <form onSubmit={add} className="panel mb-6 grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto_1fr_auto]">
        <input required className={field} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input required type="email" className={field} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <select className={field} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
        <input className={field} placeholder="Outlet access" value={f.outlets} onChange={(e) => setF({ ...f, outlets: e.target.value })} />
        <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground"><UserPlus className="size-4" />Add</button>
      </form>
      <section className="panel overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wider text-muted-foreground"><tr className="border-b"><th className="py-3">NAME</th><th>EMAIL</th><th>ROLE</th><th>OUTLET ACCESS</th><th /></tr></thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{u.name}</td><td className="text-muted-foreground">{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e) => run("team", supabase.from("team_members").update({ role: e.target.value }).eq("id", u.id), "Role updated")}
                    className="rounded-full border bg-card px-2 py-0.5 text-xs font-bold">{roles.map((r) => <option key={r}>{r}</option>)}</select>
                </td>
                <td className="text-muted-foreground">{u.outlets}</td>
                <td className="text-right"><button aria-label="Remove" onClick={() => confirm(`Remove ${u.name}?`) && run("team", supabase.from("team_members").delete().eq("id", u.id), "Member removed")} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
