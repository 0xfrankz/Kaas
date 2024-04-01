/* eslint-disable tailwindcss/no-custom-classname */
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
    <div className="relative flex min-h-screen overflow-hidden font-inter">
      <ErrorBoundary FallbackComponent={Fallback}>
        <SideNav />
        {children}
        <Toaster />
      </ErrorBoundary>
    </div>
  );
}
