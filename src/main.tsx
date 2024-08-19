import './styles.css';
import '@/i18n';

import { useKeyPress } from 'ahooks';
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
        element: <Outlet />,
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

const KeyboardBlocker = () => {
  const filter = [
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
    'ctrl.a',
    'ctrl.b',
    'ctrl.c',
    'ctrl.d',
    'ctrl.e',
    'ctrl.f',
    'ctrl.g',
    'ctrl.h',
    'ctrl.i',
    'ctrl.j',
    'ctrl.k',
    'ctrl.l',
    'ctrl.m',
    'ctrl.n',
    'ctrl.o',
    'ctrl.p',
    'ctrl.q',
    'ctrl.r',
    'ctrl.s',
    'ctrl.t',
    'ctrl.u',
    'ctrl.v',
    'ctrl.w',
    'ctrl.x',
    'ctrl.y',
    'ctrl.z',
    'ctrl.0',
    'ctrl.1',
    'ctrl.2',
    'ctrl.3',
    'ctrl.4',
    'ctrl.5',
    'ctrl.6',
    'ctrl.7',
    'ctrl.8',
    'ctrl.9',
    'ctrl.graveaccent',
    'ctrl.dash',
    'ctrl.equalsign',
    'ctrl.openbracket',
    'ctrl.closebracket',
    'ctrl.backslash',
    'ctrl.semicolon',
    'ctrl.singlequote',
    'ctrl.comma',
    'ctrl.period',
    'ctrl.forwardslash',
    'ctrl.f5',
    'ctrl.shift.r',
  ];
  useKeyPress(
    filter,
    (e, key) => {
      switch (key) {
        case 'ctrl.a':
          // ctrl+a is allowed on input and textarea
          if (e.target instanceof Element) {
            const tagName = e.target?.tagName.toLowerCase();
            if (tagName !== 'input' && tagName !== 'textarea') {
              e.preventDefault();
              e.stopPropagation();
            }
          }
          break;
        case 'ctrl.c':
          // ctrl+c is allowed
          break;
        case 'ctrl.v':
          // ctrl+v is allowed
          break;
        case 'ctrl.x':
          // ctrl+x is allowed
          break;
        default:
          e.preventDefault();
          e.stopPropagation();
      }
    },
    {
      exactMatch: true,
    }
  );
  return null;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <KeyboardBlocker />
    {/* Wrap everything in an empty context menu to avoid native */}
    {/* context menu from showing up when right clicking on the page */}
    <ContextMenu>
      <ContextMenuTrigger>
        <ErrorBoundary FallbackComponent={GlobalFallback}>
          <RQProvider>
            <ThemeProvider defaultTheme="system" attribute="class">
              <TooltipProvider delayDuration={0}>
                <Suspense fallback={<PageSkeleton />}>
                  <ConversationsContextProvider>
                    <InitializationProvider>
                      <RouterProvider router={router} />
                    </InitializationProvider>
                  </ConversationsContextProvider>
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
