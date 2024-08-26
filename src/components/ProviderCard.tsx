import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import type { AllProviders } from '@/lib/types';
import { getProviderStyles } from '@/lib/utils';

import { Card, CardHeader, CardTitle } from './ui/card';

type Props = {
  provider: AllProviders;
  onClick: (provider: string) => void;
};

export function ProviderCard({ provider, onClick }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getProviderStyles(provider);
  return (
    <Card
      className="relative mt-6 border border-none border-border py-3 shadow-none hover:scale-105 hover:cursor-pointer"
      key={`${provider}-model-card`}
      style={{
        backgroundColor:
          theme === 'light' ? styles.color.light : styles.color.dark,
      }}
      onClick={() => onClick(provider)}
    >
      <div
        className="absolute inset-x-0 -top-6 mx-auto flex size-12 items-center justify-center rounded-full border-2 bg-background"
        style={{
          borderColor:
            theme === 'light' ? styles.color.light : styles.color.dark,
        }}
      >
        <img
          src={`/images/${theme === 'light' ? styles.icon.light : styles.icon.dark}`}
          alt={provider}
          className="size-6"
        />
      </div>
      <CardHeader className="px-2 pb-2">
        <CardTitle className="mx-auto min-h-10 text-center font-medium leading-5 text-background">
          {t(`generic:model:${provider}`)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
