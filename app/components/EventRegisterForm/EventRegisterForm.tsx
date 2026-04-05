'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Character } from '@/types/Character';
import { useClasses } from '../../context/ClassesContext';
import { useSpecializations } from '../../context/SpecializationsContext';
import apiUrl from '../../config/apiConfig';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../constants/itemLevels';
import { v0ClassColors } from '../EventView/v0ClassColors';
import { BloodlustIcon, BattleRezIcon } from '../EventView/wow-icons';
import { v0RoleFromApiSpecialization } from '../../utils/v0SpecRolePreview';

const NAME_MAX_LENGTH = 12;

const bloodlustClasses = ['Shaman', 'Mage', 'Hunter', 'Evoker'];
const battleRezClasses = ['Death Knight', 'Druid', 'Warlock', 'Paladin'];

const inputV0Class =
  'h-11 border-purple-500/30 bg-purple-900/20 text-foreground placeholder:text-muted-foreground/50 shadow-none focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400';

/** Liste native : fond sombre + color-scheme pour éviter liste blanche (Windows / Chrome). */
const selectV0Class =
  'event-register-select h-11 w-full cursor-pointer rounded-md border border-purple-500/30 bg-[#1a0a2e] px-3 text-sm text-zinc-100 shadow-none outline-none [color-scheme:dark] focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60';

export type EventRegisterFormProps = {
  variant?: 'page' | 'embedded';
  /** Sur la page événement (modale), le code ne vient pas du query string */
  eventCodeOverride?: string | null;
  formIdPrefix?: string;
  initialCharacter?: Character | null;
  onRegisterSuccess?: (data: unknown) => void;
  onCancel?: () => void;
  hideSignInLink?: boolean;
};

const EventRegisterForm: React.FC<EventRegisterFormProps> = ({
  variant = 'page',
  eventCodeOverride = null,
  formIdPrefix = 'event-reg',
  initialCharacter = null,
  onRegisterSuccess,
  onCancel,
  hideSignInLink = false,
}) => {
  const [name, setName] = useState(() => initialCharacter?.name ?? '');
  const [selectCharacterClass, setSelectCharacterClass] = useState(
    () => initialCharacter?.characterClass ?? '',
  );
  const [selectSpecialization, setSelectSpecialization] = useState(
    () => initialCharacter?.specialization ?? '',
  );
  const [iLevel, setILevel] = useState(() =>
    String(initialCharacter?.iLevel ?? ITEM_LEVEL_MIN),
  );
  const [kStoneMin, setKStoneMin] = useState(() =>
    String(initialCharacter?.keystoneMinLevel ?? KEYSTONE_MIN_LEVEL),
  );
  const [kStoneMax, setKStoneMax] = useState(() =>
    String(initialCharacter?.keystoneMaxLevel ?? 15),
  );
  const [isFirstInputAfterFocus, setIsFirstInputAfterFocus] = useState(false);
  const [isFirstInputAfterFocusKeyMin, setIsFirstInputAfterFocusKeyMin] =
    useState(false);
  const [isFirstInputAfterFocusKeyMax, setIsFirstInputAfterFocusKeyMax] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const { classes } = useClasses();
  const { specializations, fetchSpecializations } = useSpecializations();

  const eventCode = eventCodeOverride ?? searchParams.get('code');

  const previewRole = useMemo(() => {
    if (!selectCharacterClass || !selectSpecialization) return null;
    return v0RoleFromApiSpecialization(
      selectCharacterClass,
      selectSpecialization,
    );
  }, [selectCharacterClass, selectSpecialization]);

  const hasBloodlust =
    !!selectCharacterClass && bloodlustClasses.includes(selectCharacterClass);
  const hasBattleRez =
    !!selectCharacterClass && battleRezClasses.includes(selectCharacterClass);

  useEffect(() => {
    if (variant !== 'page') return;
    const storedCharacter = localStorage.getItem('createdCharacter');
    if (storedCharacter && eventCode) {
      router.push('/event?code=' + eventCode);
    }
  }, [router, eventCode, variant]);

  useEffect(() => {
    if (!selectCharacterClass) return;
    fetchSpecializations(selectCharacterClass);
  }, [selectCharacterClass, fetchSpecializations]);

  const handleClassChange = (selectedClass: string) => {
    setSelectCharacterClass(selectedClass);
    setSelectSpecialization('');
    fetchSpecializations(selectedClass);
  };

  const handleSpecializationChange = (selectedSpecialization: string) => {
    setSelectSpecialization(selectedSpecialization);
  };

  const handleILevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    if (isFirstInputAfterFocus) {
      setIsFirstInputAfterFocus(false);
      const lastChar = inputValue.slice(-1);
      setILevel(lastChar);
      return;
    }

    if (inputValue.length > 3) {
      const lastChar = inputValue.slice(-1);
      setILevel(lastChar);
      return;
    }

    setILevel(inputValue);
  };

  const handleILevelBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setILevel(ITEM_LEVEL_MIN.toString());
      return;
    }

    const numValue = parseInt(inputValue, 10);
    if (!Number.isNaN(numValue)) {
      const value = Math.max(
        ITEM_LEVEL_MIN,
        Math.min(numValue, ITEM_LEVEL_MAX),
      );
      setILevel(value.toString());
    } else {
      setILevel(ITEM_LEVEL_MIN.toString());
    }
  };

  const handleILevelFocus = () => {
    setIsFirstInputAfterFocus(true);
  };

  const handleKeystoneMinChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = event.target.value;

    if (isFirstInputAfterFocusKeyMin) {
      setIsFirstInputAfterFocusKeyMin(false);
      const lastChar = inputValue.slice(-1);
      setKStoneMin(lastChar);
      return;
    }

    if (inputValue.length > 2) {
      const lastChar = inputValue.slice(-1);
      setKStoneMin(lastChar);
      return;
    }

    setKStoneMin(inputValue);
  };

  const handleKeystoneMaxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = event.target.value;

    if (isFirstInputAfterFocusKeyMax) {
      setIsFirstInputAfterFocusKeyMax(false);
      const lastChar = inputValue.slice(-1);
      setKStoneMax(lastChar);
      return;
    }

    if (inputValue.length > 2) {
      const lastChar = inputValue.slice(-1);
      setKStoneMax(lastChar);
      return;
    }

    setKStoneMax(inputValue);
  };

  const handleKeystoneMinFocus = () => {
    setIsFirstInputAfterFocusKeyMin(true);
  };

  const handleKeystoneMaxFocus = () => {
    setIsFirstInputAfterFocusKeyMax(true);
  };

  const handleKeystoneMinBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setKStoneMin(KEYSTONE_MIN_LEVEL.toString());
      return;
    }

    const numValue = parseInt(inputValue, 10);
    if (!Number.isNaN(numValue)) {
      const max = parseInt(kStoneMax, 10) || KEYSTONE_MAX_LEVEL;
      const value = Math.max(
        KEYSTONE_MIN_LEVEL,
        Math.min(numValue, max),
      );
      setKStoneMin(value.toString());
    } else {
      setKStoneMin(KEYSTONE_MIN_LEVEL.toString());
    }
  };

  const handleKeystoneMaxBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setKStoneMax(KEYSTONE_MAX_LEVEL.toString());
      return;
    }

    const numValue = parseInt(inputValue, 10);
    if (!Number.isNaN(numValue)) {
      const min = parseInt(kStoneMin, 10) || KEYSTONE_MIN_LEVEL;
      const value = Math.max(min, Math.min(numValue, KEYSTONE_MAX_LEVEL));
      setKStoneMax(value.toString());
    } else {
      setKStoneMax(KEYSTONE_MAX_LEVEL.toString());
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue.length <= NAME_MAX_LENGTH) {
      setName(inputValue);
    }
  };

  const handleSave = async () => {
    if (!eventCode) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const characterData = {
        name,
        characterClass: selectCharacterClass,
        specialization: selectSpecialization,
        iLevel: Math.max(
          ITEM_LEVEL_MIN,
          Math.min(parseInt(iLevel, 10) || ITEM_LEVEL_MIN, ITEM_LEVEL_MAX),
        ),
        eventCode,
        keystoneMinLevel: Math.max(
          KEYSTONE_MIN_LEVEL,
          parseInt(kStoneMin, 10) || KEYSTONE_MIN_LEVEL,
        ),
        keystoneMaxLevel: Math.min(
          KEYSTONE_MAX_LEVEL,
          Math.max(
            parseInt(kStoneMin, 10) || KEYSTONE_MIN_LEVEL,
            parseInt(kStoneMax, 10) || KEYSTONE_MAX_LEVEL,
          ),
        ),
      };

      const response = await axios.post(
        `${apiUrl}/api/characters`,
        characterData,
      );
      localStorage.setItem('createdCharacter', JSON.stringify(response.data));
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
        setIsSaving(false);
        return;
      }
      router.push('/event?code=' + eventCode);
    } catch {
      setSaveError(t('eventRegister.saveError'));
      setIsSaving(false);
    }
  };

  const canSubmit =
    !!eventCode &&
    name.trim().length > 0 &&
    !!selectCharacterClass &&
    !!selectSpecialization;

  const fid = (suffix: string) => `${formIdPrefix}-${suffix}`;

  if (!eventCode) {
    if (variant === 'embedded') return null;
    return (
      <div className="flex flex-col gap-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
        >
          {t('eventRegister.backHome')}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) void handleSave();
      }}
    >
      {saveError ? (
        <div
          role="alert"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {saveError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={fid('name')} className="text-sm text-muted-foreground">
          {t('eventRegister.nameLabel')}
        </label>
        <Input
          id={fid('name')}
          value={name}
          onChange={handleNameChange}
          placeholder={t('eventRegister.namePlaceholder')}
          maxLength={NAME_MAX_LENGTH}
          disabled={isSaving}
          className={inputV0Class}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor={fid('class')} className="text-sm text-muted-foreground">
            {t('eventRegister.classLabel')}
          </label>
          <select
            id={fid('class')}
            value={selectCharacterClass}
            onChange={(e) => handleClassChange(e.target.value)}
            disabled={isSaving}
            className={cn(
              selectV0Class,
              selectCharacterClass
                ? v0ClassColors[selectCharacterClass] ?? 'text-zinc-100'
                : 'text-zinc-100',
            )}
          >
            <option value="" className="text-zinc-400">
              {t('eventRegister.classPlaceholder')}
            </option>
            {classes.map((cls) => (
              <option
                key={cls}
                value={cls}
                className={v0ClassColors[cls] ?? 'text-zinc-100'}
              >
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor={fid('spec')} className="text-sm text-muted-foreground">
            {t('eventRegister.specLabel')}
          </label>
          <select
            id={fid('spec')}
            value={selectCharacterClass ? selectSpecialization : ''}
            onChange={(e) => handleSpecializationChange(e.target.value)}
            disabled={isSaving || !selectCharacterClass}
            className={cn(
              selectV0Class,
              !selectCharacterClass && 'cursor-not-allowed',
            )}
          >
            <option value="">
              {selectCharacterClass
                ? t('eventRegister.specPlaceholder')
                : t('eventRegister.specNeedClass')}
            </option>
            {selectCharacterClass
              ? specializations.map((spec) => (
                  <option
                    key={spec}
                    value={spec}
                    className="text-zinc-100"
                  >
                    {t(`specializations.${spec}`)}
                  </option>
                ))
              : null}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={fid('ilvl')} className="text-sm text-muted-foreground">
          {t('eventRegister.ilvlLabel')}
        </label>
        <Input
          id={fid('ilvl')}
          type="number"
          value={iLevel}
          onChange={handleILevelChange}
          onBlur={handleILevelBlur}
          onFocus={handleILevelFocus}
          placeholder={t('eventRegister.ilvlPlaceholder')}
          min={ITEM_LEVEL_MIN}
          max={ITEM_LEVEL_MAX}
          disabled={isSaving}
          className={inputV0Class}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor={fid('key-min')}
            className="text-sm text-muted-foreground"
          >
            {t('eventRegister.keyMinLabel')}
          </label>
          <Input
            id={fid('key-min')}
            type="number"
            value={kStoneMin}
            onChange={handleKeystoneMinChange}
            onBlur={handleKeystoneMinBlur}
            onFocus={handleKeystoneMinFocus}
            min={KEYSTONE_MIN_LEVEL}
            max={parseInt(kStoneMax, 10) || KEYSTONE_MAX_LEVEL}
            placeholder={t('eventRegister.keyMinPlaceholder')}
            disabled={isSaving}
            className={inputV0Class}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={fid('key-max')}
            className="text-sm text-muted-foreground"
          >
            {t('eventRegister.keyMaxLabel')}
          </label>
          <Input
            id={fid('key-max')}
            type="number"
            value={kStoneMax}
            onChange={handleKeystoneMaxChange}
            onBlur={handleKeystoneMaxBlur}
            onFocus={handleKeystoneMaxFocus}
            min={parseInt(kStoneMin, 10) || KEYSTONE_MIN_LEVEL}
            max={KEYSTONE_MAX_LEVEL}
            placeholder={t('eventRegister.keyMaxPlaceholder')}
            disabled={isSaving}
            className={inputV0Class}
          />
        </div>
      </div>

      {selectCharacterClass && selectSpecialization ? (
        <div className="rounded-lg border border-purple-500/20 bg-purple-900/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">
                {t('eventRegister.roleLabel')}
              </p>
              {previewRole ? (
                <p className="font-medium capitalize text-foreground">
                  {t(`eventV0.roles.${previewRole}`)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <BloodlustIcon
                  className={`h-6 w-6 ${hasBloodlust ? 'text-orange-400' : 'text-muted-foreground/30'}`}
                />
                <span className="text-xs text-muted-foreground">
                  {hasBloodlust ? t('eventRegister.yes') : t('eventRegister.no')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <BattleRezIcon
                  className={`h-6 w-6 ${hasBattleRez ? 'text-green-400' : 'text-muted-foreground/30'}`}
                />
                <span className="text-xs text-muted-foreground">
                  {hasBattleRez ? t('eventRegister.yes') : t('eventRegister.no')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row',
          onCancel ? 'sm:items-stretch' : '',
        )}
      >
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onCancel()}
            className="border-purple-500/40 text-muted-foreground hover:bg-purple-500/10 sm:flex-initial"
          >
            {t('eventRegister.later')}
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={!canSubmit || isSaving}
          className={cn(
            'h-12 border border-cyan-400/50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50',
            onCancel ? 'sm:flex-1' : 'w-full',
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('eventRegister.joining')}
            </>
          ) : (
            t('eventRegister.joinEvent')
          )}
        </Button>
      </div>

      {!hideSignInLink ? (
        <p className="mt-4 text-center text-sm text-gray-400">
          {t('eventRegister.signInPrompt')}{' '}
          <Link
            href="/login"
            className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            {t('eventRegister.signInLink')}
          </Link>
        </p>
      ) : null}
    </form>
  );
};

export default EventRegisterForm;
