import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import { AVISOS_CONSTANTS } from '../lib/constants';

const idioma = window.navigator.language;
const lang = AVISOS_CONSTANTS.IDIOMAS.indexOf(idioma) > -1 ? idioma : 'es';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: lang,
    fallbackLng: 'es',
    backend: {
      loadPath: '/assets/i18n/{{lng}}.json'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
