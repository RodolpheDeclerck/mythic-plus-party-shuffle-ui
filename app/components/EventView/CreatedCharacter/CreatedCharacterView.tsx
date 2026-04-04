'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../SelectField';
import { useSpecializations } from '../../../context/SpecializationsContext';
import { useClasses } from '../../../context/ClassesContext';
import { useRouter } from 'next/navigation';
import InputField from '../../InputFieldProps';
import { KEYSTONE_MIN_LEVEL, KEYSTONE_MAX_LEVEL } from '../../../constants/keystoneLevels';
import { ITEM_LEVEL_MIN, ITEM_LEVEL_MAX } from '../../../constants/itemLevels';
import { useCharacterForm } from '../../../hooks/useCharacterForm';
import { useCharacterActions } from '../../../hooks/useCharacterActions';
import CharacterFormField from './CharacterFormField/CharacterFormField';
import ValidatedNumberInput from './ValidatedNumberInput/ValidatedNumberInput';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './CreatedCharacterView.css';

const NAME_MAX_LENGTH = 12;

interface CreatedCharacterProps {
  character: unknown;
  onSave: (updatedCharacter: unknown) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  eventCode: string;
}

const CreatedCharacterView: React.FC<CreatedCharacterProps> = ({
  character,
  onSave,
  onDelete,
  isAdmin,
  isEditing,
  setIsEditing,
  eventCode,
}) => {
  const { t } = useTranslation();
  const { specializations, fetchSpecializations } = useSpecializations();
  const { classes } = useClasses();
  const router = useRouter();

  const formState = useCharacterForm(character, isEditing, fetchSpecializations);
  const actions = useCharacterActions(eventCode, onSave, onDelete, router);

  const handleSave = async () => {
    const formValues = formState.getFormValues();
    await actions.handleSave(formValues, character, isAdmin, setIsEditing);
  };

  const handleLeave = async () => {
    await actions.handleLeave(character);
  };

  const handleAdd = () => {
    actions.handleAdd(setIsEditing);
  };

  const handleCancel = () => {
    actions.handleCancel(setIsEditing);
  };

  const c = character as {
    id?: number;
    name?: string;
    characterClass?: string;
    specialization?: string;
    iLevel?: number;
    keystoneMinLevel?: number;
    keystoneMaxLevel?: number;
  } | null;

  return (
    <div
      data-created-character
      className={cn(
        'flex flex-wrap items-center gap-3',
        isEditing && 'items-start',
      )}
    >
      <CharacterFormField
        label={t('eventPage.colName')}
        value={c?.name || '—'}
        isEditing={isEditing}
      >
        {isEditing && (
          <InputField
            label=""
            type="text"
            value={formState.editedName}
            onChange={formState.handleNameChange}
            placeholder="…"
            maxLength={NAME_MAX_LENGTH}
          />
        )}
      </CharacterFormField>

      <CharacterFormField
        label={t('eventPage.colClass')}
        value={c?.characterClass || '—'}
        isEditing={isEditing}
      >
        {isEditing && (
          <SelectField
            label=""
            options={classes.map((cls) => ({
              value: cls,
              label: `${cls}`,
            }))}
            value={formState.selectCharacterClass}
            onChange={formState.handleClassChange}
            placeholder="…"
          />
        )}
      </CharacterFormField>

      <CharacterFormField
        label={t('eventPage.colSpec')}
        value={
          c?.specialization
            ? t(`specializations.${c.specialization}`)
            : '—'
        }
        isEditing={isEditing}
      >
        {isEditing && (
          <SelectField
            label=""
            options={specializations.map((spec) => ({
              value: spec,
              label: t(`specializations.${spec}`),
            }))}
            value={formState.selectSpecialization}
            onChange={formState.handleSpecializationChange}
            placeholder="…"
          />
        )}
      </CharacterFormField>

      <CharacterFormField
        label={t('eventPage.itemLevelShort')}
        value={c?.iLevel !== undefined ? c.iLevel : ITEM_LEVEL_MIN}
        isEditing={isEditing}
      >
        {isEditing && (
          <ValidatedNumberInput
            value={formState.iLevelInput.value}
            onChange={formState.iLevelInput.handleChange}
            onBlur={formState.iLevelInput.handleBlur}
            onFocus={formState.iLevelInput.handleFocus}
            min={ITEM_LEVEL_MIN}
            max={ITEM_LEVEL_MAX}
            maxLength={3}
            placeholder="…"
          />
        )}
      </CharacterFormField>

      <CharacterFormField
        label={t('eventPage.keyMinShort')}
        value={
          c?.keystoneMinLevel !== undefined
            ? c.keystoneMinLevel
            : KEYSTONE_MIN_LEVEL
        }
        isEditing={isEditing}
      >
        {isEditing && (
          <ValidatedNumberInput
            value={formState.keystoneMinInput.value}
            onChange={formState.keystoneMinInput.handleChange}
            onBlur={formState.keystoneMinInput.handleBlur}
            onFocus={formState.keystoneMinInput.handleFocus}
            min={KEYSTONE_MIN_LEVEL}
            max={parseInt(formState.keystoneMaxInput.value) || KEYSTONE_MAX_LEVEL}
            maxLength={2}
            placeholder="…"
          />
        )}
      </CharacterFormField>

      <CharacterFormField
        label={t('eventPage.keyMaxShort')}
        value={
          c?.keystoneMaxLevel !== undefined
            ? c.keystoneMaxLevel
            : KEYSTONE_MAX_LEVEL
        }
        isEditing={isEditing}
      >
        {isEditing && (
          <ValidatedNumberInput
            value={formState.keystoneMaxInput.value}
            onChange={formState.keystoneMaxInput.handleChange}
            onBlur={formState.keystoneMaxInput.handleBlur}
            onFocus={formState.keystoneMaxInput.handleFocus}
            min={parseInt(formState.keystoneMinInput.value) || KEYSTONE_MIN_LEVEL}
            max={KEYSTONE_MAX_LEVEL}
            maxLength={2}
            placeholder="…"
          />
        )}
      </CharacterFormField>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:pl-2">
        {isEditing ? (
          <>
            <Button type="button" size="sm" onClick={() => void handleSave()}>
              {t('eventPage.saveCharacter')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
            >
              {t('eventPage.cancelEdit')}
            </Button>
          </>
        ) : (
          <>
            {isAdmin ? (
              <Button type="button" size="sm" variant="secondary" onClick={handleAdd}>
                {t('eventPage.addCharacter')}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  {t('eventPage.updateCharacter')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => void handleLeave()}
                >
                  {t('eventPage.leaveEvent')}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreatedCharacterView;
