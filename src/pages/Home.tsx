import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { t } = useTranslation(['generic', 'error']);

  return (
    <motion.main
      className="flex min-h-screen grow flex-col bg-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, type: 'tween' },
      }}
      exit={{
        opacity: 0,
        zIndex: 0,
        transition: { duration: 0.1, type: 'tween' },
      }}
      key="home"
    >
      <div className="flex size-full flex-col items-center justify-between p-24">
        <div>{t('kaas')}</div>
        <div>{t('error:test')}</div>
        <div>
          <Link to="/models">Go to Models page</Link>
        </div>
      </div>
    </motion.main>
  );
}
