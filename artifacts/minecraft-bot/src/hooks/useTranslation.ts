import { useCallback } from 'react';
import { useGetSettings } from '@workspace/api-client-react';
import { translations, Language } from '../i18n/translations';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TransKeys = NestedKeyOf<typeof translations.en>;

export function useTranslation() {
  const { data: settings } = useGetSettings();
  const lang: Language = (settings?.language as Language) || 'ru';

  const t = useCallback((keyString: TransKeys): string => {
    const keys = keyString.split('.');
    let current: any = translations[lang] || translations['ru'];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to English if translation is missing
        let fallback: any = translations['en'];
        for (const k of keys) {
          if (fallback[k] === undefined) return keyString;
          fallback = fallback[k];
        }
        return fallback;
      }
      current = current[key];
    }
    
    return current;
  }, [lang]);

  return { t, lang };
}
