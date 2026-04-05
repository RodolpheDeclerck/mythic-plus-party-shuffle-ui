'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Loading from '../Loading';
import useFetchCharacters from '../../hooks/useFetchCharacters';
import useWebSocket from '../../hooks/useWebSocket';
import {
  fetchCharacters as fetchCharactersApi,
  upsertCharacter,
} from '../../services/api';
import useAuthCheck from '../../hooks/useAuthCheck';
import { useEventData } from '../../hooks/useEventData';
import { useCharacterManagement } from '../../hooks/useCharacterManagement';
import { usePartyManagement } from '../../hooks/usePartyManagement';
import { EventDetailV0 } from './EventDetailV0';
import { ReRegisterEventDialogV0 } from './ReRegisterEventDialogV0';
import { v0Card, v0CardPadding } from './eventUi';
import { cn } from '@/lib/utils';
import type { Character } from '@/types/Character';
import type { Party } from '@/types/Party';

const EventView: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventCode = searchParams.get('code');

  const { isAuthenticated, isAuthChecked } = useAuthCheck();

  const { characters, loading, error, setCharacters } = useFetchCharacters(
    eventCode || '',
  );

  const {
    parties,
    setParties,
    error: partyError,
    fetchParties,
    handleClearEvent,
    updatePartiesInBackend,
    handleShuffle,
  } = usePartyManagement(eventCode || '');

  const {
    arePartiesVisible,
    isVerifying,
    setIsVerifying,
    checkEventExistence,
    fetchEvent,
    togglePartiesVisibility,
    eventInfo,
  } = useEventData(eventCode || '');

  const [errorState, setErrorState] = useState<string | null>(null);
  const [shufflePending, setShufflePending] = useState(false);
  const [reRegisterOpen, setReRegisterOpen] = useState(false);
  const [reRegisterFormKey, setReRegisterFormKey] = useState(0);
  const reRegisterDismissedRef = useRef(false);
  const reRegisterPrevInListRef = useRef<boolean | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (eventCode) {
      try {
        const updatedCharacters = await fetchCharactersApi(eventCode);
        setCharacters(updatedCharacters);
      } catch {
        setErrorState('Failed to fetch characters');
      }
    }
  }, [eventCode, setCharacters]);

  const {
    createdCharacter,
    setCreatedCharacter,
    error: characterError,
    handleDelete,
    handleClear,
  } = useCharacterManagement(eventCode || '', fetchCharacters);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const eventExists = await checkEventExistence();
      if (!eventExists) {
        router.push('/');
      } else {
        const characterData = localStorage.getItem('createdCharacter');
        if (characterData) {
          setCreatedCharacter(JSON.parse(characterData));
        } else if (isAuthChecked && !isAuthenticated) {
          router.push('/event/register?code=' + eventCode);
        }
      }
      setIsVerifying(false);
    };

    void verifyAndRedirect();
  }, [
    eventCode,
    isAuthChecked,
    isAuthenticated,
    router,
    checkEventExistence,
    setCreatedCharacter,
    setIsVerifying,
  ]);

  const fetchPartiesWrapper = useCallback(async () => {
    fetchParties();
  }, [fetchParties]);

  const fetchEventWrapper = useCallback(async () => {
    fetchEvent();
  }, [fetchEvent]);

  useWebSocket(fetchCharacters, fetchPartiesWrapper, fetchEventWrapper);

  useEffect(() => {
    void fetchPartiesWrapper();
  }, [fetchPartiesWrapper]);

  /** Joueur : la liste ne contient plus son perso (ex. admin « Clear list ») → modale de réinscription. */
  useEffect(() => {
    if (loading || !eventCode || !createdCharacter) return;
    const inList = characters.some((c) => c.id === createdCharacter.id);
    if (inList) {
      reRegisterDismissedRef.current = false;
      setReRegisterOpen(false);
      reRegisterPrevInListRef.current = true;
      return;
    }
    if (reRegisterDismissedRef.current) {
      reRegisterPrevInListRef.current = false;
      return;
    }
    const wasInList = reRegisterPrevInListRef.current;
    reRegisterPrevInListRef.current = false;
    setReRegisterOpen(true);
    if (wasInList === true || wasInList === null) {
      setReRegisterFormKey((k) => k + 1);
    }
  }, [loading, eventCode, createdCharacter, characters]);

  const handleShuffleWrapper = useCallback(async () => {
    setShufflePending(true);
    try {
      await handleShuffle(createdCharacter, setCreatedCharacter);
    } finally {
      setShufflePending(false);
    }
  }, [handleShuffle, createdCharacter, setCreatedCharacter]);

  const handlePartiesUpdate = useCallback(
    async (next: Party[]) => {
      setParties(next);
      await updatePartiesInBackend(next);
    },
    [setParties, updatePartiesInBackend],
  );

  const handleSaveParticipantV0 = useCallback(
    async (payload: Character & { eventCode: string }) => {
      await upsertCharacter(payload);
      await fetchCharacters();
    },
    [fetchCharacters],
  );

  const handleViewerLeave = useCallback(async () => {
    const id = createdCharacter?.id;
    if (id != null) {
      await handleDelete(id);
    }
    localStorage.removeItem('createdCharacter');
    setCreatedCharacter(null);
    router.push('/');
  }, [createdCharacter?.id, handleDelete, router, setCreatedCharacter]);

  const handleReRegisterSuccess = useCallback(
    (data: unknown) => {
      localStorage.setItem('createdCharacter', JSON.stringify(data));
      setCreatedCharacter(data);
      setReRegisterOpen(false);
      reRegisterDismissedRef.current = false;
      void fetchCharacters();
    },
    [fetchCharacters, setCreatedCharacter],
  );

  const handleReRegisterCancel = useCallback(() => {
    reRegisterDismissedRef.current = true;
    setReRegisterOpen(false);
    localStorage.removeItem('createdCharacter');
    setCreatedCharacter(null);
    if (eventCode) {
      router.push(
        `/event/register?code=${encodeURIComponent(eventCode)}`,
      );
    }
  }, [eventCode, router, setCreatedCharacter]);

  if (isVerifying || loading || !isAuthChecked) return <Loading />;

  if (error || errorState || characterError || partyError) {
    return (
      <div
        className={cn(
          v0Card,
          v0CardPadding,
          'border-destructive/40 bg-destructive/5 text-destructive',
        )}
        role="alert"
      >
        {error ||
          errorState ||
          characterError ||
          partyError ||
          t('eventPage.loadError')}
      </div>
    );
  }

  const auth = Boolean(isAuthenticated);

  return (
    <div className={cn('mx-auto w-full space-y-8 text-foreground')}>
      {eventCode && eventInfo ? (
        <EventDetailV0
          eventCode={eventCode}
          eventName={eventInfo.name}
          homeHref={auth ? '/dashboard' : '/'}
          isAdmin={auth}
          characters={characters}
          parties={parties}
          arePartiesVisible={arePartiesVisible}
          shufflePending={shufflePending}
          onShuffle={handleShuffleWrapper}
          onClearParties={() => void handleClearEvent()}
          onToggleVisibility={() => void togglePartiesVisibility()}
          onPartiesUpdate={handlePartiesUpdate}
          onClearAllCharacters={() => void handleClear(characters)}
          onSaveParticipant={handleSaveParticipantV0}
          onDeleteParticipant={handleDelete}
          viewerCharacterId={createdCharacter?.id ?? null}
          onViewerLeaveEvent={handleViewerLeave}
        />
      ) : null}

      {reRegisterOpen && eventCode && createdCharacter ? (
        <ReRegisterEventDialogV0
          open
          eventCode={eventCode}
          formInstanceKey={reRegisterFormKey}
          initialCharacter={createdCharacter}
          onRegisterSuccess={handleReRegisterSuccess}
          onCancel={handleReRegisterCancel}
        />
      ) : null}
    </div>
  );
};

export default EventView;
