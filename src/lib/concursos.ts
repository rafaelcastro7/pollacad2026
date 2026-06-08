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

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  partido: "Por partido",
  dia: "Día de partidos",
  fase: "Por fase",
  mundial: "Mundial completo",
};

export const MODALIDAD_ICON = {
  partido: Swords,
  dia: CalendarDays,
  fase: Layers,
  mundial: Trophy,
} as const;

export const MODALIDAD_DESC: Record<Modalidad, string> = {
  partido: "Un solo partido. Apuesta rápida.",
  dia: "Todos los partidos de un mismo día.",
  fase: "Una ronda completa del torneo.",
  mundial: "Los 104 partidos del Mundial.",
};

export const ESTADO_META: Record<
  EstadoConcurso,
  { label: string; cls: string; dot: string }
> = {
  abierto: {
    label: "Abierto",
    cls: "border-primary/40 bg-primary/15 text-primary",
    dot: "bg-primary",
  },
  cerrado: {
    label: "Cerrado",
    cls: "border-gold/40 bg-gold/15 text-gold",
    dot: "bg-gold",
  },
  finalizado: {
    label: "Finalizado",
    cls: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  proximo: {
    label: "Próximamente",
    cls: "border-info/40 bg-info/10 text-info",
    dot: "bg-info",
  },
};

export const PAGO_META: Record<
  EstadoPago,
  { label: string; cls: string; emoji: string }
> = {
  pendiente: { label: "Pago pendiente", cls: "border-gold/40 bg-gold/15 text-gold", emoji: "🟡" },
  aprobado: { label: "Inscrito", cls: "border-primary/40 bg-primary/15 text-primary", emoji: "✅" },
  rechazado: { label: "Rechazado", cls: "border-destructive/40 bg-destructive/15 text-destructive", emoji: "❌" },
};
