import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ClearButtonProps {
  onClear: () => void;
  /** Waiting room roster vs formed groups */
  scope?: 'waiting' | 'parties';
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear, scope = 'parties' }) => {
  const { t } = useTranslation();
  const label =
    scope === 'waiting' ? t('eventPage.clearList') : t('eventPage.clearParties');
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-amber-500/40 text-amber-100 hover:bg-amber-500/15 hover:text-amber-50"
      onClick={onClear}
    >
      {label}
    </Button>
  );
};

export default ClearButton;
