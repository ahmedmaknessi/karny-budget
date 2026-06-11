import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';

const i18n = new I18n({ en, fr, ar });

i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'fr';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export function setLocale(locale: 'ar' | 'fr' | 'en'): void {
  i18n.locale = locale;
}
