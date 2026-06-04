import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, ListChecks, Coins } from "lucide-react";
import heroImg from "@/assets/hero-stadium.jpg";
import { Countdown } from "@/components/Countdown";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ENTRY_FEE, ADMIN_EMAIL } from "@/lib/constants";
import { formatCAD } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Polla Mundial FIFA 2026 ⚽ — Pronostica y gana" },
      {
        name: "description",
        content:
          "Únete a la Polla Mundial FIFA 2026: pronostica los 72 partidos de fase de grupos por $20 CAD y gana hasta el 60% del pozo.",
      },
    ],
  }),
  component: Landing,
});

function useApprovedCount() {
  return useQuery({
    queryKey: ["approved-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) throw error;
      return data?.length ?? 0;
    },
  });
}

function Landing() {
  const { data: count = 0 } = useApprovedCount();
  const pot = Math.max(count, 0) * ENTRY_FEE;
  const sample = pot > 0 ? pot : 50 * ENTRY_FEE;
  const sampleN = pot > 0 ? count : 50;

  const steps = [
    { icon: Coins, title: "Regístrate y paga $20 CAD", desc: "Crea tu alias y PIN; el pago se coordina aparte." },
    { icon: ListChecks, title: "Pronostica los 72 partidos", desc: "Marca el resultado de cada juego antes del kickoff." },
    { icon: Trophy, title: "Gana hasta el 60% del pozo", desc: "Suma puntos y escala la tabla en vivo." },
  ];

  const prizes = [
    { medal: "🥇", pct: "60%", amt: sample * 0.6 },
    { medal: "🥈", pct: "25%", amt: sample * 0.25 },
    { medal: "🥉", pct: "10%", amt: sample * 0.1 },
    { medal: "4️⃣", pct: "5%", amt: sample * 0.05 },
  ];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Estadio de fútbol iluminado de noche"
          width={1920}
          height={1080}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <h1 className="font-display text-5xl leading-none sm:text-7xl">
            <span aria-hidden>⚽ </span>
            <span className="gold-gradient-text">POLLA MUNDIAL FIFA 2026</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            72 partidos · Fase de grupos · <span className="text-gold font-semibold">$20 CAD</span>
          </p>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Arranca en
          </p>
          <div className="mt-4">
            <Countdown />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <a href="#inscripcion">Inscribirme</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/leaderboard">Ver tabla</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl tracking-wide sm:text-4xl">Cómo funciona</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={i} className="border-border bg-card p-6 card-shadow">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <s.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-xl tracking-wide">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PRIZES */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <Card className="border-gold/30 bg-card p-6 card-shadow sm:p-8">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="font-display text-3xl tracking-wide">Premios</h2>
            <p className="text-sm text-muted-foreground">
              {sampleN} participantes = <span className="text-gold font-semibold">{formatCAD(sample)}</span> pozo
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {prizes.map((p) => (
              <div key={p.medal} className="rounded-xl border border-border bg-muted/40 p-5 text-center">
                <div className="text-3xl">{p.medal}</div>
                <div className="mt-2 font-display text-4xl text-gold">{p.pct}</div>
                <div className="mt-1 text-sm text-muted-foreground">{formatCAD(p.amt)}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* SCORING */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-center font-display text-3xl tracking-wide sm:text-4xl">Sistema de puntos</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/30 bg-card p-6 text-center card-shadow">
            <div className="font-display text-5xl text-primary">3</div>
            <p className="mt-2 text-sm text-muted-foreground">puntos · Marcador exacto</p>
            <p className="mt-1 text-xs text-muted-foreground">(2-1 y salió 2-1)</p>
          </Card>
          <Card className="border-success/30 bg-card p-6 text-center card-shadow">
            <div className="font-display text-5xl text-success">1</div>
            <p className="mt-2 text-sm text-muted-foreground">punto · Resultado correcto</p>
            <p className="mt-1 text-xs text-muted-foreground">(ganó el mismo equipo)</p>
          </Card>
          <Card className="border-border bg-card p-6 text-center card-shadow">
            <div className="font-display text-5xl text-muted-foreground">0</div>
            <p className="mt-2 text-sm text-muted-foreground">puntos · Fallo</p>
            <p className="mt-1 text-xs text-muted-foreground">(resultado incorrecto)</p>
          </Card>
        </div>
      </section>

      {/* REGISTRATION */}
      <section id="inscripcion" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <RegistrationForm />

        {/* PAYMENT INSTRUCTIONS */}
        <Card className="mx-auto mt-8 max-w-lg border-info/30 bg-info/5 p-6">
          <h3 className="font-display text-xl tracking-wide text-info">💳 Instrucciones de pago</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Paga <span className="font-semibold text-foreground">$20 CAD</span> por e-Transfer a{" "}
            <span className="font-semibold text-foreground">{ADMIN_EMAIL}</span> o en efectivo. Incluye
            tu nombre y email en el mensaje.
          </p>
        </Card>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        POLLA MUNDIAL 2026 · {ADMIN_EMAIL} · $20 CAD antes del 11 Jun 2026
      </footer>
    </main>
  );
}
