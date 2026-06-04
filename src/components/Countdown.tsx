import { useEffect, useState } from "react";
import { countdownTo, type Countdown as CD } from "@/lib/format";
import { TOURNAMENT_START_UTC } from "@/lib/constants";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[64px] rounded-xl border border-border bg-card px-3 py-2 text-center font-display text-4xl text-gold tabular-nums sm:min-w-[84px] sm:text-5xl">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

export function Countdown() {
  const [cd, setCd] = useState<CD>(() => countdownTo(TOURNAMENT_START_UTC));

  useEffect(() => {
    const t = setInterval(() => setCd(countdownTo(TOURNAMENT_START_UTC)), 1000);
    return () => clearInterval(t);
  }, []);

  if (cd.done) {
    return (
      <p className="font-display text-3xl text-primary">¡El torneo ha comenzado! ⚽</p>
    );
  }

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      <Unit value={cd.days} label="Días" />
      <Unit value={cd.hours} label="Horas" />
      <Unit value={cd.minutes} label="Min" />
      <Unit value={cd.seconds} label="Seg" />
    </div>
  );
}
