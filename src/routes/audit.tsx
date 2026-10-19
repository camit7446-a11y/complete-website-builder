import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useData } from "@/lib/data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Response Audit — Roastery" },
      { name: "description", content: "A log of every reply published to Google reviews." },
      { property: "og:title", content: "Response Audit — Roastery" },
      { property: "og:description", content: "A log of every reply published to Google reviews." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const { audit } = useData();
  return (
    <>
      <PageHeader title="Response Audit" subtitle="Every reply published from this portal" />
      <section className="panel p-5">
        {audit.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No responses published yet in this session. Reply to a review to see it logged here.</p>
        ) : (
          <ul className="divide-y">
            {audit.map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <div className="flex justify-between"><b>Reply to {a.author}</b><span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</span></div>
                <div className="text-xs text-muted-foreground">{a.outlet} · by {a.by}</div>
                <p className="mt-1">{a.reply}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
