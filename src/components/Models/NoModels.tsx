import { useTranslation } from 'react-i18next';

import { ModelCreator } from '../ModelCreator';
import SectionTitle from '../SectionTitle';

export default function NoModels() {
  const { t } = useTranslation();
  return (
    <div className="mx-4 flex flex-col items-center justify-center">
      <SectionTitle className="text-center">
        {t('page-models:message:no-model')}
      </SectionTitle>
      <p className="mt-4 text-sm">{t('page-models:message:add-model')}</p>
      <div className="mt-6">
        <ModelCreator />
      </div>
    </div>
  );
}
