import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { t } = useTranslation(['generic', 'error']);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>{t('kaas')}</div>
      <div>{t('error:test')}</div>
      <div>
        <Link to="/models">Go to Models page</Link>
      </div>
    </main>
  );
}
