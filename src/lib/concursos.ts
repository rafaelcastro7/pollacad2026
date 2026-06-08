import type { Tables } from "@/integrations/supabase/types";
import { Trophy, CalendarDays, Layers, Swords } from "lucide-react";

export type Concurso = Tables<"concursos">;
export type Inscripcion = Tables<"inscripciones">;

export type Modalidad = "partido" | "dia" | "fase" | "mundial";
export type EstadoConcurso = "proximo" | "abierto" | "cerrado" | "finalizado";
export type EstadoPago = "pendiente" | "aprobado" | "rechazado";

export interface ConcursoOverview {
  id: string;
  nombre: string;
  modalidad: Modalidad;
  alcance: Record<string, unknown>;
  cuota: number;
  estado: EstadoConcurso;
  deadline: string | null;
  jugadores: number;
  partidos: number;
}

// i18n key maps — resolve with the t() helper in components.
export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  partido: "modalidad.partido",
  dia: "modalidad.dia",
  fase: "modalidad.fase",
  mundial: "modalidad.mundial",
};

export const MODALIDAD_DESC: Record<Modalidad, string> = {
  partido: "modalidad.partido.desc",
  dia: "modalidad.dia.desc",
  fase: "modalidad.fase.desc",
  mundial: "modalidad.mundial.desc",
};

export const MODALIDAD_ICON = {
  partido: Swords,
  dia: CalendarDays,
  fase: Layers,
  mundial: Trophy,
} as const;

export const ESTADO_META: Record<
  EstadoConcurso,
  { labelKey: string; cls: string; dot: string }
> = {
  abierto: {
    labelKey: "estado.abierto",
    cls: "border-primary/40 bg-primary/15 text-primary",
    dot: "bg-primary",
  },
  cerrado: {
    labelKey: "estado.cerrado",
    cls: "border-gold/40 bg-gold/15 text-gold",
    dot: "bg-gold",
  },
  finalizado: {
    labelKey: "estado.finalizado",
    cls: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  proximo: {
    labelKey: "estado.proximo",
    cls: "border-info/40 bg-info/10 text-info",
    dot: "bg-info",
  },
};

export const PAGO_META: Record<
  EstadoPago,
  { labelKey: string; cls: string; emoji: string }
> = {
  pendiente: { labelKey: "pago.pendiente", cls: "border-gold/40 bg-gold/15 text-gold", emoji: "🟡" },
  aprobado: { labelKey: "pago.aprobado", cls: "border-primary/40 bg-primary/15 text-primary", emoji: "✅" },
  rechazado: { labelKey: "pago.rechazado", cls: "border-destructive/40 bg-destructive/15 text-destructive", emoji: "❌" },
};
