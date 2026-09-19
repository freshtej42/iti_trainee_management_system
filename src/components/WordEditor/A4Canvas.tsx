import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Instructor, HeaderConfig } from '../../types';
import {
  Building2,
  Stamp,
  Smartphone,
  Upload,
  Trash2,
  Maximize2,
  Sliders,
  MoveHorizontal,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';

interface A4CanvasProps {
  contentHtml: string;
  onContentChange: (html: string) => void;
  fontFamily: string;
  fontSize: string;
  showLetterhead: boolean;
  showSignature: boolean;
  pageMargin: 'normal' | 'narrow' | 'wide';
  orientation?: 'portrait' | 'landscape';
  showRuler: boolean;
  showMarginGuides: boolean;
  zoomLevel: number;
  previewMerged: boolean;
  mergedHtml: string;
  instructor: Instructor;
  headerConfig?: HeaderConfig;
  onHeaderChange?: (newConfig: HeaderConfig) => void;
  onZoomChange?: (zoom: number) => void;
}

export default function A4Canvas({
  contentHtml,
  onContentChange,
  fontFamily,
  fontSize,
  showLetterhead,
  showSignature,
  pageMargin,
  orientation = 'portrait',
  showRuler,
  showMarginGuides,
  zoomLevel,
  previewMerged,
  mergedHtml,
  instructor,
  headerConfig,
  onHeaderChange,
  onZoomChange,
}: A4CanvasProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState<number>(850);

  // Hidden file input refs for left & right logos
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Logo selection & resize state
  const [selectedLogo, setSelectedLogo] = useState<'left' | 'right' | null>(null);
  const [resizingLogo, setResizingLogo] = useState<'left' | 'right' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(64);

  // Drag & drop file onto banner state
  const [isDraggingOverBanner, setIsDraggingOverBanner] = useState(false);
  const [dragDropTarget, setDragDropTarget] = useState<'left' | 'right' | 'banner'>('banner');

  // Active Header fallback
  const activeHeader: HeaderConfig = headerConfig || instructor.header_config || {
    show_logo: true,
    logo_width: 64,
    show_right_logo: true,
    right_logo_width: 64,
    institute_name_gu: instructor.iti_name,
    institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
    department_subtitle: 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર',
    address: instructor.institution_address || 'ગુજરાત',
    ref_prefix: instructor.outward_code_prefix || 'ઔતાસં/તલમ/૨૦૨૫',
    banner_border_style: 'double',
  };

  const leftWidth = activeHeader.logo_width || 64;
  const rightWidth = activeHeader.right_logo_width || 64;

  // Measure container width for responsive auto-fit scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Sync content into editable div without resetting cursor when not actively typing
  useEffect(() => {
    if (editorRef.current && !previewMerged) {
      if (editorRef.current.innerHTML !== contentHtml && !isUpdatingRef.current) {
        editorRef.current.innerHTML = contentHtml;
      }
    }
  }, [contentHtml, previewMerged]);

  const handleInput = () => {
    if (editorRef.current && !previewMerged) {
      isUpdatingRef.current = true;
      onContentChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  // Handle image file upload (from device or drop)
  const processImageFile = useCallback(
    (file: File, target: 'left' | 'right') => {
      if (!file.type.startsWith('image/')) {
        alert('કૃપા કરીને માન્ય ઇમેજ ફાઇલ (PNG, JPG, SVG, WebP) પસંદ કરો.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl && onHeaderChange) {
          if (target === 'left') {
            onHeaderChange({
              ...activeHeader,
              logo_url: dataUrl,
              show_logo: true,
            });
            setSelectedLogo('left');
          } else {
            onHeaderChange({
              ...activeHeader,
              right_logo_url: dataUrl,
              show_right_logo: true,
            });
            setSelectedLogo('right');
          }
        }
      };
      reader.readAsDataURL(file);
    },
    [activeHeader, onHeaderChange]
  );

  // Mouse drag listener for corner resize handle
  const handleResizeMouseDown = (e: React.MouseEvent, target: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    setResizingLogo(target);
    setDragStartX(e.clientX);
    const current = target === 'left' ? leftWidth : rightWidth;
    setStartWidth(current);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingLogo || !onHeaderChange) return;
      const delta = e.clientX - dragStartX;
      const newWidth = Math.max(32, Math.min(220, startWidth + delta));
      if (resizingLogo === 'left') {
        onHeaderChange({ ...activeHeader, logo_width: newWidth });
      } else {
        onHeaderChange({ ...activeHeader, right_logo_width: newWidth });
      }
    };
    const handleMouseUp = () => {
      if (resizingLogo) setResizingLogo(null);
    };
    if (resizingLogo) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingLogo, dragStartX, startWidth, activeHeader, onHeaderChange, leftWidth, rightWidth]);

  // Click outside to deselect logo
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.logo-selection-container') && !target.closest('.logo-control-bar')) {
        setSelectedLogo(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Drag and drop event handlers for the top banner
  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverBanner(true);
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverBanner(false);
    }
  };

  const handleBannerDrop = (e: React.DragEvent, slot?: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverBanner(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (slot) {
        processImageFile(file, slot);
      } else {
        // Drop on banner: if dropped on right half, set right logo; else left logo
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const target = x > rect.width / 2 ? 'right' : 'left';
        processImageFile(file, target);
      }
    }
  };

  // Swap Left and Right logos
  const handleSwapLogos = () => {
    if (!onHeaderChange) return;
    onHeaderChange({
      ...activeHeader,
      logo_url: activeHeader.right_logo_url,
      right_logo_url: activeHeader.logo_url,
      logo_width: activeHeader.right_logo_width || 64,
      right_logo_width: activeHeader.logo_width || 64,
    });
  };

  // Margin padding mappings
  const marginPaddingClass = {
    normal: 'p-8 sm:p-12', // approx 20mm
    narrow: 'p-5 sm:p-8',   // approx 12mm
    wide: 'p-10 sm:p-16',   // approx 25mm
  }[pageMargin];

  // A4 standard pixel dimension reference at 96 DPI:
  // Portrait: 794px x 1123px (210mm x 297mm)
  // Landscape: 1123px x 794px (297mm x 210mm)
  const isLandscape = orientation === 'landscape';
  const BASE_A4_WIDTH = isLandscape ? 1123 : 794;
  const BASE_A4_HEIGHT = isLandscape ? 794 : 1123;

  // Auto-fit scale factor for mobile viewports
  const availableWidth = Math.max(280, containerWidth - 24);
  const autoFitScale = availableWidth < BASE_A4_WIDTH ? availableWidth / BASE_A4_WIDTH : 1;
  const effectiveScale = Number((zoomLevel * autoFitScale).toFixed(3));
  const isScaledDown = effectiveScale < 0.95;

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center py-4 px-1 sm:px-2 overflow-x-auto">
      {/* Hidden File Pickers for Device Upload */}
      <input
        type="file"
        ref={leftFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0], 'left');
          }
        }}
      />
      <input
        type="file"
        ref={rightFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0], 'right');
          }
        }}
      />

      {/* Mobile Auto-Fit Scale Status Indicator & Quick Zoom Toggle */}
      {isScaledDown && (
        <button
          type="button"
          onClick={() => {
            if (onZoomChange) {
              onZoomChange(zoomLevel === 1 ? 0.75 : 1);
            }
          }}
          className="mb-3 px-3 py-1 bg-white/95 hover:bg-white border border-blue-200 hover:border-blue-400 rounded-full text-[11px] text-blue-800 font-medium flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title="ટેપ કરીને ઝૂમ સ્વિચ કરો (Tap to switch between Page View and 100% Zoom)"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Mobile Auto-Fit: {Math.round(effectiveScale * 100)}%</span>
          <span className="text-blue-600 font-bold underline ml-1 text-[10px]">
            {zoomLevel === 1 ? 'ફિટ વ્યુ' : '100% ઝૂમ'}
          </span>
        </button>
      )}

      {/* Sized Wrapper to prevent layout collapse when scaling via transform */}
      <div
        className="relative flex justify-center transition-all duration-100"
        style={{
          width: `${Math.round(BASE_A4_WIDTH * effectiveScale)}px`,
          minHeight: `${Math.round(BASE_A4_HEIGHT * effectiveScale)}px`,
        }}
      >
        <div
          className="relative transition-transform duration-100 flex flex-col items-center origin-top"
          style={{
            transform: `scale(${effectiveScale})`,
            width: `${BASE_A4_WIDTH}px`,
          }}
        >
          {/* Horizontal Top Ruler */}
          {showRuler && (
            <div
              className="h-6 bg-[#f1f3f6] border border-[#d1d5db] border-b-0 flex items-end px-10 text-[9px] font-mono text-slate-500 select-none shadow-2xs"
              style={{ width: `${BASE_A4_WIDTH}px` }}
            >
              <div className="w-full flex justify-between">
                {Array.from({ length: isLandscape ? 30 : 21 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="leading-none mb-0.5">{i % 2 === 0 ? i : ''}</span>
                    <div className={`w-px bg-slate-400 ${i % 2 === 0 ? 'h-2' : 'h-1'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* A4 Page Container */}
          <div
            id="notice-a4-sheet"
            className={`bg-white text-slate-900 shadow-xl border border-slate-300 relative flex flex-col justify-between a4-printable-document ${marginPaddingClass} ${
              showMarginGuides ? 'ring-1 ring-dashed ring-blue-300 ring-offset-4' : ''
            }`}
            style={{
              width: `${BASE_A4_WIDTH}px`,
              minHeight: `${BASE_A4_HEIGHT}px`,
              fontFamily: fontFamily,
              fontSize: `${fontSize}pt`,
            }}
          >
            {/* ========================================================= */}
            {/* 1. TOP EDITABLE LETTERHEAD BANNER */}
            {/* ========================================================= */}
            {showLetterhead && (
              <div
                onDragOver={handleBannerDragOver}
                onDragLeave={handleBannerDragLeave}
                onDrop={(e) => handleBannerDrop(e)}
                className={`mb-6 relative transition-all group ${
                  activeHeader.banner_border_style === 'solid'
                    ? 'border-b-2 border-slate-800 pb-3'
                    : activeHeader.banner_border_style === 'dashed'
                    ? 'border-b-2 border-dashed border-slate-700 pb-3'
                    : activeHeader.banner_border_style === 'none'
                    ? 'pb-2'
                    : 'border-b-4 border-double border-slate-900 pb-3'
                } ${
                  isDraggingOverBanner
                    ? 'ring-2 ring-blue-600 bg-blue-50/60 rounded-xl p-2'
                    : ''
                }`}
              >
                {/* Drag & Drop Overlay Prompter */}
                {isDraggingOverBanner && (
                  <div className="absolute inset-0 bg-blue-600/10 border-2 border-dashed border-blue-600 rounded-xl flex items-center justify-center z-40 backdrop-blur-xs">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-2 animate-bounce">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>સંસ્થાનો લોગો સેટ કરવા ઇમેજ અહીં છોડો (Drop image here)</span>
                    </div>
                  </div>
                )}

                {/* Edit Mode Top Banner Quick Toolbar */}
                {!previewMerged && (
                  <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-t-lg shadow-md z-30 select-none">
                    <span className="text-blue-300">ટોપ બેનર એડિટર:</span>
                    <button
                      type="button"
                      onClick={() => leftFileInputRef.current?.click()}
                      className="hover:text-blue-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-slate-800"
                      title="Upload Left Logo from Computer"
                    >
                      <Upload className="w-3 h-3" /> ડાબો લોગો
                    </button>
                    <button
                      type="button"
                      onClick={() => rightFileInputRef.current?.click()}
                      className="hover:text-blue-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-slate-800"
                      title="Upload Right Logo from Computer"
                    >
                      <Upload className="w-3 h-3" /> જમણો લોગો
                    </button>
                    <button
                      type="button"
                      onClick={handleSwapLogos}
                      className="hover:text-blue-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-slate-800"
                      title="Swap Left and Right Logos"
                    >
                      <RefreshCw className="w-3 h-3" /> સ્વેપ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onHeaderChange?.({
                          ...activeHeader,
                          banner_border_style:
                            activeHeader.banner_border_style === 'double'
                              ? 'solid'
                              : activeHeader.banner_border_style === 'solid'
                              ? 'dashed'
                              : activeHeader.banner_border_style === 'dashed'
                              ? 'none'
                              : 'double',
                        })
                      }
                      className="hover:text-blue-300 px-1 py-0.5 rounded hover:bg-slate-800"
                      title="Toggle Border Style"
                    >
                      બોર્ડર
                    </button>
                  </div>
                )}

                {/* Banner Content Layout (Left Logo + Editable Center Text + Right Logo) */}
                <div className="flex items-center justify-between gap-3">
                  {/* ---------------------------------------------------- */}
                  {/* LEFT LOGO / EMBLEM SLOT */}
                  {/* ---------------------------------------------------- */}
                  <div
                    className="logo-selection-container relative shrink-0 flex items-center justify-center self-center"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => handleBannerDrop(e, 'left')}
                  >
                    <div
                      onClick={() => !previewMerged && setSelectedLogo('left')}
                      className={`relative group/left cursor-pointer transition-all rounded-lg overflow-visible flex items-center justify-center ${
                        selectedLogo === 'left' && !previewMerged
                          ? 'ring-2 ring-blue-600 ring-offset-2'
                          : 'hover:ring-1 hover:ring-blue-400 hover:ring-offset-1'
                      }`}
                      style={{ width: `${leftWidth}px`, height: `${leftWidth}px` }}
                      title="ક્લિક કરીને સાઈઝ બદલો અથવા નવી ઇમેજ ડ્રોપ કરો"
                    >
                      {activeHeader.logo_url ? (
                        <img
                          src={activeHeader.logo_url}
                          alt="Left Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center bg-slate-50 shadow-2xs">
                          <div className="text-[8px] font-bold tracking-tight text-slate-800 uppercase leading-none">
                            GOVT OF
                          </div>
                          <div className="text-sm font-black text-blue-900 leading-tight">ITI</div>
                          <div className="text-[7px] font-bold text-slate-700 uppercase leading-none">
                            GUJARAT
                          </div>
                        </div>
                      )}

                      {/* Quick Hover Overlay to upload or remove */}
                      {!previewMerged && (
                        <div className="absolute inset-0 bg-black/40 text-white rounded-lg opacity-0 group-hover/left:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[9px] font-bold p-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              leftFileInputRef.current?.click();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 rounded shadow-xs"
                          >
                            બદલો
                          </button>
                          <span className="text-[8px] text-white/90">ડ્રેગ & ડ્રોપ</span>
                        </div>
                      )}

                      {/* Corner Drag-to-Resize Handle */}
                      {selectedLogo === 'left' && !previewMerged && (
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-se-resize shadow-md flex items-center justify-center z-30 hover:scale-125 transition-transform"
                          title="સાઈઝ બદલવા ખેંચો (Drag to resize)"
                        />
                      )}
                    </div>

                    {/* Floating Resize & Settings Popover Toolbar for Left Logo */}
                    {selectedLogo === 'left' && !previewMerged && (
                      <div className="logo-control-bar absolute top-full left-0 mt-2 bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl z-50 min-w-[210px] border border-slate-700 animate-in fade-in zoom-in-95 duration-100 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                          <span className="font-bold text-[11px] text-blue-300">
                            ડાબો લોગો સાઈઝ: {leftWidth}px
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedLogo(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Interactive Width Slider */}
                        <div className="mb-2">
                          <input
                            type="range"
                            min="32"
                            max="180"
                            value={leftWidth}
                            onChange={(e) =>
                              onHeaderChange?.({
                                ...activeHeader,
                                logo_width: Number(e.target.value),
                              })
                            }
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-4 gap-1 mb-2">
                          {[48, 64, 80, 100].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                onHeaderChange?.({
                                  ...activeHeader,
                                  logo_width: sz,
                                })
                              }
                              className={`py-1 text-[10px] font-mono rounded ${
                                leftWidth === sz
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {sz}px
                            </button>
                          ))}
                        </div>

                        {/* Actions: Upload new / Reset default */}
                        <div className="flex items-center gap-1 pt-1.5 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => leftFileInputRef.current?.click()}
                            className="grow flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-1 rounded text-[10px] font-bold"
                          >
                            <Upload className="w-3 h-3" /> ડિવાઇસમાંથી અપલોડ
                          </button>
                          {activeHeader.logo_url && (
                            <button
                              type="button"
                              onClick={() =>
                                onHeaderChange?.({
                                  ...activeHeader,
                                  logo_url: undefined,
                                })
                              }
                              className="p-1 bg-red-900/80 hover:bg-red-700 text-red-200 rounded"
                              title="ડિફોલ્ટ લોગો રીસેટ કરો"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* EDITABLE CENTER TEXT (Department, Institute, Subtitle) */}
                  {/* ---------------------------------------------------- */}
                  <div className="text-center grow px-2 select-text">
                    {previewMerged ? (
                      /* Live Merged Mode: Pure Typographic Display */
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-slate-600 tracking-wider">
                          {activeHeader.department_subtitle ||
                            'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર'}
                        </div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif">
                          {activeHeader.institute_name_gu || instructor.iti_name}
                        </h1>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          {activeHeader.institute_name_en ||
                            'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}
                        </div>
                        <div className="text-xs font-medium text-slate-600">
                          {activeHeader.contact_info ||
                            `${instructor.trade} • ${instructor.batch || '૨૦૨૫-૨૦૨૬'} (${
                              instructor.unit || 'Unit A'
                            })`}
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          {activeHeader.address || instructor.institution_address || ''}
                          {instructor.phone && ` • ફોન: ${instructor.phone}`}
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode: Direct In-Place Click-to-Edit Text Elements */
                      <div className="space-y-0.5">
                        {/* 1. Department Subtitle */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent || '';
                            onHeaderChange?.({ ...activeHeader, department_subtitle: val });
                          }}
                          className="text-xs font-semibold text-slate-600 tracking-wider hover:bg-blue-50/80 hover:outline-dashed hover:outline-1 hover:outline-blue-400 rounded px-1.5 py-0.5 cursor-text transition-all focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          title="ક્લિક કરીને ખાતાનું નામ બદલો (Click to edit department name)"
                        >
                          {activeHeader.department_subtitle ||
                            'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર'}
                        </div>

                        {/* 2. Institute Name in Gujarati */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent || '';
                            onHeaderChange?.({ ...activeHeader, institute_name_gu: val });
                          }}
                          className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif hover:bg-blue-50/80 hover:outline-dashed hover:outline-1 hover:outline-blue-400 rounded px-2 py-0.5 cursor-text transition-all focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          title="ક્લિક કરીને સંસ્થાનું ગુજરાતી નામ બદલો (Click to edit Institute Gujarati Name)"
                        >
                          {activeHeader.institute_name_gu || instructor.iti_name}
                        </div>

                        {/* 3. Institute Name in English */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent || '';
                            onHeaderChange?.({ ...activeHeader, institute_name_en: val });
                          }}
                          className="text-xs font-bold text-slate-700 uppercase tracking-wide hover:bg-blue-50/80 hover:outline-dashed hover:outline-1 hover:outline-blue-400 rounded px-1.5 py-0.5 cursor-text transition-all focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          title="ક્લિક કરીને Institute Name (English) બદલો"
                        >
                          {activeHeader.institute_name_en ||
                            'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}
                        </div>

                        {/* 4. Trade / Batch / Subline */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent || '';
                            onHeaderChange?.({ ...activeHeader, contact_info: val });
                          }}
                          className="text-xs font-medium text-slate-600 hover:bg-blue-50/80 hover:outline-dashed hover:outline-1 hover:outline-blue-400 rounded px-1.5 py-0.5 cursor-text transition-all focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          title="ક્લિક કરીને ટ્રેડ / બેચ / યુનિટ સબ-ટાઇટલ બદલો"
                        >
                          {activeHeader.contact_info ||
                            `${instructor.trade} • ${instructor.batch || '૨૦૨૫-૨૦૨૬'} (${
                              instructor.unit || 'Unit A'
                            })`}
                        </div>

                        {/* 5. Address & Phone Contact */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.textContent || '';
                            onHeaderChange?.({ ...activeHeader, address: val });
                          }}
                          className="text-[11px] text-slate-500 font-sans hover:bg-blue-50/80 hover:outline-dashed hover:outline-1 hover:outline-blue-400 rounded px-1.5 py-0.5 cursor-text transition-all focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                          title="ક્લિક કરીને સંસ્થાનું સરનામું બદલો (Click to edit address)"
                        >
                          {activeHeader.address ||
                            instructor.institution_address ||
                            'સંસ્થાનું સરનામું...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* RIGHT LOGO / EMBLEM SLOT */}
                  {/* ---------------------------------------------------- */}
                  <div
                    className="logo-selection-container relative shrink-0 flex items-center justify-center self-center"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => handleBannerDrop(e, 'right')}
                  >
                    <div
                      onClick={() => !previewMerged && setSelectedLogo('right')}
                      className={`relative group/right cursor-pointer transition-all rounded-lg overflow-visible flex items-center justify-center ${
                        selectedLogo === 'right' && !previewMerged
                          ? 'ring-2 ring-blue-600 ring-offset-2'
                          : 'hover:ring-1 hover:ring-blue-400 hover:ring-offset-1'
                      }`}
                      style={{ width: `${rightWidth}px`, height: `${rightWidth}px` }}
                      title="જમણો લોગો: ક્લિક કરીને સાઈઝ બદલો અથવા ઇમેજ ડ્રોપ કરો"
                    >
                      {activeHeader.right_logo_url ? (
                        <img
                          src={activeHeader.right_logo_url}
                          alt="Right Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center bg-blue-50/50 shadow-2xs">
                          <div className="text-[7px] font-bold text-blue-900 uppercase leading-none">Skill</div>
                          <div className="text-xs font-black text-orange-600 leading-tight">
                            India
                          </div>
                          <div className="text-[6px] font-bold text-slate-700 leading-none">કૌશલ ભારત</div>
                        </div>
                      )}

                      {/* Quick Hover Overlay */}
                      {!previewMerged && (
                        <div className="absolute inset-0 bg-black/40 text-white rounded-lg opacity-0 group-hover/right:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[9px] font-bold p-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              rightFileInputRef.current?.click();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 rounded shadow-xs"
                          >
                            બદલો
                          </button>
                          <span className="text-[8px] text-white/90">ડ્રેગ & ડ્રોપ</span>
                        </div>
                      )}

                      {/* Corner Drag-to-Resize Handle */}
                      {selectedLogo === 'right' && !previewMerged && (
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-se-resize shadow-md flex items-center justify-center z-30 hover:scale-125 transition-transform"
                          title="સાઈઝ બદલવા ખેંચો (Drag to resize)"
                        />
                      )}
                    </div>

                    {/* Floating Resize & Settings Popover Toolbar for Right Logo */}
                    {selectedLogo === 'right' && !previewMerged && (
                      <div className="logo-control-bar absolute top-full right-0 mt-2 bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl z-50 min-w-[210px] border border-slate-700 animate-in fade-in zoom-in-95 duration-100 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                          <span className="font-bold text-[11px] text-blue-300">
                            જમણો લોગો સાઈઝ: {rightWidth}px
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedLogo(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Interactive Width Slider */}
                        <div className="mb-2">
                          <input
                            type="range"
                            min="32"
                            max="180"
                            value={rightWidth}
                            onChange={(e) =>
                              onHeaderChange?.({
                                ...activeHeader,
                                right_logo_width: Number(e.target.value),
                              })
                            }
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-4 gap-1 mb-2">
                          {[48, 64, 80, 100].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                onHeaderChange?.({
                                  ...activeHeader,
                                  right_logo_width: sz,
                                })
                              }
                              className={`py-1 text-[10px] font-mono rounded ${
                                rightWidth === sz
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {sz}px
                            </button>
                          ))}
                        </div>

                        {/* Actions: Upload new / Reset default */}
                        <div className="flex items-center gap-1 pt-1.5 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => rightFileInputRef.current?.click()}
                            className="grow flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-1 rounded text-[10px] font-bold"
                          >
                            <Upload className="w-3 h-3" /> ડિવાઇસમાંથી અપલોડ
                          </button>
                          {activeHeader.right_logo_url && (
                            <button
                              type="button"
                              onClick={() =>
                                onHeaderChange?.({
                                  ...activeHeader,
                                  right_logo_url: undefined,
                                })
                              }
                              className="p-1 bg-red-900/80 hover:bg-red-700 text-red-200 rounded"
                              title="ડિફોલ્ટ લોગો રીસેટ કરો"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. DOCUMENT BODY AREA */}
            {/* ========================================================= */}
            <div className="grow">
              {previewMerged ? (
                // Live Rendered Merged HTML
                <div
                  className="prose max-w-none text-slate-900 leading-relaxed outline-none"
                  dangerouslySetInnerHTML={{ __html: mergedHtml }}
                />
              ) : (
                // Editable Template Canvas
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  suppressContentEditableWarning
                  onDragOver={(e) => {
                    if (
                      e.dataTransfer.types.includes('application/x-merge-tag') ||
                      e.dataTransfer.types.includes('text/plain')
                    ) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }
                  }}
                  onDrop={(e) => {
                    const tag =
                      e.dataTransfer.getData('application/x-merge-tag') ||
                      e.dataTransfer.getData('text/plain');
                    if (tag && tag.startsWith('{{') && tag.endsWith('}}')) {
                      e.preventDefault();
                      if (document.caretRangeFromPoint) {
                        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                        if (range) {
                          const sel = window.getSelection();
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                          document.execCommand('insertText', false, tag);
                          handleInput();
                        }
                      }
                    }
                  }}
                  className="outline-none min-h-[420px] leading-relaxed text-slate-900 focus:ring-0 select-text"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}pt`,
                  }}
                />
              )}
            </div>

            {/* ========================================================= */}
            {/* 3. BOTTOM OFFICIAL SIGNATURE & STAMP OVERLAY */}
            {/* ========================================================= */}
            {showSignature && (
              <div className="mt-10 pt-4 border-t border-slate-300 flex items-end justify-between select-none">
                {/* Left: ITI Seal Stamp Placeholder */}
                <div className="border border-dashed border-slate-400 p-2 rounded text-[10px] text-slate-500 max-w-[170px] bg-slate-50/60">
                  <div className="font-bold text-slate-700">સંસ્થાનું ગોળ સીલ (ITI Seal)</div>
                  <div className="text-[9px] text-slate-400 mt-4 text-center">
                    (સંસ્થાનો સત્તાવાર સિક્કો)
                  </div>
                </div>

                {/* Right: Instructor Designation & Signature Line */}
                <div className="text-right space-y-1">
                  <div className="h-10"></div>
                  <div className="border-t border-slate-700 pt-1 font-bold text-xs text-slate-900">
                    ({instructor.name})
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    ક્રાફ્ટ ઇન્સ્ટ્રક્ટર (Craft Instructor)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    વ્યવસાય: {instructor.trade} ({instructor.unit || 'Unit A'})
                  </div>
                  <div className="text-[10px] text-slate-500">{activeHeader.institute_name_gu}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
