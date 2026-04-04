/**
 * L’enum PostgreSQL / Nest utilise `Deathknight` ; l’UI WoW affiche souvent `Death Knight`.
 */
const DISPLAY_TO_API: Record<string, string> = {
  'Death Knight': 'Deathknight',
};

const API_TO_DISPLAY: Record<string, string> = {
  Deathknight: 'Death Knight',
};

export function toApiCharacterClass(className: string): string {
  return DISPLAY_TO_API[className] ?? className;
}

export function toDisplayCharacterClass(className: string): string {
  return API_TO_DISPLAY[className] ?? className;
}
