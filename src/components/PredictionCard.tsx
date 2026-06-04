import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { flag } from "@/lib/flags";
import { formatET, formatUTC, isLocked } from "@/lib/format";
import { getMatchStatus, type MatchLike, type PredLike } from "@/lib/matchStatus";
import type { Match, Prediction } from "@/hooks/useData";

type SaveState = "idle" | "saving" | "saved" | "error";

function clampScore(v: string): number | null {
  if (v === "") return null;
  const n = Math.max(0, Math.min(20, Math.floor(Number(v))));
  return Number.isNaN(n) ? null : n;
}

export function PredictionCard({
  match,
  prediction,
  participantId,
  onSaved,
}: {
  match: Match;
  prediction: Prediction | null;
  participantId: string;
  onSaved: () => void;
}) {
  const [local, setLocal] = useState<string>(prediction?.goles_local_pred?.toString() ?? "");
  const [visit, setVisit] = useState<string>(prediction?.goles_visitante_pred?.toString() ?? "");
  const [save, setSave] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  const locked = isLocked(match.kickoff_time);
  const hasResult = match.goles_local != null && match.goles_visitante != null;

  const matchLike: MatchLike = match;
  const predLike: PredLike | null = prediction;
  const status = getMatchStatus(matchLike, predLike);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (locked) return;
    const l = clampScore(local);
    const v = clampScore(visit);
    if (l == null || v == null) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSave("saving");
      const { error } = await supabase
        .from("predictions")
        .upsert(
          { participant_id: participantId, match_id: match.id, goles_local_pred: l, goles_visitante_pred: v },
          { onConflict: "participant_id,match_id" },
        );
      if (error) {
        setSave("error");
      } else {
        setSave("saved");
        onSaved();
        setTimeout(() => setSave("idle"), 2000);
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, visit]);

  return (
    <Card className="relative border-border bg-card p-4 card-shadow">
      <span
        className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}
      >
        {status.emoji} {status.label}
      </span>

      <div className="text-xs text-muted-foreground">
        Grupo {match.grupo} · Partido #{match.numero_partido}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-right">
          <div className="text-lg leading-none">{flag(match.equipo_local)}</div>
          <div className="mt-1 text-sm font-medium">{match.equipo_local}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            disabled={locked}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="h-12 w-12 px-0 text-center font-display text-2xl"
            aria-label={`Goles ${match.equipo_local}`}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            disabled={locked}
            value={visit}
            onChange={(e) => setVisit(e.target.value)}
            className="h-12 w-12 px-0 text-center font-display text-2xl"
            aria-label={`Goles ${match.equipo_visitante}`}
          />
        </div>

        <div className="text-left">
          <div className="text-lg leading-none">{flag(match.equipo_visitante)}</div>
          <div className="mt-1 text-sm font-medium">{match.equipo_visitante}</div>
        </div>
      </div>

      {hasResult && (
        <p className="mt-3 text-center text-sm">
          Resultado: <span className="font-display text-lg text-gold">{match.goles_local} — {match.goles_visitante}</span>
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>📍 {match.estadio}</span>
        <span className="text-right">
          🕐 {formatET(match.kickoff_time)}
          <br />
          <span className="text-[10px]">({formatUTC(match.kickoff_time)})</span>
        </span>
      </div>

      {!locked && (
        <div className="mt-2 h-4 text-right text-xs">
          {save === "saving" && <span className="text-muted-foreground">Guardando…</span>}
          {save === "saved" && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Check className="size-3" /> Guardado
            </span>
          )}
          {save === "error" && <span className="text-destructive">Error al guardar</span>}
        </div>
      )}
    </Card>
  );
}
