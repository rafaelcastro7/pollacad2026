import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Users, ClipboardList, Wallet, Eye, Trophy, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { flag } from "@/lib/flags";
import { formatET, isLocked, formatCAD } from "@/lib/format";
import { calculatePrizes, MEDALS } from "@/lib/prizes";
import { ENTRY_FEE, TOTAL_MATCHES } from "@/lib/constants";
import { useConcursosOverview } from "@/hooks/useConcursos";
import { MODALIDAD_LABEL, ESTADO_META, PAGO_META, type EstadoConcurso, type Modalidad } from "@/lib/concursos";
import { useT, tStatic } from "@/lib/i18n";

type Participant = Tables<"participants">;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Polla Mundial 2026" }] }),
  component: AdminPage,
});

type Section = "inscripciones" | "resultados" | "resumen" | "concursos";

function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [section, setSection] = useState<Section>("inscripciones");

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
        <Card className="w-full border-destructive/40 bg-destructive/5 p-8 text-center card-shadow">
          <div className="text-4xl">🚫</div>
          <h1 className="mt-3 font-display text-3xl tracking-wide">403</h1>
          <p className="mt-2 text-sm text-muted-foreground">No tienes acceso a esta sección.</p>
          <Button className="mt-6" onClick={() => router.navigate({ to: "/" })}>
            Volver al inicio
          </Button>
        </Card>
      </main>
    );
  }

  const nav: { key: Section; label: string; icon: typeof Users }[] = [
    { key: "concursos", label: "Concursos", icon: Trophy },
    { key: "inscripciones", label: "Inscripciones", icon: Users },
    { key: "resultados", label: "Resultados", icon: ClipboardList },
    { key: "resumen", label: "Resumen", icon: Wallet },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-4xl tracking-wide">Panel de administración</h1>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex gap-2 overflow-x-auto lg:flex-col">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setSection(n.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  section === n.key
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <n.icon className="size-4" /> {n.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          {section === "concursos" && <ConcursosAdmin />}
          {section === "inscripciones" && <Inscripciones />}
          {section === "resultados" && <Resultados />}
          {section === "resumen" && <Resumen onGoToInscripciones={() => setSection("inscripciones")} />}
        </div>
      </div>
    </main>
  );
}

/* ---------------- Section A: Inscripciones ---------------- */

function useParticipants() {
  return useQuery({
    queryKey: ["admin-participants"],
    queryFn: async (): Promise<Participant[]> => {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .order("inscripcion_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "bg-gold/15 text-gold border-gold/40",
  aprobado: "bg-primary/15 text-primary border-primary/40",
  rechazado: "bg-destructive/15 text-destructive border-destructive/40",
};
const ESTADO_EMOJI: Record<string, string> = { pendiente: "🟡", aprobado: "✅", rechazado: "❌" };

function Inscripciones() {
  const qc = useQueryClient();
  const { data: parts = [], isLoading } = useParticipants();
  const [filter, setFilter] = useState<"todos" | "pendiente" | "aprobado" | "rechazado">("todos");
  
  const [confirm, setConfirm] = useState<{ p: Participant; estado: "aprobado" | "rechazado" } | null>(null);
  const [detail, setDetail] = useState<Participant | null>(null);

  const counts = {
    pendiente: parts.filter((p) => p.estado_pago === "pendiente").length,
    aprobado: parts.filter((p) => p.estado_pago === "aprobado").length,
  };
  const recaudado = counts.aprobado * ENTRY_FEE;

  const filtered = parts.filter((p) => filter === "todos" || p.estado_pago === filter);



  const apply = async () => {
    if (!confirm) return;
    const { error } = await supabase
      .from("participants")
      .update({ estado_pago: confirm.estado })
      .eq("id", confirm.p.id);
    if (error) {
      toast.error("Error al actualizar.");
    } else {
      toast.success(confirm.estado === "aprobado" ? "Participante aprobado ✅" : "Participante rechazado");
      qc.invalidateQueries({ queryKey: ["admin-participants"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    }
    setConfirm(null);
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "aprobado", label: "Aprobados" },
    { key: "rechazado", label: "Rechazados" },
  ];

  return (
    <div>
      <Card className="mb-4 border-border bg-card p-4 text-sm card-shadow">
        <span className="text-gold">{counts.pendiente} pendientes</span>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="text-primary">{counts.aprobado} aprobados</span>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="text-foreground">{formatCAD(recaudado)} recaudado (aprox)</span>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === t.key
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="overflow-x-auto border-border bg-card card-shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Alias</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">{p.nombre}</td>
                  <td className="p-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${ESTADO_BADGE[p.estado_pago]}`}>
                      {ESTADO_EMOJI[p.estado_pago]} {p.estado_pago}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setDetail(p)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        disabled={p.estado_pago === "aprobado"}
                        onClick={() => setConfirm({ p, estado: "aprobado" })}
                      >
                        ✅
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={p.estado_pago === "rechazado"}
                        onClick={() => setConfirm({ p, estado: "rechazado" })}
                      >
                        ❌
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    Sin inscripciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}



      {/* Confirm dialog */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.estado === "aprobado" ? "Aprobar pago" : "Rechazar pago"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.estado === "aprobado"
                ? `${confirm?.p.nombre} podrá pronosticar los 72 partidos.`
                : `${confirm?.p.nombre} no podrá acceder a los pronósticos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drill-down: detalle del participante */}
      <ParticipantDetailDialog participant={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ---------------- Drill-down de participante ---------------- */

type DetailRow = {
  match_id: number;
  numero_partido: number;
  jornada: number;
  equipo_local: string;
  equipo_visitante: string;
  grupo: string;
  kickoff_time: string;
  goles_local: number | null;
  goles_visitante: number | null;
  goles_local_pred: number | null;
  goles_visitante_pred: number | null;
  puntos_obtenidos: number | null;
};

const PTS_BADGE: Record<number, string> = {
  3: "bg-primary/15 text-primary border-primary/40",
  1: "bg-success/10 text-success border-success/30",
  0: "bg-destructive/15 text-destructive border-destructive/40",
};

function ParticipantDetailDialog({
  participant,
  onClose,
}: {
  participant: Participant | null;
  onClose: () => void;
}) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["participant-detail", participant?.id],
    enabled: !!participant,
    queryFn: async (): Promise<DetailRow[]> => {
      const { data, error } = await supabase.rpc("get_participant_predictions", {
        _participant_id: participant!.id,
      });
      if (error) throw error;
      return (data ?? []) as DetailRow[];
    },
  });

  const predichos = rows.filter(
    (r) => r.goles_local_pred != null && r.goles_visitante_pred != null,
  ).length;
  const totalPuntos = rows.reduce((s, r) => s + (r.puntos_obtenidos ?? 0), 0);
  const exactos = rows.filter((r) => (r.puntos_obtenidos ?? 0) === 3).length;

  const notApproved = participant && participant.estado_pago !== "aprobado";

  return (
    <Dialog open={!!participant} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            {participant?.nombre}
          </DialogTitle>
          <DialogDescription>
            {predichos} pronósticos · {totalPuntos} pts · {exactos} exactos
          </DialogDescription>
        </DialogHeader>

        {notApproved ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Este participante no está aprobado, por lo que no tiene pronósticos disponibles.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-2">#</th>
                <th className="p-2">Partido</th>
                <th className="p-2 text-center">Pronóstico</th>
                <th className="p-2 text-center">Resultado</th>
                <th className="p-2 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hasPred = r.goles_local_pred != null && r.goles_visitante_pred != null;
                const hasResult = r.goles_local != null && r.goles_visitante != null;
                return (
                  <tr key={r.match_id} className="border-b border-border/60">
                    <td className="p-2 text-muted-foreground">{r.numero_partido}</td>
                    <td className="p-2">
                      {flag(r.equipo_local)} {r.equipo_local} vs {r.equipo_visitante} {flag(r.equipo_visitante)}
                    </td>
                    <td className="p-2 text-center font-medium">
                      {hasPred ? `${r.goles_local_pred} — ${r.goles_visitante_pred}` : "—"}
                    </td>
                    <td className="p-2 text-center text-muted-foreground">
                      {hasResult ? `${r.goles_local} — ${r.goles_visitante}` : "—"}
                    </td>
                    <td className="p-2 text-right">
                      {hasResult && hasPred ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs ${PTS_BADGE[r.puntos_obtenidos ?? 0]}`}
                        >
                          {r.puntos_obtenidos ?? 0}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Sin partidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Section B: Resultados ---------------- */

function Resultados() {
  const qc = useQueryClient();
  const { data: matches = [], isLoading } = useMatches();
  const [jornada, setJornada] = useState(1);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const list = matches.filter((m) => m.jornada === jornada);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {[1, 2, 3].map((j) => (
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
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((m) => (
          <ResultCard key={m.id} match={m} onSaved={() => {
            qc.invalidateQueries({ queryKey: ["matches"] });
            qc.invalidateQueries({ queryKey: ["leaderboard"] });
          }} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ match, onSaved }: { match: Tables<"matches">; onSaved: () => void }) {
  const started = isLocked(match.kickoff_time);
  const [gl, setGl] = useState(match.goles_local?.toString() ?? "");
  const [gv, setGv] = useState(match.goles_visitante?.toString() ?? "");
  const [editing, setEditing] = useState(match.goles_local == null);
  const [saving, setSaving] = useState(false);
  const hasResult = match.goles_local != null && match.goles_visitante != null;

  const save = async () => {
    if (!started) {
      toast.warning("⚠️ Este partido aún no ha comenzado.");
      return;
    }
    const l = Number(gl);
    const v = Number(gv);
    if (gl === "" || gv === "" || Number.isNaN(l) || Number.isNaN(v)) {
      toast.error("Ingresa ambos marcadores.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("matches")
      .update({ goles_local: l, goles_visitante: v })
      .eq("id", match.id);
    if (error) {
      toast.error("Error al guardar.");
      setSaving(false);
      return;
    }
    const { count } = await supabase
      .from("predictions")
      .select("*", { count: "exact", head: true })
      .eq("match_id", match.id)
      .not("goles_local_pred", "is", null);
    toast.success(`✅ Resultado guardado — Puntos calculados para ${count ?? 0} participantes`);
    setEditing(false);
    setSaving(false);
    onSaved();
  };

  return (
    <Card className="border-border bg-card p-4 card-shadow">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Partido #{match.numero_partido} · Grupo {match.grupo}</span>
        {!started && <span className="text-gold">No iniciado</span>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">📍 {match.estadio} · 🕐 {formatET(match.kickoff_time)}</p>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="text-right text-sm font-medium">{flag(match.equipo_local)} {match.equipo_local}</span>
        {hasResult && !editing ? (
          <span className="text-center font-display text-2xl text-gold">
            {match.goles_local} — {match.goles_visitante}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Input type="number" min={0} max={20} value={gl} disabled={!started}
              onChange={(e) => setGl(e.target.value)} className="h-11 w-11 px-0 text-center font-display text-xl" />
            <span className="text-muted-foreground">—</span>
            <Input type="number" min={0} max={20} value={gv} disabled={!started}
              onChange={(e) => setGv(e.target.value)} className="h-11 w-11 px-0 text-center font-display text-xl" />
          </div>
        )}
        <span className="text-left text-sm font-medium">{match.equipo_visitante} {flag(match.equipo_visitante)}</span>
      </div>
      <div className="mt-3 flex justify-center">
        {hasResult && !editing ? (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Editar resultado</Button>
        ) : (
          <Button variant="hero" size="sm" disabled={!started || saving} onClick={save}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar resultado
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Section C: Resumen ---------------- */

function Resumen({ onGoToInscripciones }: { onGoToInscripciones: () => void }) {
  const { data: parts = [] } = useParticipants();
  const { data: matches = [] } = useMatches();
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        participant_id: r.participant_id,
        nombre: r.nombre,
        total_puntos: Number(r.total_puntos),
        exactos: Number(r.exactos),
        ganadores: Number(r.ganadores),
        posicion: Number(r.posicion),
      }));
    },
  });

  const aprobados = parts.filter((p) => p.estado_pago === "aprobado").length;
  const pendientes = parts.filter((p) => p.estado_pago === "pendiente").length;
  const pot = aprobados * ENTRY_FEE;
  const jugados = matches.filter((m) => m.goles_local != null && m.goles_visitante != null).length;
  const prizes = useMemo(() => calculatePrizes(leaderboard, pot), [leaderboard, pot]);

  const cards = [
    { label: "Participantes aprobados", value: aprobados },
    { label: "Pozo total", value: formatCAD(pot), gold: true },
    { label: "Pendientes de aprobar", value: pendientes, action: true },
    { label: "Partidos jugados", value: `${jugados} / ${TOTAL_MATCHES}` },
    { label: "Partidos pendientes", value: TOTAL_MATCHES - jugados },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-border bg-card p-5 card-shadow">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className={`mt-2 font-display text-3xl ${c.gold ? "text-gold" : "text-foreground"}`}>{c.value}</p>
            {c.action && pendientes > 0 && (
              <Button variant="ghost" size="sm" className="mt-1 px-0" onClick={onGoToInscripciones}>
                Revisar →
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Card className="border-gold/30 bg-card p-5 card-shadow">
        <h2 className="font-display text-xl tracking-wide">Distribución de premios proyectada</h2>
        {leaderboard.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aún no hay participantes aprobados.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {leaderboard
              .filter((r) => (prizes[r.participant_id] ?? 0) > 0)
              .map((r) => (
                <div key={r.participant_id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {MEDALS[r.posicion] ?? `${r.posicion}°`} {r.nombre}
                  </span>
                  <span className="text-gold">{formatCAD(prizes[r.participant_id] ?? 0)}</span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Section D: Concursos ---------------- */

const ESTADOS_OPC: EstadoConcurso[] = ["proximo", "abierto", "cerrado", "finalizado"];

function ConcursosAdmin() {
  const t = useT();
  const qc = useQueryClient();
  const { data: concursos = [], isLoading } = useConcursosOverview();
  const [generating, setGenerating] = useState(false);
  const [manage, setManage] = useState<{ id: string; nombre: string } | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["concursos-overview"] });

  const generate = async (includePartidos: boolean) => {
    setGenerating(true);
    const { data, error } = await supabase.rpc("generate_concursos", {
      _include_partidos: includePartidos,
    });
    setGenerating(false);
    if (error) {
      toast.error("No se pudieron generar los concursos.");
      return;
    }
    toast.success(`${data ?? 0} concurso(s) creados.`);
    refresh();
  };

  const updateField = async (id: string, fields: { estado?: string; cuota?: number }, msg?: string) => {
    const { error } = await supabase.from("concursos").update(fields).eq("id", id);
    if (error) {
      toast.error("Error al actualizar.");
      return;
    }
    if (msg) toast.success(msg);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("concursos").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar.");
      return;
    }
    toast.success("Concurso eliminado.");
    refresh();
  };

  return (
    <div>
      <Card className="mb-4 border-gold/30 bg-card p-4 card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg tracking-wide">Generación automática</h2>
            <p className="text-xs text-muted-foreground">
              Crea los concursos por día, por fase y el Mundial completo. Es idempotente: no duplica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" size="sm" disabled={generating} onClick={() => generate(false)}>
              {generating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generar concursos
            </Button>
            <Button variant="secondary" size="sm" disabled={generating} onClick={() => generate(true)}>
              + Incluir por partido
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : concursos.length === 0 ? (
        <Card className="border-border bg-card p-8 text-center text-sm text-muted-foreground card-shadow">
          Aún no hay concursos. Usa “Generar concursos”.
        </Card>
      ) : (
        <Card className="overflow-x-auto border-border bg-card card-shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Concurso</th>
                <th className="p-3">Modalidad</th>
                <th className="p-3 text-center">Jug.</th>
                <th className="p-3 text-right">Cuota</th>
                <th className="p-3 text-right">Pozo</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {concursos.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">{c.nombre}</td>
                  <td className="p-3 text-muted-foreground">{MODALIDAD_LABEL[c.modalidad as Modalidad]}</td>
                  <td className="p-3 text-center">{c.jugadores}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min={0}
                      defaultValue={c.cuota}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v) && v !== c.cuota) updateField(c.id, { cuota: v }, "Cuota actualizada.");
                      }}
                      className="h-8 w-16 rounded-md border border-border bg-background px-2 text-right"
                    />
                  </td>
                  <td className="p-3 text-right text-gold">{formatCAD(c.cuota * c.jugadores)}</td>
                  <td className="p-3">
                    <select
                      value={c.estado}
                      onChange={(e) => updateField(c.id, { estado: e.target.value })}
                      className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                    >
                      {ESTADOS_OPC.map((s) => (
                        <option key={s} value={s}>
                          {t(ESTADO_META[s].labelKey)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setManage({ id: c.id, nombre: c.nombre })}>
                        <Users className="size-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(c.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ManageInscripcionesDialog
        concurso={manage}
        onClose={() => setManage(null)}
        onChanged={refresh}
      />
    </div>
  );
}

type InscripcionRow = {
  id: string;
  estado_pago: string;
  participant_id: string;
  participants: { nombre: string } | null;
};

function ManageInscripcionesDialog({
  concurso,
  onClose,
  onChanged,
}: {
  concurso: { id: string; nombre: string } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-inscripciones", concurso?.id],
    enabled: !!concurso,
    queryFn: async (): Promise<InscripcionRow[]> => {
      const { data, error } = await supabase
        .from("inscripciones")
        .select("id, estado_pago, participant_id, participants(nombre)")
        .eq("concurso_id", concurso!.id)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InscripcionRow[];
    },
  });

  const setEstado = async (id: string, estado_pago: string) => {
    const { error } = await supabase.from("inscripciones").update({ estado_pago }).eq("id", id);
    if (error) {
      toast.error("Error al actualizar inscripción.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-inscripciones", concurso?.id] });
    onChanged();
  };

  return (
    <Dialog open={!!concurso} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">{concurso?.nombre}</DialogTitle>
          <DialogDescription>Gestiona los pagos de las inscripciones.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay inscripciones.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.participants?.nombre ?? "—"}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${PAGO_META[r.estado_pago as keyof typeof PAGO_META].cls}`}>
                    {PAGO_META[r.estado_pago as keyof typeof PAGO_META].emoji} {PAGO_META[r.estado_pago as keyof typeof PAGO_META].label}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="hero"
                    size="sm"
                    disabled={r.estado_pago === "aprobado"}
                    onClick={() => setEstado(r.id, "aprobado")}
                  >
                    ✅
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={r.estado_pago === "rechazado"}
                    onClick={() => setEstado(r.id, "rechazado")}
                  >
                    ❌
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
