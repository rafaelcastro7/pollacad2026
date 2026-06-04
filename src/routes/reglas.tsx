import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scroll, Shield, Trophy, Clock, Coins, AlertTriangle, Users, CheckCircle } from "lucide-react";
import { ENTRY_FEE, ADMIN_EMAIL } from "@/lib/constants";

export const Route = createFileRoute("/reglas")({
  head: () => ({
    meta: [
      { title: "Reglas del Juego — Polla Mundial FIFA 2026" },
      {
        name: "description",
        content: "Reglas completas de la Polla Mundial FIFA 2026: inscripción, puntos, premios, desempates y más.",
      },
    ],
  }),
  component: ReglasPage,
});

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
                Cuota de inscripción: <span className="font-semibold text-foreground">${ENTRY_FEE} CAD</span> por participante.
              </li>
              <li>
                Regístrate con un <span className="font-semibold text-foreground">alias único</span> y un <span className="font-semibold text-foreground">PIN de 4 dígitos</span>.
              </li>
              <li>
                Realiza el pago por e-Transfer a <span className="font-semibold text-foreground">{ADMIN_EMAIL}</span> o en efectivo al organizador.
              </li>
              <li>
                Incluye tu alias en el mensaje del e-Transfer para identificar tu pago.
              </li>
              <li>
                El organizador activará tu cuenta una vez confirmado el pago. Hasta entonces no podrás ingresar pronósticos.
              </li>
              <li>
                Fecha límite de inscripción: <span className="font-semibold text-foreground">11 de junio de 2026</span> (inicio del Mundial).
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
                Debes pronosticar el resultado exacto de los <span className="font-semibold text-foreground">72 partidos de la fase de grupos</span>.
              </li>
              <li>
                Los pronósticos se ingresan marcando el número de goles de cada equipo.
              </li>
              <li>
                Puedes modificar tus pronósticos <span className="font-semibold text-foreground">hasta 1 hora antes</span> del inicio de cada partido.
              </li>
              <li>
                Una vez iniciado un partido, sus pronósticos se bloquean y no podrán modificarse.
              </li>
              <li>
                Solo los participantes con pago <span className="font-semibold text-success">aprobado</span> pueden ingresar y guardar pronósticos.
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
              Ejemplo: Si pronosticaste Brasil 2-1 Croacia y el resultado fue Brasil 2-1 Croacia, obtienes <span className="font-semibold text-primary">3 puntos</span>. Si el resultado fue Brasil 1-0 Croacia, obtienes <span className="font-semibold text-success">1 punto</span>. Si ganó Croacia o empató, obtienes <span className="font-semibold text-muted-foreground">0 puntos</span>.
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
              El pozo total se calcula multiplicando <span className="font-semibold text-foreground">${ENTRY_FEE} CAD × número de participantes aprobados</span>.
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
                <span className="font-semibold text-foreground">Mayor cantidad de resultados correctos</span> (1 punto).
              </li>
              <li>
                Si persiste el empate, los participantes empatados comparten el premio proporcionalmente.
              </li>
            </ol>
            <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-xs">
              <p className="font-semibold text-info">Ejemplo de redistribución por empate:</p>
              <p className="mt-1">
                Si dos personas empatan en 1° lugar, se reparten el 60% + 25% = 85% entre ambas (42.5% cada una). El 3° lugar recibe el 10% y el 4° el 5%.
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
                La polla cubre únicamente la <span className="font-semibold text-foreground">fase de grupos</span> del Mundial FIFA 2026 (72 partidos).
              </li>
              <li>
                No se pronostican partidos de eliminatorias (octavos, cuartos, semis, final).
              </li>
              <li>
                El organizador tiene la facultad de resolver cualquier situación no prevista en estas reglas.
              </li>
              <li>
                Las decisiones del organizador son finales e inapelables.
              </li>
              <li>
                Al inscribirte, aceptas cumplir con todas las reglas y el pago de la cuota de participación.
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
                <span className="font-semibold text-foreground">11 de junio de 2026:</span> Inicio del Mundial FIFA 2026 y cierre de inscripciones.
              </li>
              <li>
                <span className="font-semibold text-foreground">Durante la fase de grupos:</span> Los pronósticos se pueden modificar hasta 1 hora antes de cada partido.
              </li>
              <li>
                <span className="font-semibold text-foreground">Al finalizar la fase de grupos:</span> Se calculan los puntos finales y se determina la tabla de posiciones.
              </li>
              <li>
                <span className="font-semibold text-foreground">Entrega de premios:</span> Dentro de las 48 horas posteriores al cierre de la fase de grupos.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="hero" size="lg">
          <Link to="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="/login">Iniciar sesión</a>
        </Button>
      </div>
    </main>
  );
}
