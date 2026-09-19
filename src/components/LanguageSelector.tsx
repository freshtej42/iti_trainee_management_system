import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage, LANGUAGE_OPTIONS, Language } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'mobile' | 'compact';
  className?: string;
}

export default function LanguageSelector({ variant = 'header', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'mobile') {
    return (
      <div className={`p-3 bg-slate-50 rounded-xl border border-slate-200 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#346739]" />
            ભાષા પસંદ કરો / Select Language
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center justify-center min-h-[44px] ${
                  isSelected
                    ? 'bg-[#346739] text-[#f2edc2] border-[#264e2b] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-xs">{opt.nativeName}</span>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-[#f2edc2]/80' : 'text-slate-400'}`}>
                  {opt.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header Desktop & Compact Bar
  return (
    <div
      className={`inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 sm:p-1 shadow-2xs ${className}`}
      title="Portal Language Toggle: Gujarati / Hindi / English"
    >
      <div className="flex items-center gap-1 pl-1 pr-1 text-[#346739]" title="Switch Language">
        <Languages className="w-3.5 h-3.5 text-[#346739] shrink-0" />
        <span className="text-[11px] font-bold hidden xl:inline">Lang:</span>
      </div>
      <div className="flex bg-slate-100 p-0.5 rounded-md gap-0.5">
        {LANGUAGE_OPTIONS.map((opt) => {
          const isSelected = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`px-2 py-1 text-[11px] sm:text-xs rounded transition-all font-semibold ${
                isSelected
                  ? 'bg-[#346739] text-[#f2edc2] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={`Switch portal to ${opt.label} (${opt.nativeName})`}
            >
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className="hidden sm:inline">{opt.nativeName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
