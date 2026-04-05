'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character } from '@/types/Character';
import type { Party } from '@/types/Party';
import {
  type EventParticipant,
  characterToEventParticipant,
  eventParticipantToCharacterForUpsert,
} from './eventPartyModel';
import { wowClassTextColors } from './eventClassColors';
import { EditParticipantDialog } from './EditParticipantDialog';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { useSyncedPartyGroups } from './event-detail/useSyncedPartyGroups';
import { usePartyDragDrop } from './event-detail/usePartyDragDrop';
import { assignedParticipantIds } from './event-detail/partyGroupUtils';
import { EventDetailHeader } from './event-detail/EventDetailHeader';
import { AdminPartyGrid } from './event-detail/AdminPartyGrid';
import {
  PlayerHiddenGroupsBanner,
  PlayerVisiblePartySections,
} from './event-detail/PlayerPartySections';
import { RoleRosterGrid } from './event-detail/RoleRosterGrid';
import { LeaveEventDialog } from './event-detail/LeaveEventDialog';
import { buildEventDetailRoleCategories } from './event-detail/eventDetailRoleCategories';

export type EventDetailProps = {
  eventCode: string;
  eventName: string;
  eventCreatedAt?: string;
  homeHref: string;
  isAdmin: boolean;
  characters: Character[];
  parties: Party[];
  arePartiesVisible: boolean;
  shufflePending: boolean;
  onShuffle: () => void | Promise<void>;
  onClearParties: () => void | Promise<void>;
  onToggleVisibility: () => void | Promise<void>;
  onPartiesUpdate: (parties: Party[]) => void | Promise<void>;
  onClearAllCharacters: () => void | Promise<void>;
  onSaveParticipant: (c: Character & { eventCode: string }) => Promise<void>;
  onDeleteParticipant: (id: number) => Promise<void>;
  viewerCharacterId?: number | null;
  onViewerLeaveEvent?: () => void | Promise<void>;
};

export function EventDetail({
  eventCode,
  eventName,
  eventCreatedAt,
  homeHref,
  isAdmin,
  characters,
  parties,
  arePartiesVisible,
  shufflePending,
  onShuffle,
  onClearParties,
  onToggleVisibility,
  onPartiesUpdate,
  onClearAllCharacters,
  onSaveParticipant,
  onDeleteParticipant,
  viewerCharacterId = null,
  onViewerLeaveEvent,
}: EventDetailProps) {
  const { t } = useTranslation();
  const tEv = (key: string) => t(`eventDetail.${key}`);

  const specLabel = useCallback(
    (c: Character) => t(`specializations.${c.specialization}`),
    [t],
  );

  const participants = useMemo(
    () => characters.map((c) => characterToEventParticipant(c, specLabel(c))),
    [characters, specLabel],
  );

  const { shuffledGroups, setShuffledGroups } = useSyncedPartyGroups({
    parties,
    characters,
    isAdmin,
    specLabel,
    onPartiesUpdate,
  });

  const groupsToRender = useMemo(() => {
    if (isAdmin) return shuffledGroups;
    if (!arePartiesVisible) return shuffledGroups;
    if (viewerCharacterId == null) return [];
    return shuffledGroups.filter((g) => {
      const sid = String(viewerCharacterId);
      return (
        g.tank?.id === sid ||
        g.healer?.id === sid ||
        g.dps.some((d) => d.id === sid)
      );
    });
  }, [isAdmin, arePartiesVisible, shuffledGroups, viewerCharacterId]);

  const drag = usePartyDragDrop(setShuffledGroups, participants);

  const [codeCopied, setCodeCopied] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<EventParticipant | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'edit' | 'add'>('edit');
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [clearParticipantsOpen, setClearParticipantsOpen] = useState(false);
  const [clearGroupsOpen, setClearGroupsOpen] = useState(false);

  const handleShuffle = () => {
    void onShuffle();
  };

  const copyCode = () => {
    void navigator.clipboard.writeText(eventCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleEditParticipant = (participant: EventParticipant) => {
    setEditingParticipant(participant);
    setDialogMode('edit');
    setEditDialogOpen(true);
  };

  const handleAddParticipant = () => {
    setEditingParticipant(null);
    setDialogMode('add');
    setEditDialogOpen(true);
  };

  const handleSaveParticipant = async (
    updatedParticipant: EventParticipant,
  ) => {
    await onSaveParticipant(
      eventParticipantToCharacterForUpsert(updatedParticipant, eventCode),
    );
  };

  const handleDeleteParticipantFromDialog = async (participantId: string) => {
    const id = Number.parseInt(participantId, 10);
    if (!Number.isFinite(id)) return;
    await onDeleteParticipant(id);
  };

  const roleCategories = useMemo(
    () =>
      buildEventDetailRoleCategories(
        (key) => t(`eventDetail.${key}`),
        participants,
      ),
    [t, participants],
  );

  const viewerSid =
    viewerCharacterId != null ? String(viewerCharacterId) : null;

  const viewerParticipant = useMemo(() => {
    if (viewerSid == null) return null;
    return participants.find((p) => p.id === viewerSid) ?? null;
  }, [participants, viewerSid]);

  const assignedIds = useMemo(
    () => assignedParticipantIds(shuffledGroups),
    [shuffledGroups],
  );

  const unassignedParticipants = useMemo(() => {
    if (shuffledGroups.length === 0) return [];
    return participants.filter((p) => !assignedIds.has(p.id));
  }, [participants, shuffledGroups.length, assignedIds]);

  return (
    <div className="w-full space-y-8">
      <EventDetailHeader
        isAdmin={isAdmin}
        homeHref={homeHref}
        eventName={eventName}
        eventCode={eventCode}
        eventCreatedAt={eventCreatedAt}
        participantsCount={participants.length}
        codeCopied={codeCopied}
        onCopyCode={copyCode}
        shufflePending={shufflePending}
        onAddParticipant={handleAddParticipant}
        onClearParticipantsOpen={() => setClearParticipantsOpen(true)}
        onShuffle={handleShuffle}
        viewerParticipant={viewerParticipant}
        onEditParticipant={handleEditParticipant}
        onLeaveOpen={() => setLeaveConfirmOpen(true)}
        tEv={tEv}
      />

      <PlayerHiddenGroupsBanner
        tEv={tEv}
        isAdmin={isAdmin}
        shuffledGroups={shuffledGroups}
        arePartiesVisible={arePartiesVisible}
      />

      {isAdmin && shuffledGroups.length > 0 ? (
        <AdminPartyGrid
          tEv={tEv}
          shuffledGroups={shuffledGroups}
          groupsToRender={groupsToRender}
          arePartiesVisible={arePartiesVisible}
          unassignedParticipants={unassignedParticipants}
          onToggleVisibility={onToggleVisibility}
          onClearGroupsOpen={() => setClearGroupsOpen(true)}
          onShuffle={handleShuffle}
          drag={drag}
        />
      ) : null}

      <PlayerVisiblePartySections
        tEv={tEv}
        isAdmin={isAdmin}
        shuffledGroups={shuffledGroups}
        groupsToRender={groupsToRender}
        arePartiesVisible={arePartiesVisible}
        viewerCharacterId={viewerCharacterId}
        viewerSid={viewerSid}
        classColors={wowClassTextColors}
      />

      <RoleRosterGrid
        tEv={tEv}
        isAdmin={isAdmin}
        participantsCount={participants.length}
        roleCategories={roleCategories}
        classColors={wowClassTextColors}
        viewerSid={viewerSid}
        onEditParticipant={handleEditParticipant}
        onDeleteParticipant={(id) => void handleDeleteParticipantFromDialog(id)}
      />

      <ClearConfirmDialog
        open={clearParticipantsOpen}
        onOpenChange={setClearParticipantsOpen}
        type="participants"
        onConfirm={() => void onClearAllCharacters()}
      />
      <ClearConfirmDialog
        open={clearGroupsOpen}
        onOpenChange={setClearGroupsOpen}
        type="groups"
        onConfirm={() => void onClearParties()}
      />

      <EditParticipantDialog
        participant={editingParticipant}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={(p) => void handleSaveParticipant(p)}
        onDelete={(id) => void handleDeleteParticipantFromDialog(id)}
        mode={dialogMode}
      />

      <LeaveEventDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        onConfirmLeave={() => void onViewerLeaveEvent?.()}
      />
    </div>
  );
}
