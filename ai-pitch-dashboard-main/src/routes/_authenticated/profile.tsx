import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Crown, LogOut, Mail, Sparkles, User as UserIcon, Zap } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — PronoIA" },
      { name: "description", content: "Gérez votre compte et votre abonnement PronoIA." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) return toast.error("Erreur lors de la déconnexion");
    toast.success("Déconnecté");
    router.navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mon espace</span>
          <h1 className="text-2xl font-bold sm:text-3xl">Profil</h1>
        </header>

        {loading || !user ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Identité */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url as string}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-2xl font-semibold text-primary ring-2 ring-primary/40">
                    {(user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold">
                    {(user.user_metadata?.full_name as string) ||
                      (user.user_metadata?.name as string) ||
                      "Membre PronoIA"}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="ID utilisateur" value={user.id.slice(0, 8) + "…"} />
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user.email ?? "—"} />
                <InfoRow
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Inscrit le"
                  value={new Date(user.created_at).toLocaleDateString("fr-FR")}
                />
                <InfoRow
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  label="Fournisseur"
                  value={(user.app_metadata?.provider as string) ?? "email"}
                />
              </dl>

              <button
                onClick={handleSignOut}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/20"
              >
                <LogOut className="h-4 w-4" /> Se déconnecter
              </button>
            </section>

            {/* Abonnement */}
            <aside className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-card to-primary/[0.06] p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Crown className="h-3.5 w-3.5" /> Mon abonnement
                </div>
                <div className="mt-3 text-2xl font-bold">Plan Starter</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous bénéficiez de 3 analyses IA par jour. Passez Pro pour un accès illimité.
                </p>

                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex justify-between text-muted-foreground">
                    <span>Analyses utilisées aujourd'hui</span>
                    <span className="font-semibold text-foreground">1 / 3</span>
                  </li>
                  <li className="flex justify-between text-muted-foreground">
                    <span>Renouvellement</span>
                    <span className="font-semibold text-foreground">Quotidien</span>
                  </li>
                  <li className="flex justify-between text-muted-foreground">
                    <span>Statut</span>
                    <span className="font-semibold text-primary">Actif</span>
                  </li>
                </ul>

                <button
                  onClick={() => router.navigate({ to: "/pricing" })}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" /> Passer au Pro
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}