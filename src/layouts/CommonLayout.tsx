import { ErrorBoundary } from 'react-error-boundary';

import { Fallback } from '@/components/Fallback';
import { SideNav } from '@/components/SideNav';
import { Toaster } from '@/components/ui/toaster';

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen font-inter">
      <SideNav />
      <ErrorBoundary FallbackComponent={Fallback}>
        <main className="flex min-h-screen grow flex-col">{children}</main>
      </ErrorBoundary>
      <Toaster />
    </div>
  );
}
