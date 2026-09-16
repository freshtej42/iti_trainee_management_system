import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table,
  Sparkles,
  CheckCheck,
  Eye,
  FileCode,
  Sliders,
  Type,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Stamp,
  Printer,
  Save,
  RotateCcw,
  RotateCw,
  Download,
  Loader2,
} from 'lucide-react';
import VariableDropdown from './VariableDropdown';

interface WordRibbonProps {
  activeTab: 'home' | 'insert' | 'layout' | 'review' | 'view';
  setActiveTab: (tab: 'home' | 'insert' | 'layout' | 'review' | 'view') => void;
  // Font & Style
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  onExecuteCommand: (command: string, value?: string) => void;
  onInsertTag: (tag: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  // Layout toggles
  showLetterhead: boolean;
  setShowLetterhead: (show: boolean) => void;
  showSignature: boolean;
  setShowSignature: (show: boolean) => void;
  pageMargin: 'normal' | 'narrow' | 'wide';
  setPageMargin: (m: 'normal' | 'narrow' | 'wide') => void;
  // View options
  showRuler: boolean;
  setShowRuler: (show: boolean) => void;
  showMarginGuides: boolean;
  setShowMarginGuides: (show: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  previewMerged: boolean;
  setPreviewMerged: (merged: boolean) => void;
  // AI Actions
  onTriggerAiCommentary: () => void;
  onTriggerGrammarCheck: () => void;
  isAiLoading: boolean;
  // Save & Print & PDF Export
  onSaveTemplate: () => void;
  onPrintDocument: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
}

export default function WordRibbon({
  activeTab,
  setActiveTab,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  onExecuteCommand,
  onInsertTag,
  onInsertTable,
  showLetterhead,
  setShowLetterhead,
  showSignature,
  setShowSignature,
  pageMargin,
  setPageMargin,
  showRuler,
  setShowRuler,
  showMarginGuides,
  setShowMarginGuides,
  zoomLevel,
  setZoomLevel,
  previewMerged,
  setPreviewMerged,
  onTriggerAiCommentary,
  onTriggerGrammarCheck,
  isAiLoading,
  onSaveTemplate,
  onPrintDocument,
  onExportPdf,
  isExportingPdf = false,
}: WordRibbonProps) {
  const [showTablePicker, setShowTablePicker] = useState(false);

  return (
    <div className="bg-[#f3f5f8] border-b border-[#d2d6dc] select-none text-slate-800">
      {/* Ribbon Top Tabs (Word 2021 Blue Theme) */}
      <div className="flex items-center justify-between px-2 sm:px-3 pt-1 border-b border-[#e2e5e9] bg-[#f8f9fa] overflow-x-auto">
        <div className="flex space-x-0.5 shrink-0">
          {(
            [
              { id: 'home', label: 'Home' },
              { id: 'insert', label: 'Insert' },
              { id: 'layout', label: 'Layout' },
              { id: 'review', label: 'Review (AI)' },
              { id: 'view', label: 'View' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t transition-all whitespace-nowrap min-h-[36px] ${
                activeTab === tab.id
                  ? 'bg-white text-[#185abd] border-t-2 border-[#185abd] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#e9edf2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Access Toolbar on right */}
        <div className="flex items-center gap-1.5 pb-1 shrink-0 ml-2">
          <button
            onClick={() => onExecuteCommand('undo')}
            className="p-1 rounded hover:bg-slate-200 text-slate-600"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onExecuteCommand('redo')}
            className="p-1 rounded hover:bg-slate-200 text-slate-600"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <button
            onClick={onSaveTemplate}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-2xs transition-colors"
            title="Save Template to System"
          >
            <Save className="w-3.5 h-3.5 text-blue-700" />
            <span>Save</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors disabled:opacity-50"
            title="Download this Notice as A4 PDF"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export PDF (A4)</span>
          </button>

          {/* Print Button */}
          <button
            onClick={onPrintDocument}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-[#185abd] hover:bg-[#104899] text-white shadow-xs transition-colors"
            title="Print Document in A4 format"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Ribbon Toolbars Content */}
      <div className="px-4 py-2 bg-white flex items-center gap-3 overflow-x-auto min-h-[58px]">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Font Family & Size Section */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500 w-44"
              >
                <option value="'Noto Sans Gujarati', sans-serif">Noto Sans Gujarati (ગુજરાતી)</option>
                <option value="'Noto Serif Gujarati', serif">Noto Serif Gujarati</option>
                <option value="'Noto Sans Devanagari', sans-serif">Noto Sans Devanagari (हिन्दी)</option>
                <option value="'Segoe UI', sans-serif">Segoe UI (Default)</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
              </select>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500 w-16"
              >
                {['10', '11', '12', '13', '14', '16', '18', '20', '24', '28', '32'].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz} pt
                  </option>
                ))}
              </select>
            </div>

            {/* Character Styles: B, I, U, S */}
            <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
              <button
                onClick={() => onExecuteCommand('bold')}
                className="p-1.5 rounded hover:bg-slate-100 font-bold text-xs"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('italic')}
                className="p-1.5 rounded hover:bg-slate-100 text-xs"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('underline')}
                className="p-1.5 rounded hover:bg-slate-100 text-xs"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('strikeThrough')}
                className="p-1.5 rounded hover:bg-slate-100 text-xs text-slate-600"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            {/* Paragraph Alignment & Lists */}
            <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
              <button
                onClick={() => onExecuteCommand('justifyLeft')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('justifyCenter')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('justifyRight')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('justifyFull')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-0.5"></div>
              <button
                onClick={() => onExecuteCommand('insertUnorderedList')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Bulleted List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('insertOrderedList')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('indent')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Increase Indent"
              >
                <Indent className="w-4 h-4" />
              </button>
              <button
                onClick={() => onExecuteCommand('outdent')}
                className="p-1.5 rounded hover:bg-slate-100"
                title="Decrease Indent"
              >
                <Outdent className="w-4 h-4" />
              </button>
            </div>

            {/* Field Tag Insert Shortcut */}
            <div className="flex items-center gap-2">
              <VariableDropdown onInsertTag={onInsertTag} />
            </div>
          </>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <>
            {/* Dynamic Merge Tag Dropdown */}
            <div className="pr-3 border-r border-slate-200 flex items-center gap-2">
              <VariableDropdown onInsertTag={onInsertTag} />
              <span className="text-xs text-slate-500">Insert trainee, attendance & notice tags</span>
            </div>

            {/* Table Insertion */}
            <div className="relative pr-3 border-r border-slate-200">
              <button
                onClick={() => setShowTablePicker(!showTablePicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded hover:bg-slate-100 border border-slate-200"
              >
                <Table className="w-4 h-4 text-blue-700" />
                <span>Insert Table</span>
              </button>

              {showTablePicker && (
                <div className="absolute left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-xs font-bold text-slate-700 mb-2">Preset Tables:</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onInsertTable(3, 3);
                        setShowTablePicker(false);
                      }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-900"
                    >
                      3 × 3 Grid Table
                    </button>
                    <button
                      onClick={() => {
                        onInsertTable(4, 2);
                        setShowTablePicker(false);
                      }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-900"
                    >
                      2-Column Summary Form
                    </button>
                    <button
                      onClick={() => {
                        onInsertTable(2, 4);
                        setShowTablePicker(false);
                      }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-900"
                    >
                      Attendance Metrics Row
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Line & Seal */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onExecuteCommand('insertHorizontalRule')}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded hover:bg-slate-100"
                title="Insert Divider Rule"
              >
                Horizontal Rule
              </button>
            </div>
          </>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <>
            {/* Margin Options */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Margins:</span>
              {(['normal', 'narrow', 'wide'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPageMargin(m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded capitalize ${
                    pageMargin === m
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m} ({m === 'normal' ? '20mm' : m === 'narrow' ? '12mm' : '25mm'})
                </button>
              ))}
            </div>

            {/* Overlays: Official Letterhead & Signature Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={showLetterhead}
                  onChange={(e) => setShowLetterhead(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>Top Letterhead Banner</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Stamp className="w-3.5 h-3.5 text-emerald-700" />
                <span>Bottom Official Signature & Stamp</span>
              </label>
            </div>
          </>
        )}

        {/* REVIEW TAB (GEMINI AI INTEGRATION) */}
        {activeTab === 'review' && (
          <>
            <div className="flex items-center gap-3">
              {/* Gemini AI Parent Commentary Generator */}
              <button
                onClick={onTriggerAiCommentary}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-xs disabled:opacity-50 transition-all"
                title="Generate polite & strict parent advisory note in Gujarati/Hindi"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Generating AI...' : 'AI Generate Parent Advisory'}</span>
              </button>

              {/* Gemini AI Regional Grammar & Vernacular Check */}
              <button
                onClick={onTriggerGrammarCheck}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-xs disabled:opacity-50 transition-all"
                title="Polishes Gujarati / Hindi administrative vocabulary"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>AI Regional Grammar Check</span>
              </button>

              <span className="text-xs text-slate-500 italic hidden sm:inline">
                Powered by Gemini 3.8 Flash • Generates official vernacular parent advisories
              </span>
            </div>
          </>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <>
            <div className="flex items-center gap-3 pr-3 border-r border-slate-200">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRuler}
                  onChange={(e) => setShowRuler(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Ruler</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMarginGuides}
                  onChange={(e) => setShowMarginGuides(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Margin Guidelines</span>
              </label>
            </div>

            {/* Live Data Merge Toggle */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <button
                onClick={() => setPreviewMerged(false)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
                  !previewMerged ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Template View</span>
              </button>
              <button
                onClick={() => setPreviewMerged(true)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
                  previewMerged ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Merged Trainee Preview</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <button
                onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))}
                className="p-1 rounded hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-semibold w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
                className="p-1 rounded hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 text-[11px] bg-slate-100 rounded hover:bg-slate-200 ml-1"
              >
                100%
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
