import React, { useRef, useEffect, useState } from 'react';
import { Instructor, Trainee, AttendanceRecord } from '../../types';
import { Building2, Stamp, CheckCircle, Smartphone } from 'lucide-react';

interface A4CanvasProps {
  contentHtml: string;
  onContentChange: (html: string) => void;
  fontFamily: string;
  fontSize: string;
  showLetterhead: boolean;
  showSignature: boolean;
  pageMargin: 'normal' | 'narrow' | 'wide';
  showRuler: boolean;
  showMarginGuides: boolean;
  zoomLevel: number;
  previewMerged: boolean;
  mergedHtml: string;
  instructor: Instructor;
}

export default function A4Canvas({
  contentHtml,
  onContentChange,
  fontFamily,
  fontSize,
  showLetterhead,
  showSignature,
  pageMargin,
  showRuler,
  showMarginGuides,
  zoomLevel,
  previewMerged,
  mergedHtml,
  instructor,
}: A4CanvasProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState<number>(850);

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

  // Margin padding mappings
  const marginPaddingClass = {
    normal: 'p-8 sm:p-12', // approx 20mm
    narrow: 'p-5 sm:p-8',   // approx 12mm
    wide: 'p-10 sm:p-16',   // approx 25mm
  }[pageMargin];

  // A4 standard pixel dimension reference at 96 DPI: 210mm x 297mm -> 794px x 1123px
  const BASE_A4_WIDTH = 794;
  const BASE_A4_HEIGHT = 1123;

  // Auto-fit scale factor for mobile viewports
  // When viewport is smaller than A4 document width (794px), scale down proportionally
  const availableWidth = Math.max(280, containerWidth - 24);
  const autoFitScale = availableWidth < BASE_A4_WIDTH ? availableWidth / BASE_A4_WIDTH : 1;
  const effectiveScale = Number((zoomLevel * autoFitScale).toFixed(3));
  const isScaledDown = effectiveScale < 0.95;

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center py-4 px-1 sm:px-2 overflow-x-auto">
      {/* Mobile Auto-Fit Scale Status Indicator */}
      {isScaledDown && (
        <div className="mb-3 px-3 py-1 bg-white/90 border border-blue-200 rounded-full text-[11px] text-blue-800 font-medium flex items-center gap-1.5 shadow-2xs">
          <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Mobile Auto-Fit: {Math.round(effectiveScale * 100)}%</span>
          <span className="text-slate-400 hidden xs:inline">• Layout preserved at 210mm</span>
        </div>
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
            <div className="w-[794px] h-6 bg-[#f1f3f6] border border-[#d1d5db] border-b-0 flex items-end px-10 text-[9px] font-mono text-slate-500 select-none shadow-2xs">
              <div className="w-full flex justify-between">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="leading-none mb-0.5">{i % 2 === 0 ? i : ''}</span>
                    <div className={`w-px bg-slate-400 ${i % 2 === 0 ? 'h-2' : 'h-1'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* A4 Page Container (210mm x 297mm standard ratio = 794px x 1123px) */}
          <div
            id="notice-a4-sheet"
            className={`w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl border border-slate-300 relative flex flex-col justify-between a4-printable-document ${marginPaddingClass} ${
              showMarginGuides ? 'ring-1 ring-dashed ring-blue-300 ring-offset-4' : ''
            }`}
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}pt`,
            }}
          >
          {/* Top Letterhead Overlay */}
          {showLetterhead && (
            <div className="mb-6 border-b-2 border-slate-800 pb-3 select-none">
              <div className="flex items-center justify-between gap-4">
                {/* Government ITI Emblem Graphic */}
                <div className="w-16 h-16 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-slate-50">
                  <div className="text-[9px] font-bold tracking-tight text-slate-800 uppercase leading-none">
                    GOVT OF
                  </div>
                  <div className="text-base font-black text-blue-900 leading-tight">ITI</div>
                  <div className="text-[8px] font-bold text-slate-700 uppercase leading-none">
                    GUJARAT
                  </div>
                </div>

                {/* Header Text in Regional & English */}
                <div className="text-center grow">
                  <div className="text-xs font-semibold text-slate-600 tracking-wider">
                    શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif mt-0.5">
                    {instructor.iti_name}
                  </h1>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    Industrial Training Institute • વ્યવસાય: {instructor.trade} ({instructor.unit})
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                    ઈમેલ: {instructor.email} {instructor.phone && `• ફોન: ${instructor.phone}`}
                  </div>
                </div>

                {/* Skill India emblem */}
                <div className="w-16 h-16 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-blue-50/50">
                  <div className="text-[8px] font-bold text-blue-800 uppercase">Skill</div>
                  <div className="text-xs font-black text-orange-600">India</div>
                  <div className="text-[7px] text-slate-600">કૌશલ ભારત</div>
                </div>
              </div>
            </div>
          )}

          {/* Document Body Area */}
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
                className="outline-none min-h-[420px] leading-relaxed text-slate-900 focus:ring-0"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}pt`,
                }}
              />
            )}
          </div>

          {/* Bottom Official Signature & Stamp Overlay */}
          {showSignature && (
            <div className="mt-10 pt-4 border-t border-slate-300 flex items-end justify-between select-none">
              {/* Left: Dispatch Outward Stamp placeholder */}
              <div className="border border-dashed border-slate-400 p-2 rounded text-[10px] text-slate-500 max-w-[170px] bg-slate-50/60">
                <div className="font-bold text-slate-700">સંસ્થાનું ગોળ સીલ (ITI Seal)</div>
                <div className="text-[9px] text-slate-400 mt-4 text-center">
                  [ સત્તાવાર સિક્કો અહીં લગાવો ]
                </div>
              </div>

              {/* Center: System Dispatch Verification Badge */}
              <div className="text-center text-[10px] text-slate-400">
                <div className="inline-flex items-center gap-1 font-mono text-[9px] text-slate-500">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Authorized Administrative Notice</span>
                </div>
              </div>

              {/* Right: Instructor Signature Line */}
              <div className="text-center min-w-[210px]">
                <div className="h-10 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-blue-900 text-sm opacity-85">
                    {instructor.name}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-xs text-slate-900">{instructor.name}</div>
                  <div className="text-[11px] text-slate-700">{instructor.designation}</div>
                  <div className="text-[10px] text-slate-500">
                    {instructor.trade} • {instructor.iti_name.split('(')[0]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
