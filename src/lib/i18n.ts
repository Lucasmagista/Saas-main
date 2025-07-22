import i18n from 'i18next';
import initReactI18next from 'react-i18next';

const resources = {
  pt: {
    translation: {
      welcome: 'Bem-vindo',
      dashboard: 'Painel',
      settings: 'Configurações',
      // ...adicione mais traduções
    }
  },
  en: {
    translation: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      settings: 'Settings',
      // ...add more translations
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      dashboard: 'Panel',
      settings: 'Configuraciones',
      // ...agregue más traducciones
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
