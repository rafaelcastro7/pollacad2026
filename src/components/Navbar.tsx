import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAdmin, participant } = useAuth();
  const approved = participant?.estado_pago === "aprobado";
  const linkCls =
    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary";
  return (
    <>
      <Link to="/leaderboard" className={linkCls} onClick={onNavigate}>
        Tabla
      </Link>
      {user && (
        <Link to="/dashboard" className={linkCls} onClick={onNavigate}>
          Dashboard
        </Link>
      )}
      {user && approved && (
        <Link to="/predictions" className={linkCls} onClick={onNavigate}>
          Pronósticos
        </Link>
      )}
      {isAdmin && (
        <Link to="/admin" className={linkCls} onClick={onNavigate}>
          Admin
        </Link>
      )}
    </>
  );
}

export function Navbar() {
  const { user, participant, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    router.navigate({ to: "/" });
  };

  const name = participant?.nombre ?? (isAdmin ? "Organizador" : user?.email ?? "");
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-2xl tracking-wide">
          <span aria-hidden>⚽ </span>
          <span className="gold-gradient-text">POLLA 2026</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLinks />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {initial}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="max-w-[160px] truncate text-sm text-foreground">{name}</span>
                  {isAdmin && <span className="text-[10px] uppercase tracking-wide text-gold">Organizador</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="secondary">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border bg-card">
              <SheetTitle className="font-display text-xl">
                <span className="gold-gradient-text">⚽ POLLA 2026</span>
              </SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-6 border-t border-border pt-6">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{name}</p>
                    <Button variant="secondary" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" /> Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full" onClick={() => setOpen(false)}>
                    <Link to="/login">Iniciar sesión</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
