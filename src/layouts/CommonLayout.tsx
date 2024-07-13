/* eslint-disable tailwindcss/no-custom-classname */
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Fallback } from '@/components/Fallback';
import { SideNav } from '@/components/SideNav';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  return (
    <div
      className={cn(
        'relative flex min-h-screen overflow-hidden',
        i18n.language === 'en' ? 'font-inter' : 'font-noto_sans_sc'
      )}
    >
      <ErrorBoundary FallbackComponent={Fallback}>
        <SideNav />
        {children}
        <Toaster />
        <ConfirmationDialog />
      </ErrorBoundary>
    </div>
  );
}
