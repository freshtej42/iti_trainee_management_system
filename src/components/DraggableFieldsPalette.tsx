import React, { useState } from 'react';
import {
  GripVertical,
  Search,
  User,
  MapPin,
  Building,
  Calendar,
  FileText,
  Sparkles,
  Plus,
  X,
  HelpCircle,
} from 'lucide-react';
import { AVAILABLE_MERGE_TAGS } from '../utils/mergeTags';

interface DraggableFieldsPaletteProps {
  onInsertTag?: (tag: string) => void;
  className?: string;
}

export default function DraggableFieldsPalette({
  onInsertTag,
  className = '',
}: DraggableFieldsPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const categories = [
    { id: 'All', label: 'બધા (All)', icon: Sparkles },
    { id: 'Trainee', label: 'વિદ્યાર્થી (Trainee)', icon: User },
    { id: 'Attendance', label: 'હાજરી (Attendance)', icon: Calendar },
    { id: 'Address', label: 'સરનામું (Address)', icon: MapPin },
    { id: 'Institute', label: 'સંસ્થા (Institute)', icon: Building },
    { id: 'Dispatch', label: 'જાવક (Dispatch)', icon: FileText },
  ];

  const filteredTags = AVAILABLE_MERGE_TAGS.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.tag.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tag: string) => {
    e.dataTransfer.setData('text/plain', tag);
    e.dataTransfer.setData('application/x-merge-tag', tag);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (tag: string) => {
    if (onInsertTag) {
      onInsertTag(tag);
    }
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div
      className={`bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-2.5 ${className}`}
    >
      {/* Header & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#346739] text-[#f2edc2] rounded-md shadow-2xs">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900">
              ડાયનેમિક ફિલ્ડ્સ (Drag & Drop Dynamic Fields)
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-500 ml-2">
              ફિલ્ડને માઉસથી ખેંચીને (drag) પત્રમાં ગમે ત્યાં મૂકો (drop), અથવા ક્લિક કરીને ઉમેરો
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ફિલ્ડ શોધો... (Search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#346739] focus:border-[#346739]"
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

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#346739] text-[#f2edc2] font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Draggable Tag Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
        {filteredTags.map((item) => {
          const isCopied = copiedTag === item.tag;
          return (
            <div
              key={item.tag}
              draggable
              onDragStart={(e) => handleDragStart(e, item.tag)}
              onClick={() => handleClick(item.tag)}
              title="ખેંચીને પત્રમાં મૂકો (Drag & Drop) અથવા ક્લિક કરીને કર્સર આગળ ઉમેરો"
              className={`flex items-center justify-between gap-1 p-1.5 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all select-none group shadow-2xs ${
                isCopied
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 scale-95'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-[#346739] hover:bg-emerald-50/40 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1 min-w-0">
                <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-[#346739] shrink-0" />
                <span className="truncate text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
                  {item.label.split('(')[0].trim()}
                </span>
              </div>
              <span className="shrink-0 text-[9.5px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded group-hover:bg-[#346739] group-hover:text-[#f2edc2] transition-colors">
                {isCopied ? '✓ ઉમેરાયું' : '+ ઉમેરો'}
              </span>
            </div>
          );
        })}
      </div>

      {copiedTag && (
        <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 animate-in fade-in duration-150">
          ✓ ફિલ્ડ {copiedTag} પત્રમાં ઉમેરાયું છે.
        </div>
      )}
    </div>
  );
}
