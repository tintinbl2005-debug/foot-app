import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Percent, TrendingUp, XCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Historique & Performances — PronoIA" },
      { name: "description", content: "Suivez le ROI, le taux de réussite et l'historique de vos analyses IA football." },
    ],
  }),
  component: HistoryPage,
});

type Row = {
  date: string;
  home: string;
  away: string;
  prediction: string;
  odds: number;
  result: "win" | "loss";
  pnl: number;
};

const ROWS: Row[] = [
  { date: "12 Juin", home: "PSG", away: "Marseille", prediction: "Victoire PSG + BTTS", odds: 2.10, result: "win", pnl: 110 },
  { date: "10 Juin", home: "Real Madrid", away: "Barcelona", prediction: "Over 2.5 buts", odds: 1.85, result: "win", pnl: 85 },
  { date: "08 Juin", home: "Liverpool", away: "Man City", prediction: "Match nul", odds: 3.40, result: "loss", pnl: -100 },
  { date: "05 Juin", home: "Bayern", away: "Dortmund", prediction: "Victoire Bayern -1", odds: 2.25, result: "win", pnl: 125 },
  { date: "02 Juin", home: "Inter", away: "Juventus", prediction: "Under 2.5 buts", odds: 1.95, result: "win", pnl: 95 },
  { date: "29 Mai", home: "Arsenal", away: "Chelsea", prediction: "BTTS + Over 2.5", odds: 2.50, result: "loss", pnl: -100 },
  { date: "26 Mai", home: "Atlético", away: "Sevilla", prediction: "Victoire Atlético", odds: 1.75, result: "win", pnl: 75 },
  { date: "22 Mai", home: "Napoli", away: "Roma", prediction: "Over 1.5 buts", odds: 1.40, result: "win", pnl: 40 },
  { date: "18 Mai", home: "Tottenham", away: "Newcastle", prediction: "Victoire Tottenham", odds: 2.05, result: "loss", pnl: -100 },
  { date: "14 Mai", home: "AC Milan", away: "Lazio", prediction: "BTTS", odds: 1.80, result: "win", pnl: 80 },
];

function HistoryPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const wins = ROWS.filter((r) => r.result === "win").length;
  const winRate = Math.round((wins / ROWS.length) * 100);
  const totalPnl = ROWS.reduce((s, r) => s + r.pnl, 0);
  const roi = Math.round((totalPnl / (ROWS.length * 100)) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <header>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tracker</span>
          <h1 className="text-2xl font-bold sm:text-3xl">Historique & performances</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance des analyses IA sur les 30 derniers jours · mises théoriques de 100 unités.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          ) : (
            <>
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="ROI Global"
                value={`+${roi}%`}
                sub={`Sur ${ROWS.length} analyses suivies`}
                accent
              />
              <StatCard
                icon={<Percent className="h-4 w-4" />}
                label="Taux de réussite"
                value={`${winRate}%`}
                sub={`${wins} analyses validées`}
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Analyses gagnantes"
                value={`${wins} / ${ROWS.length}`}
                sub={`PnL net +${totalPnl} u`}
              />
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-primary" /> Détail des analyses
            </h2>
            <span className="text-[11px] text-muted-foreground">10 derniers résultats</span>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                    <th className="px-5 py-3 text-left font-medium">Match</th>
                    <th className="px-5 py-3 text-left font-medium">Prédiction IA</th>
                    <th className="px-5 py-3 text-right font-medium">Cote</th>
                    <th className="px-5 py-3 text-center font-medium">Résultat</th>
                    <th className="px-5 py-3 text-right font-medium">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={i} className="border-t border-border/60 transition hover:bg-secondary/30">
                      <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                      <td className="px-5 py-3 font-medium">
                        {r.home} <span className="text-muted-foreground">vs</span> {r.away}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{r.prediction}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.odds.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        {r.result === "win" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <CheckCircle2 className="h-3 w-3" /> Gagné
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                            <XCircle className="h-3 w-3" /> Perdu
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold tabular-nums ${
                          r.pnl >= 0 ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {r.pnl >= 0 ? "+" : ""}
                        {r.pnl} u
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${accent ? "border-primary/40 shadow-[var(--shadow-neon)]" : "border-border"}`}>
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-primary">{icon}</span>
        {label}
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}