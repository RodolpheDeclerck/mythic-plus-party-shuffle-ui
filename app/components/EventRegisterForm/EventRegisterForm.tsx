'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useClasses } from '../../context/ClassesContext';
import { useSpecializations } from '../../context/SpecializationsContext';
import apiUrl from '../../config/apiConfig';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../constants/itemLevels';

const NAME_MAX_LENGTH = 12;

const fieldInputClass =
  'h-11 w-full border-purple-500/30 bg-[#0a0614]/80 text-[var(--rift-text)] shadow-none placeholder:text-muted-foreground focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400';

const selectClass =
  'h-11 w-full cursor-pointer rounded-md border border-purple-500/30 bg-[#0a0614]/80 px-3 text-sm text-[var(--rift-text)] shadow-none outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400';

const EventRegisterForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [selectCharacterClass, setSelectCharacterClass] = useState<string>('');
  const [selectSpecialization, setSelectSpecialization] = useState<string>('');
  const [iLevel, setILevel] = useState(ITEM_LEVEL_MIN.toString());
  const [kStoneMin, setKStoneMin] = useState(KEYSTONE_MIN_LEVEL.toString());
  const [kStoneMax, setKStoneMax] = useState(KEYSTONE_MAX_LEVEL.toString());
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

  const eventCode = searchParams.get('code');

  useEffect(() => {
    const storedCharacter = localStorage.getItem('createdCharacter');
    if (storedCharacter && eventCode) {
      router.push('/event?code=' + eventCode);
    }
  }, [router, eventCode]);

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
      router.push('/event?code=' + eventCode);
    } catch {
      setSaveError(t('eventRegister.saveError'));
      setIsSaving(false);
    }
  };

  const showKeystoneSection =
    selectCharacterClass &&
    selectSpecialization &&
    parseInt(iLevel, 10) >= ITEM_LEVEL_MIN;

  if (!eventCode) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm font-medium text-red-400">
          {t('eventRegister.missingCodeTitle')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('eventRegister.missingCodeBody')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('eventRegister.backHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {saveError ? (
        <div
          role="alert"
          className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {saveError}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="event-reg-name"
          className="text-sm font-medium text-[var(--rift-text)]"
        >
          {t('eventRegister.nameLabel')}
        </label>
        <Input
          id="event-reg-name"
          value={name}
          onChange={handleNameChange}
          placeholder={t('eventRegister.namePlaceholder')}
          maxLength={NAME_MAX_LENGTH}
          disabled={isSaving}
          className={fieldInputClass}
        />
      </div>

      {name.length > 0 ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="event-reg-class"
            className="text-sm font-medium text-[var(--rift-text)]"
          >
            {t('eventRegister.classLabel')}
          </label>
          <select
            id="event-reg-class"
            value={selectCharacterClass}
            onChange={(e) => handleClassChange(e.target.value)}
            disabled={isSaving}
            className={selectClass}
          >
            <option value="">{t('eventRegister.classPlaceholder')}</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {specializations.length > 0 ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="event-reg-spec"
            className="text-sm font-medium text-[var(--rift-text)]"
          >
            {t('eventRegister.specLabel')}
          </label>
          <select
            id="event-reg-spec"
            value={selectSpecialization}
            onChange={(e) => handleSpecializationChange(e.target.value)}
            disabled={isSaving}
            className={selectClass}
          >
            <option value="">{t('eventRegister.specPlaceholder')}</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {t(`specializations.${spec}`)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {selectCharacterClass && selectSpecialization ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="event-reg-ilvl"
            className="text-sm font-medium text-[var(--rift-text)]"
          >
            {t('eventRegister.ilvlLabel')}
          </label>
          <Input
            id="event-reg-ilvl"
            type="number"
            value={iLevel}
            onChange={handleILevelChange}
            onBlur={handleILevelBlur}
            onFocus={handleILevelFocus}
            placeholder={t('eventRegister.ilvlPlaceholder')}
            min={ITEM_LEVEL_MIN}
            max={ITEM_LEVEL_MAX}
            disabled={isSaving}
            className={fieldInputClass}
          />
        </div>
      ) : null}

      {showKeystoneSection ? (
        <div className="flex flex-col gap-4 border-t border-purple-500/20 pt-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="event-reg-key-min"
              className="text-sm font-medium text-[var(--rift-text)]"
            >
              {t('eventRegister.keyMinLabel')}
            </label>
            <Input
              id="event-reg-key-min"
              type="number"
              value={kStoneMin}
              onChange={handleKeystoneMinChange}
              onBlur={handleKeystoneMinBlur}
              onFocus={handleKeystoneMinFocus}
              min={KEYSTONE_MIN_LEVEL}
              max={parseInt(kStoneMax, 10) || KEYSTONE_MAX_LEVEL}
              placeholder={t('eventRegister.keyMinPlaceholder')}
              disabled={isSaving}
              className={fieldInputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="event-reg-key-max"
              className="text-sm font-medium text-[var(--rift-text)]"
            >
              {t('eventRegister.keyMaxLabel')}
            </label>
            <Input
              id="event-reg-key-max"
              type="number"
              value={kStoneMax}
              onChange={handleKeystoneMaxChange}
              onBlur={handleKeystoneMaxBlur}
              onFocus={handleKeystoneMaxFocus}
              min={parseInt(kStoneMin, 10) || KEYSTONE_MIN_LEVEL}
              max={KEYSTONE_MAX_LEVEL}
              placeholder={t('eventRegister.keyMaxPlaceholder')}
              disabled={isSaving}
              className={fieldInputClass}
            />
          </div>

          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="h-12 w-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 text-white" />
                {t('eventRegister.joining')}
              </span>
            ) : (
              t('eventRegister.joinEvent')
            )}
          </Button>
        </div>
      ) : null}

      <div className="border-t border-purple-500/20 pt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-cyan-400 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0614]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('eventRegister.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default EventRegisterForm;
