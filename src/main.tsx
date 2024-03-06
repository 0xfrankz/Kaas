import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import CommonLayout from '@/layouts/CommonLayout';
import { InitializationProviders, RQProviders } from '@/lib/providers';
import ConversationPage from '@/pages/Conversation';
import ConversationsPage from '@/pages/Conversations';
import ModelsPage from '@/pages/Models';
import SettingsPage from '@/pages/Settings';
import TemplatesPage from '@/pages/Templates';

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
        element: <ConversationsPage />,
      },
      {
        path: 'conversation/:conversationId',
        element: <ConversationPage />,
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
  <React.StrictMode>
    <RQProviders>
      <InitializationProviders>
        <RouterProvider router={router} />
      </InitializationProviders>
    </RQProviders>
  </React.StrictMode>
);
