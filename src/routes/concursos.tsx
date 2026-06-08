import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Users, ListChecks, Clock, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConcursosOverview, useMyInscripciones } from "@/hooks/useConcursos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCAD, formatET } from "@/lib/format";
import { useT, tStatic, type TFunc } from "@/lib/i18n";
import {
  MODALIDAD_LABEL,
  MODALIDAD_ICON,
  ESTADO_META,
  PAGO_META,
  type Modalidad,
  type EstadoConcurso,
  type ConcursoOverview,
} from "@/lib/concursos";

export const Route = createFileRoute("/concursos")({
  head: () => ({
    meta: [
      { title: tStatic("concursos.meta.title") },
      { name: "description", content: tStatic("concursos.meta.desc") },
      { property: "og:title", content: tStatic("concursos.meta.title") },
      { property: "og:description", content: tStatic("concursos.meta.desc") },
    ],
  }),
  component: ConcursosPage,
});

const MODALIDADES: ("todos" | Modalidad)[] = ["todos", "mundial", "fase", "dia", "partido"];
const ESTADOS: ("todos" | EstadoConcurso)[] = ["todos", "abierto", "cerrado", "finalizado"];

function ConcursosPage() {
  const t = useT();
  const { participant } = useAuth();
  const { data: concursos = [], isLoading } = useConcursosOverview();
  const { data: inscripciones = [] } = useMyInscripciones(participant?.id);

  const [modalidad, setModalidad] = useState<"todos" | Modalidad>("todos");
  const [estado, setEstado] = useState<"todos" | EstadoConcurso>("todos");

  const inscMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const i of inscripciones) m.set(i.concurso_id, i.estado_pago);
    return m;
  }, [inscripciones]);

  const filtered = concursos.filter(
    (c) =>
      (modalidad === "todos" || c.modalidad === modalidad) &&
      (estado === "todos" || c.estado === estado),
  );

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-8">
      <div className="ambient-blob -top-20 left-1/4 hidden bg-primary/20 sm:block" aria-hidden />
      <div className="ambient-blob top-40 right-0 hidden bg-gold/15 sm:block" aria-hidden />

      <header className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
          <Trophy className="size-3.5" /> {t("concursos.badge")}
        </span>
        <h1 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
          {t("concursos.titleA")} <span className="gold-gradient-text">{t("concursos.titleB")}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("concursos.subtitle")}</p>
      </header>

      {/* Filters */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              onClick={() => setModalidad(m)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                modalidad === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "todos" ? t("concursos.allModalidades") : t(MODALIDAD_LABEL[m])}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                estado === e
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {e === "todos" ? t("concursos.allEstados") : t(ESTADO_META[e].labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="mt-8 border-border bg-card p-10 text-center card-shadow">
          <div className="text-4xl">🗂️</div>
          <p className="mt-3 font-display text-xl tracking-wide">{t("concursos.empty.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("concursos.empty.desc")}</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <ConcursoCard key={c.id} c={c} pago={inscMap.get(c.id)} index={i} t={t} />
          ))}
        </div>
      )}
    </main>
  );
}

function ConcursoCard({
  c,
  pago,
  index,
  t,
}: {
  c: ConcursoOverview;
  pago: string | undefined;
  index: number;
  t: TFunc;
}) {
  const Icon = MODALIDAD_ICON[c.modalidad];
  const estadoMeta = ESTADO_META[c.estado];
  const pozo = c.cuota * c.jugadores;
  const pagoMeta = pago ? PAGO_META[pago as keyof typeof PAGO_META] : null;

  return (
    <Link
      to="/concursos/$id"
      params={{ id: c.id }}
      className="animate-fade-up group block"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Card className="glass-card flex h-full flex-col p-5 transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-primary/40">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <Icon className="size-3.5" /> {t(MODALIDAD_LABEL[c.modalidad])}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${estadoMeta.cls}`}
          >
            <span className={`size-1.5 rounded-full ${estadoMeta.dot}`} /> {t(estadoMeta.labelKey)}
          </span>
        </div>

        <h2 className="mt-3 font-display text-xl leading-tight tracking-wide">{c.nombre}</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("common.pozo")}</p>
            <p className="font-display text-lg text-gold">{formatCAD(pozo)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("common.cuota")}</p>
            <p className="font-display text-lg text-foreground">{formatCAD(c.cuota)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {c.jugadores}{" "}
            {t(c.jugadores === 1 ? "common.player_one" : "common.player_other")}
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5" /> {c.partidos}{" "}
            {t(c.partidos === 1 ? "common.match_one" : "common.match_other")}
          </span>
          {c.deadline && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {formatET(c.deadline)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          {pagoMeta ? (
            <span className={`rounded-full border px-2 py-0.5 text-xs ${pagoMeta.cls}`}>
              {pagoMeta.emoji} {t(pagoMeta.labelKey)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t("concursos.notEnrolled")}</span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {t("common.see")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
