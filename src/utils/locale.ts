let locale: Intl.UnicodeBCP47LocaleIdentifier | undefined = undefined;

export const setLocale = (newLocale: Intl.UnicodeBCP47LocaleIdentifier) => {
  locale = newLocale;
};

export const getLocale = () => locale;
