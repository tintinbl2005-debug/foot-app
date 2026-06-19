import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — PronoIA" },
      { name: "description", content: "Choisissez votre abonnement PronoIA : Starter gratuit ou Pro illimité." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  function handleProClick() {
    if (!user) {
      toast.info("Connectez-vous pour souscrire à l'offre Pro");
      router.navigate({ to: "/auth" });
      return;
    }
    toast.info("Paiement Stripe — bientôt disponible");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Tarification simple
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Boostez vos analyses avec l'IA
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Démarrez gratuitement, passez Pro quand vous voulez. Sans engagement.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <PlanCard
            name="Starter"
            icon={<Zap className="h-4 w-4" />}
            price="0€"
            period="/ mois"
            description="Idéal pour découvrir la puissance de l'analyse IA."
            features={[
              "3 analyses IA par jour",
              "Compositions & infirmerie",
              "Verdict tactique de l'IA",
              "Historique 7 jours",
            ]}
            cta="Commencer gratuitement"
            ctaAction={() => router.navigate({ to: user ? "/" : "/auth" })}
          />

          <PlanCard
            featured
            name="Pro"
            icon={<Crown className="h-4 w-4" />}
            price="19€"
            period="/ mois"
            description="Pour les parieurs sérieux qui veulent un edge constant."
            features={[
              "Analyses IA illimitées",
              "Value bets temps réel",
              "Scénarios tactiques détaillés",
              "Historique & ROI complet",
              "Alertes premium par email",
              "Support prioritaire",
            ]}
            cta="Passer au Pro"
            ctaAction={handleProClick}
          />
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Annulez à tout moment · Paiement sécurisé via Stripe (bientôt disponible)
        </p>
      </main>
    </div>
  );
}

function PlanCard({
  name, icon, price, period, description, features, cta, ctaAction, featured,
}: {
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaAction: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-8 ${
        featured
          ? "border-primary/50 bg-gradient-to-br from-card via-card to-primary/[0.08] shadow-[var(--shadow-neon)]"
          : "border-border bg-card"
      }`}
    >
      {featured && (
        <>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            <Sparkles className="h-3 w-3" /> Recommandé
          </span>
        </>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15">{icon}</span>
          {name}
        </div>

        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-5xl font-bold tabular-nums">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <ul className="mt-6 space-y-3 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-primary" : "text-foreground"}`} />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={ctaAction}
          className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
            featured
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border border-border bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}