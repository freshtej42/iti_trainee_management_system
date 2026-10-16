import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  X,
  Building2,
  Globe,
  FileText,
  Sparkles,
  RotateCcw,
  Save,
  Check,
  ChevronDown,
  Info,
  Maximize2,
  Trash2,
  HelpCircle,
  FileSpreadsheet,
  Upload,
  Eye,
  Edit3,
} from 'lucide-react';
import { Instructor, LetterTemplate, HeaderConfig } from '../types';
import {
  LETTERHEAD_PRESETS,
  LetterheadPreset,
  renderLetterheadHtml,
} from '../utils/letterheadPresets';

export interface LetterheadEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  currentTemplate?: LetterTemplate | null;
  initialHtml?: string;
  isTemplateSpecific?: boolean;
  onSaveLetterhead?: (html: string, isTemplateSpecific: boolean) => void;
  onSaveHeaderConfig?: (newConfig: HeaderConfig) => void;
  onSaveAsGlobalDefault?: (html: string) => void;
}

export const LetterheadEditorModal: React.FC<LetterheadEditorModalProps> = ({
  isOpen,
  onClose,
  instructor,
  currentTemplate,
  initialHtml,
  isTemplateSpecific: initialIsTemplateSpecific = false,
  onSaveLetterhead,
  onSaveHeaderConfig,
  onSaveAsGlobalDefault,
}) => {
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute effective initial HTML:
  // If the user hasn't created a letterhead yet, start with a blank canvas for complete freedom
  const defaultHtml =
    initialHtml ||
    currentTemplate?.letterhead_html ||
    instructor.letterhead_html ||
    instructor.header_config?.letterhead_html ||
    '';

  const [content, setContent] = useState<string>(defaultHtml);
  const [isSpecific, setIsSpecific] = useState<boolean>(
    initialIsTemplateSpecific || Boolean(currentTemplate?.use_custom_letterhead)
  );
  const [showPresetsMenu, setShowPresetsMenu] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'editor' | 'preview'>('editor');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const incomingHtml =
        initialHtml ||
        currentTemplate?.letterhead_html ||
        instructor.letterhead_html ||
        instructor.header_config?.letterhead_html ||
        '';
      setContent(incomingHtml);
      setIsSpecific(
        initialIsTemplateSpecific || Boolean(currentTemplate?.use_custom_letterhead)
      );
      setFeedback(null);
      setActiveViewTab('editor');
    }
  }, [isOpen, initialHtml, currentTemplate, instructor, initialIsTemplateSpecific]);

  if (!isOpen) return null;

  // Insert standard starter preset if user desires
  const handleApplyPreset = (preset: LetterheadPreset) => {
    const headerConfig = instructor.header_config;
    const itiNameGu = headerConfig?.institute_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા';
    const itiNameEn = headerConfig?.institute_name_en || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE';
    const deptGu = headerConfig?.department_subtitle || 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર';
    const address = headerConfig?.address || instructor.institution_address || 'ગુજરાત રાજ્ય';
    const phone = headerConfig?.contact_info || instructor.phone || '';
    const email = instructor.email || '';
    const refPrefix = headerConfig?.ref_prefix || instructor.outward_code_prefix || 'ઔતાસં/૨૦૨૫-૨૬';
    const logoUrl = headerConfig?.show_logo !== false ? (headerConfig?.logo_url || instructor.letterhead_header_url) : undefined;
    const rightLogoUrl = headerConfig?.show_right_logo ? headerConfig?.right_logo_url : undefined;

    const html = preset.getHtml({
      itiNameGu,
      itiNameEn,
      deptGu,
      address,
      phone,
      email,
      refPrefix,
      logoUrl,
      rightLogoUrl,
    });

    setContent(html);
    if (editorRef.current) {
      editorRef.current.setContent(html);
    }
    setShowPresetsMenu(false);
    setFeedback(`✓ "${preset.name}" લેઆઉટ TinyMCE માં દાખલ કરાયું.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Start with completely blank canvas
  const handleStartBlank = () => {
    setContent('');
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    setFeedback('✓ નવો કોરો TinyMCE કેન્વાસ તૈયાર છે. તમે સીધું લખાણ, લોગો કે કોષ્ટક બનાવી શકો છો.');
    setTimeout(() => setFeedback(null), 3500);
  };

  // Upload image/logo directly and insert into TinyMCE at caret position
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('કૃપા કરીને માત્ર ફોટો ફાઇલ (JPG, PNG, WebP, SVG) પસંદ કરો.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editorRef.current) {
        editorRef.current.insertContent(
          `<img src="${dataUrl}" alt="Logo" style="max-height: 65px; max-width: 140px; object-fit: contain; vertical-align: middle; margin: 4px;" />`
        );
      } else {
        setContent((prev) => `${prev}<p><img src="${dataUrl}" alt="Logo" style="max-height: 65px; object-fit: contain;" /></p>`);
      }
      setFeedback('✓ લોગો ઇમેજ લેટરહેડમાં સફળતાપૂર્વક ઉમેરાઈ.');
      setTimeout(() => setFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Quick 3-column table inserter for classic ITI layout
  const handleInsert3ColTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 6px;">
  <tbody>
    <tr>
      <td style="width: 15%; text-align: left; vertical-align: middle; border: none; padding: 4px;">
        <div style="font-size: 11px; font-weight: bold; color: #1e3a8a; border: 1.5px dashed #93c5fd; padding: 12px 6px; text-align: center; border-radius: 8px;">[ડાબો લોગો]</div>
      </td>
      <td style="width: 70%; text-align: center; vertical-align: middle; border: none; padding: 4px;">
        <div style="font-size: 11px; color: #475569; font-weight: 600;">શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર</div>
        <h2 style="font-size: 18px; font-weight: 900; margin: 3px 0; color: #0f172a;">${instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા'}</h2>
        <div style="font-size: 12px; font-weight: bold; color: #1e293b; text-transform: uppercase;">GOVERNMENT INDUSTRIAL TRAINING INSTITUTE</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${instructor.institution_address || 'સરનામું અને સંપર્ક નંબર'}</div>
      </td>
      <td style="width: 15%; text-align: right; vertical-align: middle; border: none; padding: 4px;">
        <div style="font-size: 11px; font-weight: bold; color: #64748b; border: 1.5px dashed #cbd5e1; padding: 12px 6px; text-align: center; border-radius: 8px;">[જમણો લોગો]</div>
      </td>
    </tr>
  </tbody>
</table>
<table style="width: 100%; border-collapse: collapse; border-top: 1.5px solid #0f172a; margin-top: 4px; padding-top: 4px;">
  <tbody>
    <tr>
      <td style="text-align: left; font-size: 11px; font-weight: bold; border: none; padding: 4px 0 0 0;">જાવક ક્રમાંક: {{Ref_No}}</td>
      <td style="text-align: right; font-size: 11px; font-weight: bold; border: none; padding: 4px 0 0 0;">તારીખ: {{Current_Date}}</td>
    </tr>
  </tbody>
</table>
    `.trim();

    if (editorRef.current) {
      editorRef.current.insertContent(tableHtml);
    } else {
      setContent(tableHtml);
    }
    setFeedback('✓ ૩-કોલમ સત્તાવાર કોષ્ટક ઉમેરાયું.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveAndApply = () => {
    // 1. Notify via onSaveLetterhead if available
    if (onSaveLetterhead) {
      onSaveLetterhead(content, isSpecific);
    }

    // 2. Also construct and update HeaderConfig to ensure seamless compatibility across the app
    const updatedHeaderConfig: HeaderConfig = {
      ...(instructor.header_config || {}),
      letterhead_mode: 'tinymce_canvas',
      letterhead_html: content,
    };

    if (onSaveHeaderConfig) {
      onSaveHeaderConfig(updatedHeaderConfig);
    }

    // 3. If saving as global default
    if (!isSpecific && onSaveAsGlobalDefault) {
      onSaveAsGlobalDefault(content);
    }

    setFeedback('✓ સંસ્થા લેટરહેડ TinyMCE દ્વારા સફળતાપૂર્વક સાચવવામાં આવ્યું!');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Hidden file input for logo uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
          }}
        />

        {/* Modal Top Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  સંસ્થા લેટરહેડ TinyMCE એડિટર (Rich-Text Letterhead Designer)
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ૧૦૦% મુક્ત ફોર્મેટ (No Fixed Form)
                </span>
              </div>
              <p className="text-xs text-blue-200 truncate mt-0.5">
                નિશ્ચિત ફોર્મના બંધન વિના TinyMCE દ્વારા તમારી જરૂરિયાત મુજબનું લેટરહેડ તૈયાર કરો
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="બંધ કરો (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope and View Mode Selector Sub-header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Scope Selector: Global vs Template-Specific */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 text-xs">લાગુ કરવાની મર્યાદા:</span>
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsSpecific(false)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  !isSpecific
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="તમામ ટેમ્પલેટ્સ માટે સમાન ગ્લોબલ લેટરહેડ વાપરો"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ગ્લોબલ ડિફોલ્ટ (Global)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpecific(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  isSpecific
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="આ ચોક્કસ ટેમ્પલેટ માટે જ અલગ લેટરહેડ બનાવો"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>આ ટેમ્પલેટ ખાસ (Template-Specific)</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 italic">
              {isSpecific
                ? `(માત્ર "${currentTemplate?.template_name || 'આ ટેમ્પલેટ'}" માં લાગુ થશે)`
                : '(સંસ્થાના તમામ પત્રો અને નોટિસો માટે ડિફોલ્ટ રહેશે)'}
            </span>
          </div>

          {/* View Mode Toggle: Edit Canvas vs Live A4 Preview */}
          <div className="flex items-center gap-1.5">
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  activeViewTab === 'editor'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>એડિટર (Editor)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  activeViewTab === 'preview'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>લાઈવ A4 પ્રિવ્યુ (Live Preview)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Toolbar: Blank, Preset, Upload Logo, Insert Tags */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Start Blank Button */}
            <button
              type="button"
              onClick={handleStartBlank}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="કોરા કેન્વાસથી શરૂ કરો (Blank Canvas)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>કોરો કેન્વાસ (Start Blank)</span>
            </button>

            {/* Insert 3-Column Table */}
            <button
              type="button"
              onClick={handleInsert3ColTable}
              className="flex items-center gap-1 px-2.5 py-1 text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="ડાબો લોગો, મધ્ય લખાણ અને જમણો લોગો ધરાવતું કોષ્ટક ઉમેરો"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>૩-કોલમ ટેબલ ઉમેરો</span>
            </button>

            {/* Upload Logo Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="કમ્પ્યુટરમાંથી લોગો કે બેનર ઇમેજ ઉમેરો"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>લોગો / ફોટો ઉમેરો</span>
            </button>

            {/* Preset Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1 px-2.5 py-1 text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                title="સરકારી ITI પ્રમાણિત લેટરહેડ પ્રીસેટ્સ જુઓ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>રેડીમેડ પ્રીસેટ્સ</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {showPresetsMenu && (
                <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                    રેડીમેડ સત્તાવાર ITI લેટરહેડ પસંદ કરો:
                  </div>
                  <div className="space-y-1">
                    {LETTERHEAD_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full text-left p-2 rounded-lg hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-800">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dynamic Tag Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500">ઓટો ટેગ્સ:</span>
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.insertContent('{{Ref_No}}');
                } else {
                  setContent((prev) => `${prev} {{Ref_No}}`);
                }
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded font-mono text-[11px] font-bold cursor-pointer"
              title="જાવક નંબર ઓટો-મર્જ ટેગ ઉમેરો"
            >
              +&#123;&#123;Ref_No&#125;&#125;
            </button>
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.insertContent('{{Current_Date}}');
                } else {
                  setContent((prev) => `${prev} {{Current_Date}}`);
                }
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded font-mono text-[11px] font-bold cursor-pointer"
              title="આજની તારીખ ઓટો-મર્જ ટેગ ઉમેરો"
            >
              +&#123;&#123;Current_Date&#125;&#125;
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Workspace: TinyMCE Editor OR Live A4 Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
          {activeViewTab === 'editor' ? (
            /* TinyMCE Rich-Text Letterhead Editor */
            <div className="w-full max-w-[820px] bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>TinyMCE લેટરહેડ કેન્વાસ (WYSIWYG)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  ફોન્ટ, સાઇઝ, કલર, ટેબલ અને લોગો તમારી ઇચ્છા મુજબ ગોઠવો
                </span>
              </div>

              <div className="p-2">
                <Editor
                  licenseKey="gpl"
                  tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
                  onInit={(_evt, editor) => {
                    editorRef.current = editor;
                  }}
                  value={content}
                  onEditorChange={(newContent) => {
                    setContent(newContent);
                  }}
                  init={{
                    height: 330,
                    menubar: 'edit insert format table tools',
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'searchreplace',
                      'visualblocks',
                      'code',
                      'table',
                      'directionality',
                    ],
                    toolbar:
                      'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor | ' +
                      'alignleft aligncenter alignright alignjustify | table image | removeformat code',
                    toolbar_mode: 'sliding',
                    font_family_formats:
                      'Noto Sans Gujarati=Noto Sans Gujarati, sans-serif;' +
                      'Shruti=Shruti, Noto Sans Gujarati, sans-serif;' +
                      'Arial=arial,helvetica,sans-serif;' +
                      'Times New Roman=times new roman,times;' +
                      'Georgia=georgia,palatino',
                    font_size_formats: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 20pt 24pt 28pt',
                    content_style: `
                      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700;800;900&display=swap');
                      body {
                        font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                        font-size: 13.5px;
                        line-height: 1.45;
                        color: #0f172a;
                        padding: 14px 18px;
                        background-color: #ffffff;
                        margin: 0;
                      }
                      table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 0;
                      }
                      td, th {
                        padding: 3px 5px;
                      }
                      p {
                        margin: 0 0 4px 0;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                      }
                    `,
                    branding: false,
                    promotion: false,
                  }}
                />
              </div>
            </div>
          ) : (
            /* Live Rendered A4 Preview Mode */
            <div className="w-full max-w-[820px] bg-white rounded-xl shadow-xl border border-slate-300 p-8 sm:p-10 text-slate-900 font-gujarati space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>લાઈવ A4 પ્રિવ્યુ (A4 Simulation with Merged Data)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  નમૂના જાવક નંબર &amp; આજની તારીખ
                </span>
              </div>

              {content.trim() ? (
                <div
                  className="iti-rendered-letterhead select-none"
                  dangerouslySetInnerHTML={{
                    __html: renderLetterheadHtml(content, {
                      refNumber: `${instructor.outward_code_prefix || 'ઔતાસં/૨૦૨૫-૨૬'}/૧૦૧`,
                      issueDate: new Date().toLocaleDateString('gu-IN'),
                    }),
                  }}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                  [કોરો લેટરહેડ - એડિટર ટેબમાં જઈને લખાણ અથવા કોષ્ટક ઉમેરો]
                </div>
              )}

              {/* Sample Body Placeholder below the Letterhead */}
              <div className="pt-6 border-t border-dashed border-slate-200 text-xs text-slate-400 space-y-2 opacity-60 select-none">
                <div className="h-3.5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                <div className="text-[11px] text-slate-400 italic pt-2">
                  [ઉપરનો લેટરહેડ આપના તમામ પત્રો અને રિપોર્ટમાં આ રીતે A4 કાગળના શીર્ષ સ્થાને પ્રિન્ટ થશે]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">સાચવવાની મર્યાદા:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                isSpecific
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-100 text-blue-900'
              }`}
            >
              {isSpecific ? 'આ ટેમ્પલેટ પૂરતો સીમિત' : 'તમામ ટેમ્પલેટ્સ માટે ગ્લોબલ'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              રદ કરો (Cancel)
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>સાચવો અને લાગુ કરો (Save & Apply)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
