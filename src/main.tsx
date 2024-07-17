import './styles.css';
import '@/i18n';

import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useOutlet,
} from 'react-router-dom';

import logoImg from '@/assets/images/logo.svg';
import CommonLayout from '@/layouts/CommonLayout';
import {
  ConversationsContextProvider,
  InitializationProvider,
  RQProvider,
} from '@/lib/providers';
import ConversationPage from '@/pages/Conversation';
import ConversationsPage from '@/pages/Conversations';
import DebugPage from '@/pages/Debug';
import ModelsPage from '@/pages/Models';
import PromptsPage from '@/pages/Prompts';
import SettingsPage from '@/pages/Settings';

import { GlobalFallback } from './components/GlobalFallback';
import { PageSkeleton } from './components/placeholders/WholePage';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from './components/ui/context-menu';
import { TooltipProvider } from './components/ui/tooltip';
import Dependencies from './pages/Dependencies';

const AnimatedOutlet = (): React.JSX.Element => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {element && React.cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <CommonLayout>
        <AnimatedOutlet />
      </CommonLayout>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/conversations" replace />,
      },
      {
        path: 'models',
        element: <ModelsPage />,
      },
      {
        path: 'conversations',
        element: (
          <ConversationsContextProvider>
            <Outlet />
          </ConversationsContextProvider>
        ),
        children: [
          {
            index: true,
            element: <ConversationsPage />,
          },
          {
            path: ':conversationId',
            element: <ConversationPage />,
          },
        ],
      },
      {
        path: 'prompts',
        element: <PromptsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'dependencies',
        element: <Dependencies />,
      },
      {
        path: 'debug',
        element: <DebugPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Wrap everything in an empty context menu to avoid native */}
    {/* context menu from showing up when right clicking on the page */}
    <ContextMenu>
      <ContextMenuTrigger>
        <ErrorBoundary FallbackComponent={GlobalFallback}>
          <RQProvider>
            <ThemeProvider defaultTheme="system" attribute="class">
              <TooltipProvider delayDuration={0}>
                <Suspense fallback={<PageSkeleton />}>
                  <InitializationProvider>
                    <RouterProvider router={router} />
                  </InitializationProvider>
                </Suspense>
              </TooltipProvider>
            </ThemeProvider>
          </RQProvider>
        </ErrorBoundary>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-fit">
        <div className="p-1">
          <img src={logoImg} alt="Kaas" width={16} height={16} />
        </div>
      </ContextMenuContent>
    </ContextMenu>
  </React.StrictMode>
);
