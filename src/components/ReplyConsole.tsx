import { useEffect, useState } from "react";
import { Send, Zap } from "lucide-react";
import { templateFor, useData } from "@/lib/data";
import { Stars } from "./AppShell";

export function ReplyConsole() {
  const { selected, rules, reply, outletLabel } = useData();
  const [text, setText] = useState("");
  useEffect(() => { setText(selected ? templateFor(rules, selected) : ""); }, [selected, rules]);
  return (
    <section className="panel border-primary/30 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="size-4 text-primary" />
        <h2 className="flex-1 font-bold text-primary">FAST REPLY CONSOLE</h2>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">Auto Template Loaded</span>
      </div>
      <div className="mb-3 rounded-xl border bg-background/50 p-3 text-sm">
        {selected ? (
          <>
            <div className="flex justify-between"><b>{selected.author}</b><Stars n={selected.rating} /></div>
            <div className="text-xs text-muted-foreground">{outletLabel(selected.outletId)}</div>
            <p className="mt-1">{selected.text}</p>
          </>
        ) : <i className="text-muted-foreground">Select any review from feed to post a response...</i>}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
        placeholder="Database template will automatically load here for editing..."
        className="w-full resize-none rounded-xl border bg-background/50 p-3 text-sm outline-none focus:border-primary" />
      <button disabled={!selected || !text.trim()}
        onClick={() => reply(selected!.id, text)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-bold text-primary-foreground shadow-glow disabled:opacity-50">
        <Send className="size-4" /> Publish Live Response
      </button>
    </section>
  );
}
