import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import CommonLayout from '@/layouts/CommonLayout';
import {
  ConversationsContextProvider,
  InitializationProvider,
  RQProvider,
} from '@/lib/providers';
import ConversationPage from '@/pages/Conversation';
import ConversationsPage from '@/pages/Conversations';
import ModelsPage from '@/pages/Models';
import SettingsPage from '@/pages/Settings';
import TemplatesPage from '@/pages/Templates';

import { GlobalFallback } from './components/GlobalFallback';
import HomePage from './pages/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <CommonLayout>
        <Outlet />
      </CommonLayout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
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
        path: 'templates',
        element: <TemplatesPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <ErrorBoundary FallbackComponent={GlobalFallback}>
    <RQProvider>
      <InitializationProvider>
        <RouterProvider router={router} />
      </InitializationProvider>
    </RQProvider>
  </ErrorBoundary>
  // </React.StrictMode>
);
