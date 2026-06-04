import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { aliasToEmail, pinToPassword, PIN_RE } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Polla Mundial 2026" },
      { name: "description", content: "Accede a tu panel de la Polla Mundial FIFA 2026." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [alias, setAlias] = useState("");
  const [pin, setPin] = useState("");
  const [orgMode, setOrgMode] = useState(false);
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPass, setOrgPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const creds = orgMode
        ? { email: orgEmail.trim(), password: orgPass }
        : { email: aliasToEmail(alias.trim()), password: pinToPassword(pin) };

      if (!orgMode && !PIN_RE.test(pin)) {
        toast.error("El PIN debe ser de 4 dígitos.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(creds);
      if (error) throw error;
      toast.success("¡Bienvenido!");
      router.navigate({ to: orgMode ? "/admin" : "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      toast.error(
        msg.includes("Invalid login")
          ? orgMode
            ? "Email o contraseña incorrectos."
            : "Alias o PIN incorrectos."
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <Card className="w-full border-border bg-card p-8 card-shadow">
        <h1 className="font-display text-3xl tracking-wide">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orgMode ? "Acceso del organizador." : "Entra con tu alias y PIN."}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {orgMode ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Contraseña</Label>
                <Input id="pass" type="password" value={orgPass} onChange={(e) => setOrgPass(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="alias">Nombre o alias</Label>
                <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Tu alias" maxLength={24} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN (4 dígitos)</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                />
              </div>
            </>
          )}
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Iniciar sesión
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <p>
            ¿No tienes cuenta?{" "}
            <Link to="/" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setOrgMode((v) => !v)}
            className="text-xs text-muted-foreground/70 hover:text-foreground"
          >
            {orgMode ? "← Soy participante" : "Acceso organizador"}
          </button>
        </div>
      </Card>
    </main>
  );
}
