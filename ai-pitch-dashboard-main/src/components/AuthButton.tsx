import { Link, useRouter } from "@tanstack/react-router";
import { LogIn, LogOut, User as UserIcon, Crown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-secondary" />;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 rounded-lg border border-primary/60 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
      >
        <LogIn className="h-4 w-4" />
        Connexion
      </Link>
    );
  }

  const initial =
    (user.user_metadata?.full_name || user.user_metadata?.name || user.email || "?")
      .toString()
      .charAt(0)
      .toUpperCase();
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-sm transition hover:border-primary/60"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {initial}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate sm:inline">
          {user.user_metadata?.full_name || user.email}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
            <div className="border-b border-border/60 px-3 py-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <UserIcon className="h-3.5 w-3.5" />
                <span className="truncate font-medium">
                  {user.user_metadata?.full_name || "Mon compte"}
                </span>
              </div>
              <div className="mt-0.5 truncate">{user.email}</div>
            </div>
            <button
              onClick={async () => {
                setOpen(false);
                const { error } = await supabase.auth.signOut();
                if (error) toast.error("Erreur lors de la déconnexion");
                else {
                  toast.success("Déconnecté");
                  router.invalidate();
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-secondary"
            >
              <Crown className="h-4 w-4 text-primary" />
              Mon profil
            </Link>
          </div>
        </>
      )}
    </div>
  );
}