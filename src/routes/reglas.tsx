import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scroll,
  Shield,
  Trophy,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle,
  Layers,
} from "lucide-react";
import { ADMIN_EMAIL } from "@/lib/constants";
import { MODALIDAD_LABEL, MODALIDAD_DESC, MODALIDAD_ICON, type Modalidad } from "@/lib/concursos";

export const Route = createFileRoute("/reglas")({
  head: () => ({
    meta: [
      { title: "Reglas del Juego — Polla Mundial FIFA 2026" },
      {
        name: "description",
        content:
          "Reglas de la Polla Mundial FIFA 2026: modalidades de concurso, inscripción, sistema de puntos, premios y desempates.",
      },
    ],
  }),
  component: ReglasPage,
});

const MODALIDADES: Modalidad[] = ["partido", "dia", "fase", "mundial"];

function ReglasPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-wide sm:text-5xl">
          <span aria-hidden>📋 </span>
          <span className="gold-gradient-text">Reglas del Juego</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Todo lo que necesitas saber para participar en la Polla Mundial 2026
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {/* MODALIDADES */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Layers className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Modalidades de Concurso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              No hay una sola polla: hay <span className="font-semibold text-foreground">varios concursos</span> y
              eliges en cuáles compites. Pronosticas el marcador de cada partido una sola vez y ese marcador
              cuenta en todos los concursos a los que estés inscrito que incluyan ese partido.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODALIDADES.map((m) => {
                const Icon = MODALIDAD_ICON[m];
                return (
                  <div key={m} className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{MODALIDAD_LABEL[m]}</p>
                      <p className="text-xs">{MODALIDAD_DESC[m]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs">
              Cada concurso tiene su <span className="font-semibold text-foreground">propia cuota, su propio pozo,
              su propia tabla y su propia fecha de cierre</span>. Las eliminatorias se abren cuando se conocen los
              equipos clasificados.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link to="/concursos">Ver concursos disponibles</Link>
            </Button>
          </CardContent>
        </Card>

        {/* INSCRIPCIÓN */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Users className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Inscripción y Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Regístrate con un <span className="font-semibold text-foreground">alias único</span> y un{" "}
                <span className="font-semibold text-foreground">PIN de 4 dígitos</span>.
              </li>
              <li>
                Inscríbete a los concursos que quieras desde la página de{" "}
                <Link to="/concursos" className="font-semibold text-primary underline-offset-2 hover:underline">
                  Concursos
                </Link>
                . La cuota se muestra en cada concurso (puede variar según la modalidad).
              </li>
              <li>
                Paga la cuota de cada concurso por e-Transfer a{" "}
                <span className="font-semibold text-foreground">{ADMIN_EMAIL}</span> o en efectivo al organizador.
                Incluye tu alias en el mensaje para identificar tu pago.
              </li>
              <li>
                El organizador marca tu pago como <span className="font-semibold text-success">aprobado</span>. Solo
                entonces apareces en la tabla de ese concurso y optas a su premio.
              </li>
              <li>
                Cada concurso cierra su inscripción al iniciar el primer partido de su alcance (su fecha de cierre
                se indica en el concurso).
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* PRONÓSTICOS */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Scroll className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Pronósticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Pronosticas el <span className="font-semibold text-foreground">marcador exacto</span> de cada partido
                ingresando el número de goles de cada equipo.
              </li>
              <li>
                El marcador se captura <span className="font-semibold text-foreground">una sola vez por partido</span>{" "}
                y vale para todos los concursos que incluyan ese partido.
              </li>
              <li>
                <span className="font-semibold text-destructive">Una vez que guardas un marcador, no se puede
                editar.</span> Revísalo bien antes de pulsar Guardar.
              </li>
              <li>
                Si no lo guardaste antes, el pronóstico se <span className="font-semibold text-foreground">bloquea
                automáticamente al iniciar el partido</span> (kickoff) y ya no podrás ingresarlo.
              </li>
              <li>
                Solo los participantes con pago <span className="font-semibold text-success">aprobado</span> pueden
                guardar pronósticos.
              </li>
              <li>
                Los partidos de eliminatorias con equipos "Por definir" se podrán pronosticar cuando se conozcan los
                clasificados.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* SISTEMA DE PUNTOS */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CheckCircle className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Sistema de Puntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>El mismo sistema de puntos aplica en todos los concursos:</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <div className="font-display text-4xl text-primary">3</div>
                <p className="mt-1 font-semibold text-foreground">Marcador exacto</p>
                <p className="text-xs">Acertaste el resultado exacto (ej: pronosticaste 2-1 y salió 2-1)</p>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
                <div className="font-display text-4xl text-success">1</div>
                <p className="mt-1 font-semibold text-foreground">Resultado correcto</p>
                <p className="text-xs">Acertaste quién ganó o el empate, pero no el marcador exacto</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                <div className="font-display text-4xl text-muted-foreground">0</div>
                <p className="mt-1 font-semibold text-foreground">Fallo</p>
                <p className="text-xs">No acertaste ni el resultado ni el marcador</p>
              </div>
            </div>
            <p>
              Ejemplo: Si pronosticaste Brasil 2-1 Croacia y el resultado fue Brasil 2-1 Croacia, obtienes{" "}
              <span className="font-semibold text-primary">3 puntos</span>. Si el resultado fue Brasil 1-0 Croacia,
              obtienes <span className="font-semibold text-success">1 punto</span>. Si ganó Croacia o empató, obtienes{" "}
              <span className="font-semibold text-muted-foreground">0 puntos</span>.
            </p>
          </CardContent>
        </Card>

        {/* PREMIOS */}
        <Card className="border-gold/30 bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Trophy className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Premios y Distribución del Pozo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              El pozo de cada concurso se calcula como{" "}
              <span className="font-semibold text-foreground">cuota del concurso × número de participantes
              aprobados</span> en ese concurso, y se reparte así:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-2xl">🥇</span>
                <div>
                  <p className="font-semibold text-foreground">1° lugar</p>
                  <p className="text-gold font-display text-xl">60%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-2xl">🥈</span>
                <div>
                  <p className="font-semibold text-foreground">2° lugar</p>
                  <p className="text-gold font-display text-xl">25%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-2xl">🥉</span>
                <div>
                  <p className="font-semibold text-foreground">3° lugar</p>
                  <p className="text-gold font-display text-xl">10%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <span className="text-2xl">4️⃣</span>
                <div>
                  <p className="font-semibold text-foreground">4° lugar</p>
                  <p className="text-gold font-display text-xl">5%</p>
                </div>
              </div>
            </div>
            <p className="text-xs">
              En caso de empates en puntos, el pozo se redistribuye según las reglas de desempate descritas abajo.
            </p>
          </CardContent>
        </Card>

        {/* DESEMPATES */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Shield className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Desempates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>En caso de empate en puntos entre participantes, se aplican estos criterios en orden:</p>
            <ol className="ml-4 list-decimal space-y-2">
              <li>
                <span className="font-semibold text-foreground">Mayor cantidad de marcadores exactos</span> (3 puntos).
              </li>
              <li>
                Si persiste el empate, los participantes empatados{" "}
                <span className="font-semibold text-foreground">comparten el premio en partes iguales</span>.
              </li>
            </ol>
            <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-xs">
              <p className="font-semibold text-info">Ejemplo de redistribución por empate:</p>
              <p className="mt-1">
                Si dos personas empatan en 1° lugar (mismos puntos y mismos exactos), se reparten el 60% + 25% = 85%
                entre ambas (42.5% cada una). El 3° lugar recibe el 10% y el 4° el 5%.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* REGLAS GENERALES */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <AlertTriangle className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Reglas Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Puedes inscribirte en tantos concursos como quieras; cada uno se paga y se premia por separado.
              </li>
              <li>
                El marcador de un partido es el mismo en todos tus concursos: lo capturas una vez.
              </li>
              <li>
                El organizador tiene la facultad de resolver cualquier situación no prevista en estas reglas, y sus
                decisiones son finales e inapelables.
              </li>
              <li>
                Al inscribirte, aceptas cumplir con todas las reglas y el pago de la cuota del concurso.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CALENDARIO */}
        <Card className="border-border bg-card card-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Clock className="size-5" />
            </div>
            <CardTitle className="font-display text-xl tracking-wide">Calendario Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <span className="font-semibold text-foreground">11 de junio de 2026:</span> Inicio del Mundial FIFA
                2026 (primer partido de la fase de grupos).
              </li>
              <li>
                <span className="font-semibold text-foreground">Cierre de cada concurso:</span> al iniciar el primer
                partido de su alcance. Después de esa hora no se admiten inscripciones para ese concurso.
              </li>
              <li>
                <span className="font-semibold text-foreground">Durante el torneo:</span> cada marcador se puede
                guardar hasta el kickoff de su partido; una vez guardado no se edita.
              </li>
              <li>
                <span className="font-semibold text-foreground">Al cerrar un concurso:</span> se calculan los puntos
                y se determina su tabla y la distribución del pozo.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="hero" size="lg">
          <Link to="/concursos">Ver concursos</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
