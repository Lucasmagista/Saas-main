import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <section aria-label="Seleção de idioma">
      <select
        value={i18n.language}
        onChange={handleChange}
        aria-label="Selecionar idioma"
        className="px-2 py-1 rounded border"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </section>
  );
}
