/* eslint-disable tailwindcss/no-custom-classname */
import { ErrorBoundary } from 'react-error-boundary';

import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Fallback } from '@/components/Fallback';
import { SideNav } from '@/components/SideNav';
import { Toaster } from '@/components/ui/sonner';

import TwoColumns from './TwoColumns';

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden font-kaas">
      <ErrorBoundary FallbackComponent={Fallback}>
        <TwoColumns>
          <TwoColumns.Left>
            <SideNav />
          </TwoColumns.Left>
          <TwoColumns.Right>{children}</TwoColumns.Right>
        </TwoColumns>
        <Toaster />
        <ConfirmationDialog />
      </ErrorBoundary>
    </div>
  );
}
