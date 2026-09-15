import { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown, Sparkles, User, MapPin, Building, Calendar, FileText } from 'lucide-react';
import { AVAILABLE_MERGE_TAGS } from '../../utils/mergeTags';

interface VariableDropdownProps {
  onInsertTag: (tag: string) => void;
}

export default function VariableDropdown({ onInsertTag }: VariableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = ['Trainee', 'Address', 'Institute', 'Attendance', 'Dispatch', 'Smart AI'];

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
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-2.5 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Dynamic Document Merge Tags
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const tags = AVAILABLE_MERGE_TAGS.filter((t) => t.category === cat);
              if (tags.length === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-1">
                    {cat === 'Smart AI' && <Sparkles className="w-3 h-3 text-amber-500" />}
                    <span>{cat} Fields</span>
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
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-blue-50 hover:text-blue-900 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-blue-900">
                          {item.label}
                        </span>
                        <code className="text-[10px] bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-800 px-1.5 py-0.5 rounded font-mono">
                          {item.tag}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
