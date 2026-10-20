import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Building2,
  Globe,
  FileText,
  Sparkles,
  RotateCcw,
  Save,
  Check,
  ChevronDown,
  Info,
  HelpCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Instructor, LetterTemplate } from '../../types';
import {
  LETTERHEAD_PRESETS,
  LetterheadPreset,
} from '../../utils/letterheadPresets';

export interface TinyMceLetterheadEditorProps {
  value: string;
  onChange: (html: string) => void;
  instructor: Instructor;
  template?: LetterTemplate | null;
  isTemplateSpecific: boolean;
  onToggleScope: (isSpecific: boolean) => void;
  onSaveAsGlobalDefault?: (html: string) => void;
  onResetToDefault?: () => void;
  disabled?: boolean;
}

export default function TinyMceLetterheadEditor({
  value,
  onChange,
  instructor,
  template,
  isTemplateSpecific,
  onToggleScope,
  onSaveAsGlobalDefault,
  onResetToDefault,
  disabled = false,
}: TinyMceLetterheadEditorProps) {
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const handleStartBlank = () => {
    onChange('');
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    setSavedToast('✓ Blank canvas ready. Design your custom letterhead freely.');
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editorRef.current) {
        editorRef.current.insertContent(
          `<img src="${dataUrl}" alt="Logo" style="max-height: 60px; max-width: 140px; object-fit: contain; vertical-align: middle; margin: 4px;" />`
        );
      }
      setSavedToast('✓ Image successfully uploaded from device!');
      setTimeout(() => setSavedToast(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: LetterheadPreset) => {
    const headerConfig = instructor.header_config;
    const itiNameGu = headerConfig?.institute_name_gu || instructor.iti_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા';
    const itiNameEn = headerConfig?.institute_name_en || instructor.iti_name || 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE';
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

    onChange(html);
    if (editorRef.current) {
      editorRef.current.setContent(html);
    }
    setShowPresetsMenu(false);
    setSavedToast(`✓ "${preset.name}" preset applied`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleSaveGlobal = () => {
    if (onSaveAsGlobalDefault) {
      onSaveAsGlobalDefault(value);
      setSavedToast('✓ Saved as Global Default for all templates!');
      setTimeout(() => setSavedToast(null), 3500);
    }
  };

  return (
    <div className="w-full bg-slate-50 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl p-2.5 transition-all mb-4 relative group/lheditor">
      {/* Hidden file input for uploading logo directly into letterhead */}
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

      {/* Top Scope and Preset Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
        {/* Left: Scope Selector Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 font-bold text-slate-800 mr-1 shrink-0">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Letterhead (TinyMCE):</span>
          </div>

          {/* Scope Toggle: Global vs Template Specific */}
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
            <button
              type="button"
              onClick={() => onToggleScope(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                !isTemplateSpecific
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Use same global letterhead across all templates"
            >
              <Globe className="w-3 h-3" />
              <span>Global Default</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleScope(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                isTemplateSpecific
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Customize letterhead specifically for this template"
            >
              <FileText className="w-3 h-3" />
              <span>Template-Specific</span>
            </button>
          </div>

          {/* Start Blank Canvas Button */}
          <button
            type="button"
            onClick={handleStartBlank}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-white text-slate-700 hover:text-slate-950 border border-slate-300 hover:border-slate-400 rounded-md shadow-2xs transition-colors cursor-pointer"
            title="Start with a blank letterhead canvas"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Start Blank</span>
          </button>

          {/* Upload Image from Device Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-300 rounded-md shadow-2xs transition-colors cursor-pointer"
            title="Upload logo / image from computer or phone"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
            <span>Upload Image from Device</span>
          </button>
        </div>

        {/* Right: Tags, Presets, Save as Global, Reset Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Merge Tags */}
          <button
            type="button"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.insertContent('{{Ref_No}}');
              } else {
                onChange(`${value} {{Ref_No}}`);
              }
            }}
            className="px-1.5 py-0.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded font-mono text-[10px] font-bold cursor-pointer"
            title="Insert auto outward reference tag"
          >
            {'+{{Ref_No}}'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.insertContent('{{Current_Date}}');
              } else {
                onChange(`${value} {{Current_Date}}`);
              }
            }}
            className="px-1.5 py-0.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded font-mono text-[10px] font-bold cursor-pointer"
            title="Insert auto notice date tag"
          >
            {'+{{Current_Date}}'}
          </button>

          {/* Preset Formats Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 rounded-md shadow-2xs transition-colors cursor-pointer"
              title="View and apply pre-formatted official ITI letterhead templates"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {showPresetsMenu && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100 mb-1">
                  Select Official ITI Letterhead Preset:
                </div>
                <div className="space-y-1">
                  {LETTERHEAD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full text-left p-2 rounded-lg hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 group/item cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-800 group-hover/item:text-amber-900">
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

          {/* Save as Global Default (if currently editing) */}
          {onSaveAsGlobalDefault && (
            <button
              type="button"
              onClick={handleSaveGlobal}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Save this letterhead as global default across all templates"
            >
              <Save className="w-3 h-3 text-emerald-600" />
              <span>Save Global</span>
            </button>
          )}

          {/* Reset to Default */}
          {onResetToDefault && (
            <button
              type="button"
              onClick={onResetToDefault}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              title="Reset letterhead to standard official format"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Help Info Toggle */}
          <button
            type="button"
            onClick={() => setShowHelpTooltip(!showHelpTooltip)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
            title="Letterhead editing guidance"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Help Box */}
      {showHelpTooltip && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-xs text-amber-900 mb-2 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              💡 You can click directly into the letterhead area below to edit any text, fonts, colors, address, or upload logos.
            </p>
            <p className="text-[11px] text-amber-800">
              - <strong>Outward No:</strong> Use <code className="bg-white px-1 py-0.5 rounded border border-amber-300 font-mono text-[10px]">&#123;&#123;Ref_No&#125;&#125;</code> to auto-merge registration outward number.
              <br />- <strong>Date:</strong> Use <code className="bg-white px-1 py-0.5 rounded border border-amber-300 font-mono text-[10px]">&#123;&#123;Current_Date&#125;&#125;</code> to auto-merge today's date upon printing.
            </p>
          </div>
        </div>
      )}

      {/* Saved Toast */}
      {savedToast && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-md text-xs font-bold mb-2 flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* The Actual TinyMCE Letterhead Canvas Editor */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-inner overflow-hidden">
        <Editor
          licenseKey="gpl"
          tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          value={value}
          disabled={disabled}
          onEditorChange={(newContent) => {
            onChange(newContent);
          }}
          init={{
            height: 185,
            menubar: false,
            plugins: [
              'lists',
              'link',
              'image',
              'table',
              'code',
              'directionality',
            ],
            toolbar:
              'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor | ' +
              'alignleft aligncenter alignright alignjustify | table image | removeformat code',
            toolbar_mode: 'sliding',
            paste_data_images: true,
            automatic_uploads: true,
            file_picker_types: 'image',
            images_upload_handler: (blobInfo: any) => {
              return new Promise((resolve) => {
                resolve('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
              });
            },
            file_picker_callback: (callback: any, _value: any, meta: any) => {
              if (meta.filetype === 'image') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.onchange = function () {
                  const file = (this as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = function () {
                      callback(reader.result as string, { title: file.name, alt: file.name });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }
            },
            font_family_formats:
              'Noto Sans Gujarati=Noto Sans Gujarati, sans-serif;' +
              'Shruti=Shruti, Noto Sans Gujarati, sans-serif;' +
              'Arial=arial,helvetica,sans-serif;' +
              'Times New Roman=times new roman,times;' +
              'Georgia=georgia,palatino',
            font_size_formats: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 20pt 24pt',
            content_style: `
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700;800;900&display=swap');
              body {
                font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                font-size: 13px;
                line-height: 1.4;
                color: #0f172a;
                padding: 10px 14px;
                background-color: #ffffff;
                margin: 0;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 0;
              }
              td, th {
                padding: 2px 4px;
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

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
        <span>A4 Letterhead Canvas • Click directly to edit text, columns, or logos</span>
        <span>Device image upload enabled</span>
      </div>
    </div>
  );
}
