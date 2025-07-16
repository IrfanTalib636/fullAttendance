export const LANGS = {
  pt: require('./pt.json'),
  es: require('./es.json'),
  en: require('./en.json'),
};

// local available app translations...
export const langTranslations = [
  {
    id: 1,
    key: 'portuguese',
    value: 'pt',
    data: LANGS.pt,
  },
  {
    id: 2,
    key: 'English',
    value: 'en',
    data: LANGS.en,
  },
  {
    id: 3,
    key: 'Español',
    value: 'es',
    data: LANGS.es,
  },
];
