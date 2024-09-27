import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importez les fichiers de traduction
import enTranslations from './locales/en/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
  },
  lng: 'en', // Langue par défaut
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
