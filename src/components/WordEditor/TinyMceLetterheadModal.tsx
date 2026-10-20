import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  X,
  Building2,
  Globe,
  FileText,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Instructor, LetterTemplate } from '../../types';
import {
  LETTERHEAD_PRESETS,
  LetterheadPreset,
} from '../../utils/letterheadPresets';

export interface TinyMceLetterheadModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  template?: LetterTemplate | null;
  initialHtml?: string;
  isTemplateSpecific?: boolean;
  onSave: (html: string, isTemplateSpecific: boolean) => void;
  onSaveAsGlobalDefault?: (html: string) => void;
}

export default function TinyMceLetterheadModal({
  isOpen,
  onClose,
  instructor,
  template,
  initialHtml = '',
  isTemplateSpecific: initialIsTemplateSpecific = false,
  onSave,
  onSaveAsGlobalDefault,
}: TinyMceLetterheadModalProps) {
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState<string>(initialHtml);
  const [isSpecific, setIsSpecific] = useState<boolean>(initialIsTemplateSpecific);
  const [showPresetsMenu, setShowPresetsMenu] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sync initial content and scope whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setContent(initialHtml);
      setIsSpecific(initialIsTemplateSpecific);
      setFeedback(null);
    }
  }, [isOpen, initialHtml, initialIsTemplateSpecific]);

  if (!isOpen) return null;

  // Upload image/logo directly from device and insert into TinyMCE at caret position
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editorRef.current) {
        editorRef.current.insertContent(
          `<img src="${dataUrl}" alt="${file.name}" style="max-height: 80px; width: auto; object-fit: contain; vertical-align: middle; margin: 4px;" />`
        );
      } else {
        setContent((prev) => `${prev} <img src="${dataUrl}" alt="${file.name}" style="max-height: 80px; width: auto; margin: 4px;" />`);
      }
      setFeedback(`✓ Image "${file.name}" inserted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: LetterheadPreset) => {
    const headerConfig = instructor.header_config;
    const itiNameGu = headerConfig?.institute_name_gu || instructor.iti_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા';
    const itiNameEn = headerConfig?.institute_name_en || instructor.iti_name || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE';
    const deptGu = headerConfig?.department_subtitle || 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર';
    const address = headerConfig?.address || instructor.institution_address_gu || instructor.institution_address || 'ગુજરાત રાજ્ય';
    const phone = headerConfig?.contact_info || instructor.phone || '';
    const email = instructor.email || '';
    const refPrefix = headerConfig?.ref_prefix || instructor.outward_code_prefix || 'ITI/2026';
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
    setFeedback(`✓ "${preset.name}" preset applied.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStartBlank = () => {
    const blankHtml = `
<div class="iti-letterhead-container" style="font-family: 'Noto Sans Gujarati', Arial, sans-serif; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px;">
  <table style="width: 100%; border-collapse: collapse; border: none; margin: 0;">
    <tbody>
      <tr>
        <td style="width: 70px; vertical-align: middle; text-align: left; border: none;">
          <div style="width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #1e3a8a; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #1e3a8a;">
            LOGO
          </div>
        </td>
        <td style="vertical-align: middle; text-align: center; border: none; padding: 0 10px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: #0f172a;">${instructor.iti_name || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE'}</h2>
          <div style="font-size: 12px; font-weight: bold; color: #334155; text-transform: uppercase;">SKILL DEVELOPMENT &amp; VOCATIONAL TRAINING</div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">${instructor.institution_address || 'Gujarat'} ${instructor.phone ? `• Phone: ${instructor.phone}` : ''}</div>
        </td>
        <td style="width: 70px; vertical-align: middle; text-align: right; border: none;">
          <div style="width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #64748b; margin-left: auto;">
            EMBLEM
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; margin-top: 6px; padding-top: 4px; font-size: 11px; font-weight: bold;">
    <div>Ref No.: {{Ref_No}}</div>
    <div>Date: {{Current_Date}}</div>
  </div>
</div>
    `.trim();

    setContent(blankHtml);
    if (editorRef.current) {
      editorRef.current.setContent(blankHtml);
    }
    setFeedback('✓ Blank letterhead canvas ready. You can edit text, logos, and tables freely.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveGlobalOnly = () => {
    if (onSaveAsGlobalDefault) {
      onSaveAsGlobalDefault(content);
      setIsSpecific(false);
      setFeedback('✓ Saved as Global Default letterhead for all templates!');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleApplyAndClose = () => {
    onSave(content, isSpecific);
    if (!isSpecific && onSaveAsGlobalDefault) {
      onSaveAsGlobalDefault(content);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      {/* Hidden file input for device image upload */}
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

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
                <span>Institute Letterhead Designer (TinyMCE)</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Flexible Format
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Customize institute logo, emblem, typography, tables, and outward number format without fixed constraints
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header: Scope Selector & Quick Insertion Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Scope Toggle: Global Default vs Template Specific */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 text-xs">Apply Scope:</span>
            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsSpecific(false)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  !isSpecific
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Use this letterhead as default for all notices and templates"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Default</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpecific(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  isSpecific
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Customize letterhead specifically for this template"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Template-Specific</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 italic">
              {isSpecific
                ? '(Applies only to this specific template)'
                : '(Default across all institute notices)'}
            </span>
          </div>

          {/* Quick Preset / Blank / Tag / Upload Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Upload Image from Device Button (Requirement 2) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Upload image or logo directly from your computer / phone"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Upload Image from Device</span>
            </button>

            {/* Blank Canvas Button */}
            <button
              type="button"
              onClick={handleStartBlank}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-950 bg-white border border-slate-300 hover:border-slate-400 rounded-md font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Start with a blank letterhead canvas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Start Blank</span>
            </button>

            {/* Preset Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1 px-2.5 py-1 text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                title="Pre-formatted official ITI letterhead templates"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Presets</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {showPresetsMenu && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Official ITI Letterhead Preset:
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

            {/* Quick Tag Insert Helpers */}
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.insertContent('{{Ref_No}}');
                } else {
                  setContent((prev) => `${prev} {{Ref_No}}`);
                }
              }}
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[11px] cursor-pointer"
              title="Outward Reference Number Tag"
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
              className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[11px] cursor-pointer"
              title="Current Date Tag"
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

        {/* Editor Workspace: Simulated A4 Document Width */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center">
          <div className="w-full max-w-[800px] bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>A4 Letterhead Content Canvas (TinyMCE WYSIWYG)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Full freedom to edit text, tables, logos, colors, and margins
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
                  height: 340,
                  menubar: 'edit insert format table tools',
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'table',
                    'wordcount',
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
                      padding: 16px 20px;
                      background-color: #ffffff;
                      margin: 0;
                    }
                    table {
                      border-collapse: collapse;
                      width: 100%;
                      margin: 0;
                    }
                    td, th {
                      padding: 4px 6px;
                    }
                    p {
                      margin: 0 0 6px 0;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                  `,
                  branding: false,
                  promotion: false,
                  // Enable device image picking from TinyMCE image popup
                  file_picker_types: 'image',
                  file_picker_callback: (callback, _value, _meta) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = function () {
                      const file = (input.files as FileList)[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = function () {
                          callback(reader.result as string, { title: file.name, alt: file.name });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  },
                  images_upload_handler: (blobInfo) => {
                    return Promise.resolve(`data:${blobInfo.blob().type};base64,${blobInfo.base64()}`);
                  },
                  paste_data_images: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Save Scope:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                isSpecific
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-100 text-blue-900'
              }`}
            >
              {isSpecific ? 'Template-Specific Only' : 'Global Default for All Templates'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSaveAsGlobalDefault && (
              <button
                type="button"
                onClick={handleSaveGlobalOnly}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                title="Save this letterhead as global default for all notices"
              >
                Save as Global
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyAndClose}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
