import type { Character } from '@/types/Character';
import type { Party } from '@/types/Party';
import {
  toApiCharacterClass,
  toDisplayCharacterClass,
} from '@/utils/characterClassApiMap';
import { resolveSpecializationKey } from './wowClassSpecKeys';

export interface ParticipantV0 {
  id: string;
  name: string;
  class: string;
  spec: string;
  role: 'tank' | 'healer' | 'meleeDps' | 'rangedDps';
  ilvl: number;
  hasBloodlust: boolean;
  hasBattleRez: boolean;
  keyMin: number;
  keyMax: number;
}

export interface PartyGroupV0 {
  id: string;
  tank: ParticipantV0 | null;
  healer: ParticipantV0 | null;
  dps: ParticipantV0[];
}

export function characterRoleToV0(role: string): ParticipantV0['role'] {
  if (role === 'TANK') return 'tank';
  if (role === 'HEAL') return 'healer';
  if (role === 'DIST') return 'rangedDps';
  return 'meleeDps';
}

export function v0RoleToCharacterRole(r: ParticipantV0['role']): string {
  if (r === 'tank') return 'TANK';
  if (r === 'healer') return 'HEAL';
  if (r === 'rangedDps') return 'DIST';
  return 'CAC';
}

export function characterToParticipantV0(
  c: Character,
  specLabel: string,
): ParticipantV0 {
  return {
    id: String(c.id),
    name: c.name,
    class: toDisplayCharacterClass(c.characterClass),
    spec: specLabel,
    role: characterRoleToV0(c.role),
    ilvl: c.iLevel,
    hasBloodlust: c.bloodLust,
    hasBattleRez: c.battleRez,
    keyMin: c.keystoneMinLevel,
    keyMax: c.keystoneMaxLevel,
  };
}

/** New participant from dialog (numeric id may be 0 until upsert returns). */
export function participantToCharacterForUpsert(
  p: ParticipantV0,
  eventCode: string,
): Character & { eventCode: string } {
  const idNum = Number.parseInt(p.id, 10);
  const specialization = resolveSpecializationKey(p.class, p.spec);
  return {
    id: Number.isFinite(idNum) && idNum > 0 ? idNum : 0,
    name: p.name,
    characterClass: toApiCharacterClass(p.class),
    specialization,
    iLevel: p.ilvl,
    role: v0RoleToCharacterRole(p.role),
    bloodLust: p.hasBloodlust,
    battleRez: p.hasBattleRez,
    keystoneMinLevel: p.keyMin,
    keystoneMaxLevel: p.keyMax,
    eventCode,
  };
}

function charToSlotParticipant(c: Character, specLabel: string): ParticipantV0 {
  return {
    id: String(c.id),
    name: c.name,
    class: toDisplayCharacterClass(c.characterClass),
    spec: specLabel,
    role: characterRoleToV0(c.role),
    ilvl: c.iLevel,
    hasBloodlust: c.bloodLust,
    hasBattleRez: c.battleRez,
    keyMin: c.keystoneMinLevel,
    keyMax: c.keystoneMaxLevel,
  };
}

export function partyToGroupV0(
  party: Party,
  index: number,
  specLabel: (c: Character) => string,
): PartyGroupV0 {
  const members = [...party.members];
  const tankChar = members.find((m) => m.role === 'TANK');
  const healChar = members.find((m) => m.role === 'HEAL');
  const taken = new Set(
    [tankChar?.id, healChar?.id].filter((x): x is number => x != null),
  );
  const rest = members.filter((m) => !taken.has(m.id));
  return {
    id: `group-${index}`,
    tank: tankChar ? charToSlotParticipant(tankChar, specLabel(tankChar)) : null,
    healer: healChar ? charToSlotParticipant(healChar, specLabel(healChar)) : null,
    dps: rest.map((m) => charToSlotParticipant(m, specLabel(m))),
  };
}

export function partiesToPartyGroupsV0(
  parties: Party[],
  specLabel: (c: Character) => string,
): PartyGroupV0[] {
  return parties.map((p, i) => partyToGroupV0(p, i, specLabel));
}

/** Persist groups using server character rows (spec/role) + composition from v0 UI. */
export function partyGroupsV0ToParties(
  groups: PartyGroupV0[],
  characters: Character[],
): Party[] {
  const byId = new Map(characters.map((c) => [String(c.id), c]));
  return groups.map((g) => {
    const members: Character[] = [];
    const add = (p: ParticipantV0 | null) => {
      if (!p) return;
      const existing = byId.get(p.id);
      if (existing) {
        members.push({ ...existing });
        return;
      }
      const idNum = Number.parseInt(p.id, 10);
      if (Number.isFinite(idNum) && idNum > 0) return;
      members.push({
        id: 0,
        name: p.name,
        characterClass: toApiCharacterClass(p.class),
        specialization: resolveSpecializationKey(p.class, p.spec),
        iLevel: p.ilvl,
        role: v0RoleToCharacterRole(p.role),
        bloodLust: p.hasBloodlust,
        battleRez: p.hasBattleRez,
        keystoneMinLevel: p.keyMin,
        keystoneMaxLevel: p.keyMax,
      });
    };
    add(g.tank);
    add(g.healer);
    g.dps.forEach((d) => add(d));
    return { members };
  });
}
