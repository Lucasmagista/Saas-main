import React from 'react';
import { useTranslation } from 'react-i18next';

// Lista de idiomas disponíveis.  Adicionamos suporte a todos os idiomas
// definidos no arquivo de traduções (`src/lib/i18n.ts`), permitindo que o
// usuário selecione qualquer idioma que o sistema suporte.  A lista pode
// crescer à medida que mais traduções forem adicionadas.
const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
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
