import { useTranslation } from 'react-i18next';

import { useFilledPromptContext } from '@/lib/hooks';
import { interpolate } from '@/lib/prompts';

export function PromptPreviewer() {
  const { t } = useTranslation('page-prompts');
  const { prompt } = useFilledPromptContext();
  const promptCtx = Object.fromEntries(
    prompt.variables?.map((v) => [v.label, v.value]) ?? []
  );
  const promptStr = interpolate(prompt.prompt, promptCtx);
  return (
    <div className="flex flex-col gap-1">
      <h4 className="mt-2 text-sm font-semibold">
        {t('page-prompts:section:preview')}
      </h4>
      <div className="select-text whitespace-pre-wrap rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
        {promptStr}
      </div>
    </div>
  );
}
