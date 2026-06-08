## Rediseño multi-modalidad — versión validada

### 🔥 Roast (qué seguía flojo y ya quedó resuelto)
1. **Muro de pago vs. pronóstico global era contradictorio.** O cobras por concurso o el pronóstico es gratis para todos. → Resuelto con "pronostica una vez, compite donde pagaste" (ver A).
2. **"jornada" significaba dos cosas.** En la BD ya es la fecha 1/2/3 de grupos; yo lo reusé para "día". → Renombrado a `dia` (ver B).
3. **Operación irreal.** Crear ~140 concursos a mano. → Generación automática (ver C).
4. **Dinero ambiguo.** → Modelo explícito (ver D).
5. **Eliminatorias sin equipos.** → Concursos condicionados que abren al definirse los cruces (ver E).

### ✅ Validación con plataformas reales (coherencia)
Toqui, Pickster, ScorePick y Goal Pool Pro usan el mismo patrón: **un motor de pronóstico → varios "concursos/pools" con distinto alcance**, y el lema "pronostica y la tabla se calcula sola". Toqui incluso ofrece "el Mundial, una liga, o un solo partido". Nuestro diseño coincide con el estándar del mercado, así que es coherente y probado.

### Decisiones (claras y seguras)
**A. Pronostica una vez, compite donde pagaste.**
El marcador de un partido se captura una sola vez por jugador. Inscribirse a un concurso desbloquea su tabla y su pozo; no obliga a recapturar. El cobro aplica a *optar al premio y aparecer en la tabla* de ese concurso, no a guardar el marcador. Gancho de marketing, no bug.

**B. Modalidad `dia` ("Día de partidos").**
Valor en BD `dia`; la UI lo llama "Día de partidos" para no chocar con `jornada`. El alcance se resuelve por fecha de kickoff en ET.

**C. Generación automática.**
El organizador no crea uno por uno. Botón "Generar concursos" por modalidad → crea todos (uno por día, uno por fase, etc.) con deadline = primer kickoff del alcance y cuota por defecto editable.

**D. Dinero explícito.**
- Pozo = `cuota × inscritos aprobados`.
- Pagos se coordinan fuera de la app (e-Transfer/efectivo); el panel solo marca `aprobado`.
- "Mis concursos" muestra el total adeudado (suma de cuotas pendientes).
- Reparto con las reglas existentes (`lib/prizes.ts`) por concurso.

**E. Eliminatorias condicionadas.**
32 partidos knockout con equipos "Por definir". Sus concursos nacen `proximo` y pasan a `abierto` al definirse los cruces. Grupos funciona desde el día 1.

**F. Ya aplicado.** Eliminado `dgc75@hotmail.com` (cuenta, rol y referencias en código y en la función de la BD). Admin único `admin@pollacad.com`, sin nada hardcodeado.

### 🔒 Seguridad (no negociable)
- RLS en `concursos` (lectura pública solo de `abierto/cerrado/finalizado`; escritura solo admin vía `has_role`).
- RLS en `inscripciones` (el jugador ve/gestiona las suyas; solo admin cambia `estado_pago`).
- `estado_pago` jamás editable por el jugador (sin escalada de pago).
- Funciones `SECURITY DEFINER` con `search_path=public` y `get_concurso_leaderboard` que solo expone inscritos **aprobados**.
- GRANTs explícitos por tabla. Sin políticas amplias `TO anon` salvo lectura de concursos abiertos.

### 🤝 Amigabilidad (UX)
- Lobby `/concursos` como home tras login: tarjetas con modalidad, cuota, pozo, # jugadores y cuenta regresiva; filtros por modalidad/estado.
- Estados claros por concurso: "Inscrito", "Pago pendiente", "Abierto", "Cerrado".
- Reuso de `/predictions` con el set del concurso; un mismo marcador ya capturado se ve precargado.
- Vacíos/CTA cuando no hay concursos; nada de pantallas en blanco. Responsive a 393px.

### Modalidades
```
Concurso (alcance)
 ├─ Por partido      → 1 partido
 ├─ Día de partidos  → partidos de una fecha (ET)
 ├─ Por fase         → grupos · dieciseisavos · octavos · cuartos · semis · final
 └─ Mundial completo → 104 partidos
```

### Técnico
- `matches`: añadir `fase` (text), poblar las 72 con `grupos`; cargar 32 knockout "Por definir".
- `concursos`: `nombre`, `modalidad`(`partido|dia|fase|mundial`), `alcance`(jsonb), `cuota`(numeric), `estado`(`proximo|abierto|cerrado|finalizado`), `deadline`. GRANTs + RLS.
- `inscripciones`: `concurso_id`, `participant_id`, `estado_pago`, único `(concurso_id, participant_id)`. GRANTs + RLS.
- `predictions`: única por `(participant, match)` (sin cambios).
- Funciones: `get_concurso_matches(id)`, `get_concurso_leaderboard(id)`; `calc_points` intacta.
- Concurso de compatibilidad: "Mundial completo — Fase de grupos" ($20) con los aprobados ya inscritos (cero pérdida de datos actuales).
- Frontend TanStack: `/concursos`, `/concursos/$id`, `/predictions` reusado, sección "Concursos" en `/admin`.

### Fases (5)
1. Migraciones + funciones + RLS + concurso de compatibilidad.
2. Lobby + inscripción/pago por concurso.
3. Pronósticos y tabla filtrados por concurso.
4. Panel organizador: generación automática y gestión.
5. QA seguridad + estética "Elite Sportsbook" en pantallas nuevas (criterio: build limpio, linter sin nuevos errores, responsive 393px).

¿Apruebas esta versión para construirla?