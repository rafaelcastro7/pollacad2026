import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches, useMyPredictions, type Match, type Prediction } from "@/hooks/useData";
import { PredictionCard } from "@/components/PredictionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { dateLabelET, isLocked, hoursUntil } from "@/lib/format";
import { TOTAL_MATCHES } from "@/lib/constants";

export const Route = createFileRoute("/predictions")({
  head: () => ({ meta: [{ title: "Mis pronósticos — Polla Mundial 2026" }] }),
  component: PredictionsPage,
});

const JORNADAS = [1, 2, 3] as const;

function PredictionsPage() {
  const router = useRouter();
  const { user, participant, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user || participant?.estado_pago !== "aprobado") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
        <Card className="w-full border-border bg-card p-8 text-center card-shadow">
          <h1 className="font-display text-2xl tracking-wide">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitas un pago aprobado para pronosticar.
          </p>
          <Button className="mt-6" onClick={() => router.navigate({ to: "/dashboard" })}>
            Ir a mi panel
          </Button>
        </Card>
      </main>
    );
  }

  return <PredictionsContent participantId={participant.id} />;
}

function PredictionsContent({ participantId }: { participantId: string }) {
  const { data: matches = [], isLoading: ml } = useMatches();
  const { data: preds = [], refetch } = useMyPredictions(participantId);
  const [jornada, setJornada] = useState<number>(1);

  const predByMatch = useMemo(() => {
    const m = new Map<number, Prediction>();
    for (const p of preds) m.set(p.match_id, p);
    return m;
  }, [preds]);

  const now = Date.now();
  const predictedCount = preds.filter((p) => p.goles_local_pred != null && p.goles_visitante_pred != null).length;

  const lockedNoPred = matches.filter(
    (m) => isLocked(m.kickoff_time, now) && (predByMatch.get(m.id)?.goles_local_pred == null),
  ).length;
  const toComplete = matches.filter(
    (m) => !isLocked(m.kickoff_time, now) && predByMatch.get(m.id)?.goles_local_pred == null,
  ).length;

  // Soon banner: matches within 6h with no prediction
  const soon = matches.filter(
    (m) =>
      !isLocked(m.kickoff_time, now) &&
      hoursUntil(m.kickoff_time, now) <= 6 &&
      predByMatch.get(m.id)?.goles_local_pred == null,
  ).length;

  // Group current jornada matches by date label
  const grouped = useMemo(() => {
    const list = matches.filter((m) => m.jornada === jornada);
    const groups: { label: string; matches: Match[] }[] = [];
    for (const m of list) {
      const label = dateLabelET(m.kickoff_time);
      let g = groups.find((x) => x.label === label);
      if (!g) {
        g = { label, matches: [] };
        groups.push(g);
      }
      g.matches.push(m);
    }
    return groups;
  }, [matches, jornada]);

  if (ml) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <h1 className="font-display text-4xl tracking-wide">
        <span aria-hidden>⚽ </span>Mis Pronósticos
      </h1>
      <p className="text-sm text-muted-foreground">{TOTAL_MATCHES} partidos · fase de grupos</p>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium text-foreground">
            {predictedCount}/{TOTAL_MATCHES}
          </span>
        </div>
        <Progress value={(predictedCount / TOTAL_MATCHES) * 100} className="mt-2 h-2" />
      </div>

      {soon > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-gold">
          <AlertTriangle className="size-4 shrink-0" />
          Tienes {soon} partido{soon > 1 ? "s" : ""} que se juega{soon > 1 ? "n" : ""} pronto — ¡Pronostica antes del kickoff!
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {JORNADAS.map((j) => (
          <button
            key={j}
            onClick={() => setJornada(j)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              jornada === j
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Jornada {j}
          </button>
        ))}
      </div>

      {/* Matches grouped by date */}
      <div className="mt-6 space-y-8">
        {grouped.map((g) => (
          <div key={g.label}>
            <h2 className="mb-3 font-display text-xl tracking-wide text-muted-foreground">{g.label}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.matches.map((m) => (
                <PredictionCard
                  key={m.id}
                  match={m}
                  prediction={predByMatch.get(m.id) ?? null}
                  participantId={participantId}
                  onSaved={() => refetch()}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-3 text-center text-xs sm:text-sm">
          <span className="text-primary">{predictedCount} pronosticados</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-destructive">{lockedNoPred} bloqueados sin pronosticar</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-info">{toComplete} por completar</span>
        </div>
      </div>
    </main>
  );
}
