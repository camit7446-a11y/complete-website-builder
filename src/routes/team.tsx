import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { team } from "@/lib/data";

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

function Team() {
  return (
    <>
      <PageHeader title="Team Users" subtitle="Roles and outlet access for your review team" />
      <section className="panel overflow-x-auto p-5">
        <div className="mb-4 flex"><button onClick={() => toast("Invite sent")} className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground"><UserPlus className="size-4" />Invite User</button></div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wider text-muted-foreground"><tr className="border-b"><th className="py-3">NAME</th><th>EMAIL</th><th>ROLE</th><th>OUTLET ACCESS</th></tr></thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.email} className="border-b last:border-0">
                <td className="py-3 font-semibold">{u.name}</td><td className="text-muted-foreground">{u.email}</td>
                <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${u.role === "Admin" ? "bg-primary text-primary-foreground" : "bg-accent"}`}>{u.role}</span></td>
                <td className="text-muted-foreground">{u.outlets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
