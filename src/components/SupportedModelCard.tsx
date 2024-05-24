import { Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import type { AllProviders } from '@/lib/types';
import { getProviderStyles } from '@/lib/utils';

import { Button } from './ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from './ui/card';

type Props = {
  provider: AllProviders;
  onClick: (provider: string) => void;
};

export function SupportedModelCard({ provider, onClick }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getProviderStyles(provider);
  return (
    <Card
      className="relative mt-6 border border-none border-border pt-3 shadow-none"
      key={`${provider}-model-card`}
      style={{
        backgroundColor:
          theme === 'light' ? styles.color.light : styles.color.dark,
      }}
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
      <CardHeader className="pb-2">
        <CardTitle className="mx-auto">
          {t(`generic:model:${provider}`)}
        </CardTitle>
      </CardHeader>
      <CardFooter className="mt-2">
        <Button className="mx-auto w-32" onClick={() => onClick(provider)}>
          <Plus className="size-4 text-primary-foreground" />
        </Button>
      </CardFooter>
    </Card>
  );
}
