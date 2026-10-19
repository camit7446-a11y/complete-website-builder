import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Outlet = { id: string; name: string; city: string; rating: number; reviews: number; pending: number };
export type Review = {
  id: string; outletId: string; author: string; rating: number; text: string; date: string; reply?: string;
};
export type Rule = { id: string; name: string; stars: number[]; template: string; enabled: boolean };
export type AuditEntry = { id: string; reviewId: string; author: string; outlet: string; reply: string; by: string; at: string };

export const outlets: Outlet[] = [
  { id: "o1", name: "Cafe Athyeka 2.0", city: "Noida", rating: 0, reviews: 0, pending: 0 },
  { id: "o2", name: "Roastery Coffee House", city: "Hyderabad", rating: 4.4, reviews: 8038, pending: 213 },
  { id: "o3", name: "Roastery Coffee House", city: "Kolkata", rating: 4.5, reviews: 1044, pending: 1 },
  { id: "o4", name: "Roastery Coffee House", city: "Agra", rating: 4.5, reviews: 68, pending: 4 },
  { id: "o5", name: "Roastery Coffee House", city: "Jaipur", rating: 4.4, reviews: 1025, pending: 2 },
  { id: "o6", name: "Roastery Coffee House", city: "Bengaluru", rating: 4.6, reviews: 3120, pending: 27 },
  { id: "o7", name: "Roastery Coffee House", city: "Pune", rating: 4.5, reviews: 2410, pending: 11 },
  { id: "o8", name: "Roastery Coffee House", city: "Chennai", rating: 4.3, reviews: 1256, pending: 4 },
];

const names = ["Ananya S.", "Rohit K.", "Priya M.", "Arjun D.", "Sneha P.", "Karan V.", "Meera J.", "Vikram R.", "Isha T.", "Aditya N."];
const texts: Record<number, string[]> = {
  5: ["Best cold brew in town, cozy vibe!", "Loved the pour-over and the staff were super friendly.", "Amazing ambience, perfect for working."],
  4: ["Great coffee, slightly slow service.", "Nice place, desserts could be better.", "Good espresso, a bit crowded on weekends."],
  3: ["Average experience, coffee was okay.", "Decent but overpriced."],
  2: ["Waited 30 minutes for a latte.", "Table was not clean when we arrived."],
  1: ["Very rude staff, will not return.", "Cold food and wrong order."],
};

export const initialReviews: Review[] = Array.from({ length: 36 }, (_, i) => {
  const rating = [5, 4, 5, 2, 4, 1, 5, 3, 4, 5, 2, 4][i % 12];
  const pool = texts[rating];
  const o = outlets[1 + (i % 7)];
  return {
    id: `r${i + 1}`,
    outletId: o.id,
    author: names[i % names.length],
    rating,
    text: pool[i % pool.length],
    date: new Date(Date.UTC(2026, 9, 18 - (i % 14), 10)).toISOString(),
    reply: i % 3 === 0 ? "Thank you for your feedback! We hope to see you again soon." : undefined,
  };
});

export const initialRules: Rule[] = [
  { id: "a1", name: "Delighted guests", stars: [5], template: "Hi {name}, thank you so much for the 5-star love! See you again at Roastery ☕", enabled: true },
  { id: "a2", name: "Happy guests", stars: [4], template: "Hi {name}, thanks for visiting! We'd love to make your next visit a perfect 5.", enabled: true },
  { id: "a3", name: "Mixed feedback", stars: [3], template: "Hi {name}, thanks for the honest feedback. We're working on improving.", enabled: false },
  { id: "a4", name: "Service recovery", stars: [1, 2], template: "Hi {name}, we're truly sorry. Please write to care@roastery.in so we can make it right.", enabled: false },
];

export const team = [
  { name: "Vivek Sir", email: "vivek@roastery.in", role: "Admin", outlets: "All outlets" },
  { name: "Neha Gupta", email: "neha@roastery.in", role: "Manager", outlets: "Hyderabad, Bengaluru" },
  { name: "Rahul Mehta", email: "rahul@roastery.in", role: "Responder", outlets: "Kolkata" },
  { name: "Simran Kaur", email: "simran@roastery.in", role: "Responder", outlets: "Jaipur, Agra" },
  { name: "Aman Joshi", email: "aman@roastery.in", role: "Viewer", outlets: "Pune, Chennai" },
];

export function templateFor(rules: Rule[], r: Review) {
  const rule = rules.find((x) => x.stars.includes(r.rating)) ?? rules[0];
  return rule.template.replace("{name}", r.author.split(" ")[0]);
}

type Ctx = {
  reviews: Review[]; rules: Rule[]; audit: AuditEntry[];
  filter: string; setFilter: (v: string) => void;
  selected: Review | null; select: (r: Review | null) => void;
  reply: (id: string, text: string) => void;
  setRules: (r: Rule[]) => void;
};
const C = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rules, setRules] = useState(initialRules);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, select] = useState<Review | null>(null);
  const value = useMemo<Ctx>(() => ({
    reviews, rules, audit, filter, setFilter, selected, select, setRules,
    reply: (id, text) => {
      const r = reviews.find((x) => x.id === id);
      setReviews((p) => p.map((x) => (x.id === id ? { ...x, reply: text } : x)));
      if (r) {
        const o = outlets.find((x) => x.id === r.outletId)!;
        setAudit((a) => [{ id: crypto.randomUUID(), reviewId: id, author: r.author, outlet: `${o.name}, ${o.city}`, reply: text, by: "Vivek Sir", at: new Date().toISOString() }, ...a]);
      }
      select(null);
    },
  }), [reviews, rules, audit, filter, selected]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useData() {
  const c = useContext(C);
  if (!c) throw new Error("useData outside provider");
  return c;
}

export const outletLabel = (id: string) => {
  const o = outlets.find((x) => x.id === id);
  return o ? `${o.name} · ${o.city}` : "";
};
