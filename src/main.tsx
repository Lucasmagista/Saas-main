import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';


Sentry.init({
  dsn: 'https://exemploPublicKey@o0.ingest.sentry.io/0', // Troque pelo seu DSN
  tracesSampleRate: 1.0,
});

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  );
}
