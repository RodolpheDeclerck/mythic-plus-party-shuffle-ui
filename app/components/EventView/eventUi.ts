/**
 * Styles proches d’un export v0 / shadcn (Card, Table, section “generated groups”).
 * Branchés sur les variables `globals.css` (--card, --border, --muted, etc.).
 */

export const v0PageGap = 'space-y-8';

/** Titre page */
export const v0Title = 'text-3xl font-bold tracking-tight text-foreground';

/** Sous-titre / meta */
export const v0Muted = 'text-sm text-muted-foreground';

/** Titres de section */
export const v0SectionTitle = 'text-xl font-semibold tracking-tight text-foreground';

/** Coquille “Generated groups” (dégradé néon) */
export const v0GroupsShell =
  'rounded-2xl bg-gradient-to-br from-cyan-500/30 via-violet-500/25 to-blue-600/30 p-px shadow-xl shadow-cyan-950/40';

export const v0GroupsInner =
  'rounded-2xl bg-card/95 p-4 backdrop-blur-md sm:p-6';

/** Carte perso / bloc générique */
export const v0Card =
  'rounded-xl border border-border bg-card/60 text-card-foreground shadow-sm';

export const v0CardPadding = 'p-4 sm:p-5';

/** Carte rôle (waiting room) */
export const v0RoleCard =
  'overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm';

export const v0RoleCardHeader =
  'flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3';

/** Carte groupe (party) */
export const v0PartyCard =
  'overflow-hidden rounded-xl border border-emerald-500/35 bg-card/80 shadow-sm ring-1 ring-emerald-500/10';

export const v0PartyCardHeader =
  'flex items-center justify-between border-b border-border bg-emerald-500/[0.08] px-4 py-3';

/** Table */
export const v0TableWrap = 'overflow-x-auto -mx-1';

export const v0Th =
  'h-11 border-b border-border px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

export const v0Td = 'border-b border-border/50 px-2 py-2.5 text-center align-middle text-sm';

/** Pending (hors groupes) */
export const v0PendingCard =
  'rounded-xl border border-amber-500/45 bg-amber-500/[0.06] p-4 shadow-sm';
