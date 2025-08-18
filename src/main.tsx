import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from '@sentry/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';


Sentry.init({
  dsn: process.env.NODE_ENV === 'production' ? 'https://real_sentry_dsn_here@o0.ingest.sentry.io/0' : undefined, // Desabilitado em desenvolvimento
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
  enabled: process.env.NODE_ENV === 'production',
});

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  );
}
