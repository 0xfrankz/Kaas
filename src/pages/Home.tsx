import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useListModels } from '../lib/hooks';
import log from '../lib/logs';

export default function HomePage() {
  // Queries
  const { data: modelsData, isSuccess } = useListModels();

  // Hooks
  useEffect(() => {
    if (isSuccess) {
      log.info(`Models fetched: ${JSON.stringify(modelsData)}`);
    }
  }, [modelsData, isSuccess]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Hello Tauri</div>
      <div>
        <Link to="/models">Go to Models page</Link>
      </div>
    </main>
  );
}
