import React, {useState, createContext, useEffect, useMemo} from 'react';
import {getStoredStringValue, storeStringValue} from '../utils';
import {langTranslations} from '../../assets/lang';

const DEFAULT_LANG = langTranslations[1].value;
// console.log('DEFAULT_LANGUAGE==>', DEFAULT_LANG);

interface AppDataContextType {
  appLang: any;
  activeLang: string;
  setActiveLang: React.Dispatch<React.SetStateAction<string>>;
  langTranslations: typeof langTranslations;
}

// Provide a default value for appTheme
const defaultAppDataContext: AppDataContextType = {
  appLang: langTranslations[0],
  activeLang: '',
  setActiveLang: () => {},
  langTranslations: langTranslations,
};

const AppDataContext = createContext<AppDataContextType>(defaultAppDataContext);
const AppDataProvider = ({children}: {children: React.ReactNode}) => {
  const [activeLang, setActiveLang] = useState(DEFAULT_LANG);
  const [appLang, setAppLang] = useState({});

  useEffect(() => {
    getStoredStringValue('@LangState', setActiveLang, DEFAULT_LANG);
  }, []);

  useEffect(() => {
    // console.log('Active Language Changed:', activeLang);
    const mLangData = langTranslations.find(i => i.value === activeLang);
    setAppLang(mLangData?.data);
    storeStringValue('@LangState', activeLang);
  }, [activeLang]);

  const contextValue = useMemo(
    () => ({
      appLang,
      activeLang,
      setActiveLang,
      langTranslations,
    }),
    [appLang, activeLang, setActiveLang, langTranslations],
  );

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

export {AppDataContext, AppDataProvider};
