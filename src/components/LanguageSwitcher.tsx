import { useI18n } from '../hooks/useI18n';
import type { Lang } from '../types';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="lang-switcher">
      <span className="lang-switcher__label">{t('lang.label')}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
        <option value="de">{t('lang.de')}</option>
        <option value="en">{t('lang.en')}</option>
      </select>
    </label>
  );
}
