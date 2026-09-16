import { useState } from 'react';
import { Languages, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';

interface ImeFloatWidgetProps {
  currentLanguage: 'Gujarati' | 'Hindi' | 'English';
  onLanguageChange: (lang: 'Gujarati' | 'Hindi' | 'English') => void;
}

export default function ImeFloatWidget({ currentLanguage, onLanguageChange }: ImeFloatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [copied, setCopied] = useState(false);

  const transliterated =
    currentLanguage === 'English'
      ? testInput
      : transliterateText(testInput, currentLanguage as 'Gujarati' | 'Hindi');

  const copyToClipboard = () => {
    if (!transliterated) return;
    navigator.clipboard.writeText(transliterated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1 bg-white/95 border border-slate-300 rounded-lg p-0.5 sm:p-1 shadow-2xs">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#346739] pl-1.5 pr-0.5" title="Phonetic IME Language Selector">
          <Languages className="w-3.5 h-3.5 text-[#346739] shrink-0" />
          <span className="hidden md:inline">IME:</span>
        </span>
        <div className="flex bg-slate-100 p-0.5 rounded-md text-[11px] sm:text-xs font-medium">
          {(['Gujarati', 'Hindi', 'English'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded transition-all ${
                currentLanguage === lang
                  ? 'bg-[#346739] text-[#f2edc2] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={`Switch typing language to ${lang}`}
            >
              <span className="sm:hidden">
                {lang === 'Gujarati' ? 'ગુજ' : lang === 'Hindi' ? 'હિ' : 'EN'}
              </span>
              <span className="hidden sm:inline">
                {lang === 'Gujarati' ? 'ગુજરાતી' : lang === 'Hindi' ? 'हिन्दी' : 'English'}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Open Phonetic Key Guide & Quick Converter"
          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-10 sm:top-11 z-50 w-72 sm:w-96 max-w-[calc(100vw-20px)] bg-white border border-slate-300 rounded-xl shadow-xl p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Phonetic IME Transliteration Box</span>
            </div>
            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              {currentLanguage}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-2">
            Type English phonetically (e.g., <span className="font-mono bg-slate-100 px-1 rounded">Ramesh</span>,{' '}
            <span className="font-mono bg-slate-100 px-1 rounded">Patel</span>,{' '}
            <span className="font-mono bg-slate-100 px-1 rounded">Rajkot</span>).
          </p>

          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type English phonetically here..."
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Live Converted Text:
            </div>
            <div className="text-base font-medium text-slate-900 min-h-[28px] break-words">
              {transliterated || <span className="text-slate-400 italic">Result will appear here...</span>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Auto-converts in all Trainee entry forms.
            </div>
            <button
              onClick={copyToClipboard}
              disabled={!transliterated}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Unicode'}</span>
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-[11px] text-slate-600 font-mono">
            <div className="bg-slate-100 p-1 rounded text-center">k &rarr; {currentLanguage === 'Hindi' ? 'क' : 'ક'}</div>
            <div className="bg-slate-100 p-1 rounded text-center">kh &rarr; {currentLanguage === 'Hindi' ? 'ख' : 'ખ'}</div>
            <div className="bg-slate-100 p-1 rounded text-center">sh &rarr; {currentLanguage === 'Hindi' ? 'श' : 'શ'}</div>
            <div className="bg-slate-100 p-1 rounded text-center">aa &rarr; {currentLanguage === 'Hindi' ? 'आ' : 'આ'}</div>
            <div className="bg-slate-100 p-1 rounded text-center">ee &rarr; {currentLanguage === 'Hindi' ? 'ई' : 'ઈ'}</div>
            <div className="bg-slate-100 p-1 rounded text-center">oo &rarr; {currentLanguage === 'Hindi' ? 'ऊ' : 'ઊ'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
