import { useTranslation } from 'react-i18next';

import SectionTitle from '../SectionTitle';
import { PromptCreator } from './PromptCreator';

export default function NoPrompts() {
  const { t } = useTranslation();
  return (
    <div className="mx-4 flex flex-col items-center justify-center">
      <SectionTitle className="text-center">
        {t('page-prompts:message:no-prompt')}
      </SectionTitle>
      <div className="mt-6">
        <PromptCreator forceShowText />
      </div>
    </div>
  );
}
