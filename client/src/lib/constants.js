import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import gu from '../i18n/gu.json';

const translations = { en, hi, gu };

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हि' },
  { code: 'gu', label: 'ગુજરાતી', short: 'ગુ' },
];

export const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'mobile_shop', label: 'Mobile Shop' },
  { value: 'gym', label: 'Gym' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'other', label: 'Other' },
];

/**
 * Get translation string for a given key and language
 */
export function t(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}
