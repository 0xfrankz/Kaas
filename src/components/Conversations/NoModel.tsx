import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import SectionTitle from '../SectionTitle';
import { Button } from '../ui/button';

export default function NoModel() {
  const { t } = useTranslation();
  return (
    <div className="mx-4 flex flex-col items-center justify-center">
      <SectionTitle className="text-center">
        {t('page-conversations:message:no-model')}
      </SectionTitle>
      <div className="mt-6">
        <Button type="button" asChild>
          <Link to="/models">
            <Package className="size-4" />
            <span className="ml-2">{t('generic:action:create-new-model')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
