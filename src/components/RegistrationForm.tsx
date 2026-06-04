import { useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { UploadCloud, FileCheck2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];

export function RegistrationForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Formato no válido. Sube JPG, PNG o PDF.");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("El archivo supera 5 MB. Por favor sube una imagen más pequeña.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      toast.error("Completa todos los campos.");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!accepted) {
      toast.error("Debes aceptar las reglas del torneo.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: signUp, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { nombre } },
      });
      if (signErr) throw signErr;
      const user = signUp.user;
      if (!user) throw new Error("No se pudo crear la cuenta.");

      let comprobante_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("comprobantes").upload(path, file);
        if (upErr) throw upErr;
        comprobante_url = path;
      }

      const { error: insErr } = await supabase.from("participants").insert({
        user_id: user.id,
        nombre,
        telefono,
        email,
        comprobante_url,
      });
      if (insErr) throw insErr;

      await refresh();
      setDone(true);
      toast.success("¡Registro recibido!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error en el registro.";
      toast.error(msg.includes("already registered") ? "Este email ya está registrado." : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-lg border-primary/30 bg-card p-8 text-center card-shadow">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-3xl">
          ✅
        </div>
        <h3 className="font-display text-2xl text-foreground">Registro recibido</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu pago está pendiente de verificación. Recibirás acceso cuando el organizador confirme tu
          pago.
        </p>
        <Button className="mt-6" onClick={() => router.navigate({ to: "/dashboard" })}>
          Ir a mi panel
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg border-border bg-card p-6 card-shadow sm:p-8">
      <h3 className="font-display text-2xl tracking-wide text-foreground">Inscríbete</h3>
      <p className="mt-1 text-sm text-muted-foreground">Crea tu cuenta y sube tu comprobante de pago.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tel">Teléfono / WhatsApp</Label>
          <Input id="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+1 ..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pass">Contraseña (mín. 8 caracteres)</Label>
          <Input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <div className="space-y-2">
          <Label>Comprobante de pago</Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary/50"
          >
            {file ? (
              <>
                <FileCheck2 className="size-6 text-primary" />
                <span className="text-sm text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">Toca para cambiar</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-6 text-muted-foreground" />
                <span className="text-sm text-foreground">Arrastra o toca para subir</span>
                <span className="text-xs text-muted-foreground">JPG, PNG o PDF · máx 5 MB</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" />
          <span>Acepto las reglas del torneo</span>
        </label>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          INSCRIBIRME — $20 CAD
        </Button>
      </form>
    </Card>
  );
}
