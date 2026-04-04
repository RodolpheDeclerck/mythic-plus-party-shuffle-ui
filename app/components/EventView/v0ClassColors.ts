/**
 * Couleurs de classe WoW (RAID_CLASS_COLORS / ChrClasses.db2).
 * @see https://warcraft.wiki.gg/wiki/Class_colors
 *
 * L’API utilise `Deathknight` ; l’UI v0 utilise `Death Knight` — les deux sont présentes.
 */
export const v0ClassColors: Record<string, string> = {
  Warrior: 'text-[#C69B6D]',
  Deathknight: 'text-[#C41E3A]',
  'Death Knight': 'text-[#C41E3A]',
  'Demon Hunter': 'text-[#A330C9]',
  Druid: 'text-[#FF7C0A]',
  Evoker: 'text-[#33937F]',
  Hunter: 'text-[#AAD372]',
  Mage: 'text-[#3FC7EB]',
  Monk: 'text-[#00FF98]',
  Paladin: 'text-[#F48CBA]',
  Priest: 'text-[#FFFFFF]',
  Rogue: 'text-[#FFF468]',
  Shaman: 'text-[#0070DD]',
  Warlock: 'text-[#8788EE]',
}

export function v0ClassNameColor(characterClass: string): string {
  return v0ClassColors[characterClass] ?? 'text-foreground'
}
