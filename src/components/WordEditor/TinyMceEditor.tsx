import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Tag,
  Shapes,
  Info,
  Check,
  ChevronDown,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

export interface TinyMceEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  minHeight?: number;
  onInsertTag?: (tag: string) => void;
}

// Mail merge tags with clear English descriptions
export const MERGE_TAG_ITEMS = [
  { tag: '{{Trainee_Name}}', label: 'Trainee Name', category: 'trainee' },
  { tag: '{{Roll_No}}', label: 'Roll Number', category: 'trainee' },
  { tag: '{{Enrollment_No}}', label: 'Enrollment Number', category: 'trainee' },
  { tag: '{{Father_Name}}', label: "Father's Name", category: 'trainee' },
  { tag: '{{Surname}}', label: 'Surname', category: 'trainee' },
  { tag: '{{Parent_Mobile}}', label: 'Parent Mobile', category: 'trainee' },
  { tag: '{{Full_Address}}', label: 'Full Address', category: 'trainee' },
  { tag: '{{Trade}}', label: 'Trade', category: 'academic' },
  { tag: '{{Batch}}', label: 'Batch', category: 'academic' },
  { tag: '{{Unit}}', label: 'Unit', category: 'academic' },
  { tag: '{{ITI_Name}}', label: 'ITI Name', category: 'academic' },
  { tag: '{{Attendance_Percentage}}', label: 'Attendance %', category: 'attendance' },
  { tag: '{{Total_Working_Days}}', label: 'Total Working Days', category: 'attendance' },
  { tag: '{{Present_Days}}', label: 'Present Days', category: 'attendance' },
  { tag: '{{Absent_Days}}', label: 'Absent Days', category: 'attendance' },
  { tag: '{{Month_Year}}', label: 'Month / Year', category: 'attendance' },
  { tag: '{{Ref_No}}', label: 'Reference / Outward No', category: 'dispatch' },
  { tag: '{{Current_Date}}', label: 'Notice Issue Date', category: 'dispatch' },
  { tag: '{{Previous_Notice_Dates}}', label: 'Previous Notice Dates', category: 'dispatch' },
  { tag: '{{Prior_Notice_Count}}', label: 'Prior Notice Count', category: 'dispatch' },
  { tag: '{{Trainee_Attendance_Table}}', label: 'Attendance Table (Principal Report)', category: 'report' },
  { tag: '{{Instructor_Name}}', label: 'Instructor Name', category: 'institution' },
  { tag: '{{Designation}}', label: 'Designation', category: 'institution' },
  { tag: '{{AI_Commentary}}', label: 'Guidance Commentary', category: 'institution' },
];

export const DOCUMENT_SHAPES = [
  {
    title: 'Warning Callout Box',
    html: `<div class="doc-shape" style="background-color: #fffbeb; border-left: 5px solid #d97706; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13.5px; color: #92400e;">
      <strong>⚠️ Warning:</strong> Trainee attendance is below the required 80% threshold under NCVT/GCVT training norms. Parent consultation is urgently required within 3 working days.
    </div>`,
  },
  {
    title: 'Official Note Block',
    html: `<div class="doc-shape" style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-size: 13.5px; color: #166534;">
      <strong>📌 Note:</strong> As per DGT / GCVT guidelines, minimum 80% attendance is strictly mandatory for appearing in the All India Trade Test (AITT).
    </div>`,
  },
  {
    title: 'Official Verified Stamp',
    html: `<div class="doc-shape" style="display: inline-block; border: 2px dashed #dc2626; color: #dc2626; padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 10px 0;">
      ✓ Certified Copy / Official Order
    </div>`,
  },
  {
    title: 'Double Border Summary Frame',
    html: `<div class="doc-shape" style="border: 4px double #334155; padding: 14px 18px; margin: 18px 0; background-color: #f8fafc; font-size: 13.5px;">
      <div style="font-weight: bold; text-align: center; margin-bottom: 6px; text-decoration: underline; font-size: 14.5px;">Principal / Authority Decision</div>
      <p style="margin: 0; line-height: 1.6;">Appropriate administrative action has been initiated under institutional training norms.</p>
    </div>`,
  },
  {
    title: 'Decorative Divider Line',
    html: `<div class="doc-shape" style="border: 0; height: 2px; background: linear-gradient(to right, #cbd5e1, #1e3a8a, #cbd5e1); margin: 20px 0;"></div>`,
  },
];

export default function TinyMceEditor({
  value,
  onChange,
  disabled = false,
  minHeight = 550,
  onInsertTag,
}: TinyMceEditorProps) {
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const insertContentIntoEditor = (htmlContent: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(htmlContent);
    } else {
      onChange(value + '\n' + htmlContent);
    }
  };

  const handleImageUploadFromDevice = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP, GIF, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (editorRef.current) {
        editorRef.current.insertContent(
          `<p><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; object-fit: contain; margin: 8px 0;" /></p>`
        );
        setUploadToast('✓ Image successfully inserted from device!');
        setTimeout(() => setUploadToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTagClick = (tag: string) => {
    insertContentIntoEditor(` ${tag} `);
    setShowTagMenu(false);
    if (onInsertTag) onInsertTag(tag);
  };

  const handleShapeClick = (html: string) => {
    insertContentIntoEditor(html);
    setShowShapeMenu(false);
  };

  const filteredTags = MERGE_TAG_ITEMS.filter(
    (t) =>
      t.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
      t.tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Hidden file input for uploading images from device directly into document */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUploadFromDevice(file);
          e.target.value = '';
        }}
      />

      {/* Upload Toast Feedback */}
      {uploadToast && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-1.5 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* Top Helper Bar: Quick Insert Tags, Upload Image from Device, & Shapes */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs select-none">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Tags:</span>
          </span>

          {/* Quick Upload Image from Device Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 shadow-2xs transition-colors cursor-pointer"
            title="Upload image from computer / mobile device into document"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
            <span>Upload Image from Device</span>
          </button>

          {/* Frequently used quick tags */}
          {[
            { tag: '{{Trainee_Name}}', label: 'Trainee Name' },
            { tag: '{{Roll_No}}', label: 'Roll No' },
            { tag: '{{Attendance_Percentage}}', label: 'Attendance %' },
            { tag: '{{Current_Date}}', label: 'Date' },
            { tag: '{{Ref_No}}', label: 'Outward No' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handleTagClick(item.tag)}
              title={`Insert: ${item.tag}`}
              className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors whitespace-nowrap cursor-pointer font-medium"
            >
              +{item.label}
            </button>
          ))}

          {/* Full Tags Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTagMenu(!showTagMenu);
                setShowShapeMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <span>All Tags ({MERGE_TAG_ITEMS.length})</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showTagMenu && (
              <div className="absolute left-0 top-full mt-1 w-80 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-1 mb-1 border-b border-slate-100">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tag..."
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="space-y-0.5">
                  {filteredTags.map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleTagClick(item.tag)}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{item.label}</div>
                        <div className="font-mono text-[10px] text-slate-400">{item.tag}</div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                        +Insert
                      </span>
                    </button>
                  ))}
                  {filteredTags.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">No matching tags found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shapes Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowShapeMenu(!showShapeMenu);
              setShowTagMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
          >
            <Shapes className="w-3.5 h-3.5 text-emerald-600" />
            <span>Document Shapes</span>
            <ChevronDown className="w-3 h-3 text-emerald-600" />
          </button>

          {showShapeMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-slate-100 mb-1">
                Official Document Shapes
              </div>
              <div className="space-y-1">
                {DOCUMENT_SHAPES.map((shape, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleShapeClick(shape.html)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium">{shape.title}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      +Add
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TinyMCE Editor Core */}
      <div className="relative w-full">
        {!isEditorLoaded && !loadError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-2xs">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading TinyMCE Editor...</span>
            </div>
          </div>
        )}

        {loadError ? (
          /* Offline Fallback Rich Textarea if CDN is blocked */
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg text-xs border border-amber-200">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Offline Editor Mode: You can edit HTML or text below.</span>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm min-h-[500px] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <Editor
            licenseKey="gpl"
            tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
            onInit={(_evt, editor) => {
              editorRef.current = editor;
              setIsEditorLoaded(true);
            }}
            value={value}
            disabled={disabled}
            onEditorChange={(newContent) => {
              onChange(newContent);
            }}
            init={{
              height: minHeight,
              menubar: 'file edit view insert format tools table',
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
                'fullscreen',
                'insertdatetime',
                'media',
                'table',
                'wordcount',
              ],
              toolbar:
                'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                'image table customMergeTag customShape | removeformat code fullscreen',
              toolbar_mode: 'sliding',
              image_advtab: true,
              image_caption: true,
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
                'Gopika=Gopika, sans-serif;' +
                'Arial=arial,helvetica,sans-serif;' +
                'Times New Roman=times new roman,times;' +
                'Courier New=courier new,courier;' +
                'Georgia=georgia,palatino',
              font_size_formats: '9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 24pt 28pt 36pt',
              content_style: `
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap');
                body {
                  font-family: 'Noto Sans Gujarati', Arial, sans-serif;
                  font-size: 14px;
                  line-height: 1.65;
                  color: #111827;
                  padding: 24px;
                  background-color: #ffffff;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 12px 0;
                }
                th, td {
                  border: 1px solid #94a3b8;
                  padding: 6px 10px;
                  font-size: 13.5px;
                }
                th {
                  background-color: #f1f5f9;
                  font-weight: 600;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                .doc-shape {
                  margin: 14px 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                p {
                  margin: 0 0 10px 0;
                }
              `,
              branding: false,
              promotion: false,
              setup: (editor) => {
                // Register custom toolbar button for merge tags
                editor.ui.registry.addMenuButton('customMergeTag', {
                  text: 'Merge Tags',
                  icon: 'bookmark',
                  tooltip: 'Insert Dynamic Field Tag',
                  fetch: (callback) => {
                    const menuItems = MERGE_TAG_ITEMS.map((item) => ({
                      type: 'menuitem' as const,
                      text: item.label,
                      onAction: () => {
                        editor.insertContent(` ${item.tag} `);
                      },
                    }));
                    callback(menuItems);
                  },
                });

                // Register custom toolbar button for shapes
                editor.ui.registry.addMenuButton('customShape', {
                  text: 'Shapes',
                  icon: 'shapes',
                  tooltip: 'Insert Document Shapes & Boxes',
                  fetch: (callback) => {
                    const shapeItems = DOCUMENT_SHAPES.map((shape) => ({
                      type: 'menuitem' as const,
                      text: shape.title,
                      onAction: () => {
                        editor.insertContent(shape.html);
                      },
                    }));
                    callback(shapeItems);
                  },
                });
              },
            }}
          />
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>
            TinyMCE 7 Rich Editor Active • Image Upload from Device &amp; <strong>&#123;&#123;Merge Tags&#125;&#125;</strong> Supported
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Formatted for official A4 printable output</span>
        </div>
      </div>
    </div>
  );
}
