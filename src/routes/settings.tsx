import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "API & Settings — Roastery" },
      { name: "description", content: "Google Business Profile connection and portal preferences." },
      { property: "og:title", content: "API & Settings — Roastery" },
      { property: "og:description", content: "Google Business Profile connection and portal preferences." },
    ],
  }),
  component: Settings,
});

const field = "w-full rounded-xl border bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-primary";

function Settings() {
  return (
    <>
      <PageHeader title="API & Settings" subtitle="Connection and sync preferences" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel space-y-4 p-5">
          <h2 className="font-bold text-primary">Google Business Profile</h2>
          <label className="block text-sm">Account ID<input className={`${field} mt-1`} defaultValue="accounts/1029384756" /></label>
          <label className="block text-sm">Sync interval
            <select className={`${field} mt-1`} defaultValue="15"><option value="5">Every 5 minutes</option><option value="15">Every 15 minutes</option><option value="60">Hourly</option></select>
          </label>
          <div className="flex items-center gap-2 text-sm text-success"><span className="size-2 rounded-full bg-success" />Connected · 8 locations</div>
        </section>
        <section className="panel space-y-4 p-5">
          <h2 className="font-bold text-primary">Notifications</h2>
          {["Email me for 1–2★ reviews", "Daily digest of pending replies", "Weekly performance report"].map((t, i) => (
            <label key={t} className="flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked={i < 2} className="size-4 accent-primary" />{t}</label>
          ))}
          <label className="block text-sm">Alert email<input className={`${field} mt-1`} defaultValue="vivek@roastery.in" /></label>
        </section>
      </div>
      <button onClick={() => toast.success("Settings saved")} className="mt-6 rounded-xl bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow">Save Settings</button>
    </>
  );
}
