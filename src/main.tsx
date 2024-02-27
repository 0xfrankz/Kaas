import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import CommonLayout from '@/layouts/CommonLayout';
import { InitializationProviders, RQProviders } from '@/lib/providers';
import ConversationsPage from '@/pages/Conversations';
import HomePage from '@/pages/Home';
import ModelsPage from '@/pages/Models';
import SettingsPage from '@/pages/Settings';
import TemplatesPage from '@/pages/Templates';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <CommonLayout>
        <HomePage />
      </CommonLayout>
    ),
  },
  {
    path: '/models',
    element: (
      <CommonLayout>
        <ModelsPage />
      </CommonLayout>
    ),
  },
  {
    path: '/conversations',
    element: (
      <CommonLayout>
        <ConversationsPage />
      </CommonLayout>
    ),
  },
  {
    path: '/templates',
    element: (
      <CommonLayout>
        <TemplatesPage />
      </CommonLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <CommonLayout>
        <SettingsPage />
      </CommonLayout>
    ),
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
