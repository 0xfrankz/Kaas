import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { ConversationHistoryGrid } from '@/components/ConversationsHistoryGrid';
import { GridSkeleton } from '@/components/placeholders/GridSkeleton';

export default function HomePage() {
  const { t } = useTranslation(['generic', 'error']);

  return (
    <SlideUpTransition motionKey="home">
      <div className="flex size-full flex-col items-center justify-between p-24">
        <div>{t('kaas')}</div>
        <div>{t('error:test')}</div>
        <div>
          <Link to="/models">Go to Models page</Link>
        </div>
        <Suspense fallback={<GridSkeleton />}>
          <ConversationHistoryGrid />
        </Suspense>
      </div>
    </SlideUpTransition>
  );
}
