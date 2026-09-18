import { useState, useRef, useEffect } from 'react';
import {
  Tag,
  ChevronDown,
  Sparkles,
  User,
  MapPin,
  Building,
  Calendar,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { AVAILABLE_MERGE_TAGS } from '../../utils/mergeTags';

interface VariableDropdownProps {
  onInsertTag: (tag: string) => void;
}

export default function VariableDropdown({ onInsertTag }: VariableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const categories = [
    { name: 'Trainee', icon: User, color: 'text-blue-600' },
    { name: 'Address', icon: MapPin, color: 'text-amber-600' },
    { name: 'Institute', icon: Building, color: 'text-indigo-600' },
    { name: 'Attendance', icon: Calendar, color: 'text-emerald-600' },
    { name: 'Dispatch', icon: FileText, color: 'text-violet-600' },
    { name: 'Smart AI', icon: Sparkles, color: 'text-amber-500' },
  ];

  const filteredTags = AVAILABLE_MERGE_TAGS.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tag.toLowerCase().includes(q) ||
      t.label.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
        title="Insert Dynamic Trainee / Attendance Field Tag"
      >
        <Tag className="w-3.5 h-3.5" />
        <span>Insert Merge Field</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[460px] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
          {/* Header & Instant Search Box */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dynamic Merge Tags (ડેટા ટેગ)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ટેગ શોધો... (Search e.g. roll, name, હાજરી)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Tags Body */}
          <div className="p-2.5 overflow-y-auto max-h-[360px] space-y-3">
            {filteredTags.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                કોઈ મેળ ખાતા ટેગ મળ્યા નથી (No matching tags found)
              </div>
            ) : (
              categories.map((cat) => {
                const tags = filteredTags.filter((t) => t.category === cat.name);
                if (tags.length === 0) return null;
                const IconComponent = cat.icon;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className={`w-3 h-3 ${cat.color}`} />
                        <span>{cat.name} Fields</span>
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 font-mono">
                        {tags.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {tags.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => {
                            onInsertTag(item.tag);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-900 transition-colors flex items-center justify-between group"
                        >
                          <span className="font-medium text-slate-800 group-hover:text-blue-900">
                            {item.label}
                          </span>
                          <code className="text-[10px] bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-800 px-1.5 py-0.5 rounded font-mono shrink-0 ml-2">
                            {item.tag}
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom helper bar */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
            <span>ટેગ પર ક્લિક કરવાથી કર્સર આગળ ઉમેરાશે</span>
            <span className="font-mono text-slate-400 font-semibold">{filteredTags.length} Tags</span>
          </div>
        </div>
      )}
    </div>
  );
}
