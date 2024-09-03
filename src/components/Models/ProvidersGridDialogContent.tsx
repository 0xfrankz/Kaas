import { useTranslation } from 'react-i18next';

import { SUPPORTED_PROVIDERS } from '@/lib/constants';
import type { AllProviders } from '@/lib/types';

import NumberedBullet from '../NumberedBullet';
import { ProviderCard } from '../ProviderCard';
import { DialogHeader, DialogTitle } from '../ui/dialog';

type Props = {
  onClick: (provider: AllProviders) => void;
};
export default function ProvidersGridDialogContent({ onClick }: Props) {
  const { t } = useTranslation(['page-models']);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <NumberedBullet number={1} />
          {t('page-models:section:pick-provider')}
        </DialogTitle>
      </DialogHeader>
      <div className="mt-6 grid grid-cols-3 gap-5 text-sm sm:grid-cols-4 sm:text-base">
        {SUPPORTED_PROVIDERS.map((p) => (
          <ProviderCard
            provider={p}
            onClick={() => {
              onClick(p);
            }}
            key={`${p}-model-card`}
          />
        ))}
      </div>
    </>
  );
}
