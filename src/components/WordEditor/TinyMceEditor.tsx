import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Tag,
  Shapes,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface TinyMceEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  minHeight?: number;
  placeholder?: string;
  onInsertTag?: (tag: string) => void;
}

// Mail merge tags with Gujarati descriptions and sample data preview
export const MERGE_TAG_ITEMS = [
  { tag: '{{Trainee_Name}}', label: 'તાલીમાર્થીનું નામ (Trainee Name)', category: 'trainee' },
  { tag: '{{Roll_No}}', label: 'રોલ નંબર (Roll No)', category: 'trainee' },
  { tag: '{{Enrollment_No}}', label: 'નોંધણી નંબર (Enrollment No)', category: 'trainee' },
  { tag: '{{Father_Name}}', label: 'પિતાશ્રીનું નામ (Father Name)', category: 'trainee' },
  { tag: '{{Surname}}', label: 'અટક (Surname)', category: 'trainee' },
  { tag: '{{Parent_Mobile}}', label: 'વાલી મોબાઈલ નંબર (Parent Mobile)', category: 'trainee' },
  { tag: '{{Full_Address}}', label: 'સંપૂર્ણ સરનામું (Address)', category: 'trainee' },
  { tag: '{{Trade}}', label: 'ટ્રેડ (Trade)', category: 'academic' },
  { tag: '{{Batch}}', label: 'બેચ (Batch)', category: 'academic' },
  { tag: '{{Unit}}', label: 'યુનિટ (Unit)', category: 'academic' },
  { tag: '{{ITI_Name}}', label: 'સંસ્થાનું નામ (ITI Name)', category: 'academic' },
  { tag: '{{Attendance_Percentage}}', label: 'હાજરી % (Attendance %)', category: 'attendance' },
  { tag: '{{Total_Working_Days}}', label: 'કુલ કામકાજના દિવસ (Working Days)', category: 'attendance' },
  { tag: '{{Present_Days}}', label: 'હાજર દિવસ (Present Days)', category: 'attendance' },
  { tag: '{{Absent_Days}}', label: 'ગેરહાજર દિવસ (Absent Days)', category: 'attendance' },
  { tag: '{{Month_Year}}', label: 'માસ / વર્ષ (Month Year)', category: 'attendance' },
  { tag: '{{Ref_No}}', label: 'જાવક ક્રમાંક (Reference / Outward No)', category: 'dispatch' },
  { tag: '{{Current_Date}}', label: 'નોટિસ તારીખ (Issue Date)', category: 'dispatch' },
  { tag: '{{Previous_Notice_Dates}}', label: 'અગાઉની નોટિસ તારીખો (Previous Notice Dates / -)', category: 'dispatch' },
  { tag: '{{Prior_Notice_Count}}', label: 'અગાઉ આપેલી નોટિસ સંખ્યા (Prior Notice Count)', category: 'dispatch' },
  { tag: '{{Trainee_Attendance_Table}}', label: 'આચાર્યશ્રી રિપોર્ટ: તમામ તાલીમાર્થીઓનું કોષ્ટક (Attendance Table)', category: 'report' },
  { tag: '{{Instructor_Name}}', label: 'ઇન્સ્ટ્રક્ટરનું નામ (Instructor Name)', category: 'institution' },
  { tag: '{{Designation}}', label: 'હોદ્દો (Designation)', category: 'institution' },
  { tag: '{{AI_Commentary}}', label: 'વાલી પરામર્શ / વિશેષ નોંધ (Guidance Commentary)', category: 'institution' },
];

export const DOCUMENT_SHAPES = [
  {
    title: 'ચેતવણી બોક્સ (Warning Callout Box)',
    html: `<div class="doc-shape" style="background-color: #fffbeb; border-left: 5px solid #d97706; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13.5px; color: #92400e;">
      <strong>⚠️ અગત્યની ચેતવણી:</strong> આપના પાલ્યની હાજરી નિયત ૮૦% કરતાં ઓછી હોવાથી સંસ્થાના નિયમાનુસાર આખરી નોટિસ મળ્યેથી દિન-૩ માં વાલીશ્રીએ રૂબરૂ ખુલાસો કરવો.
    </div>`,
  },
  {
    title: 'સત્તાવાર નોંધ બ્લોક (Official Note Block)',
    html: `<div class="doc-shape" style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-size: 13.5px; color: #166534;">
      <strong>📌 નોંધ:</strong> ડી.જી.ટી. (DGT) ના સુધારેલા પરીક્ષા નિયમો મુજબ વાર્ષિક અખિલ ભારતીય વ્યવસાયિક પરીક્ષા (AITT) માં બેસવા માટે ૮૦% ન્યૂનતમ હાજરી ફરજિયાત છે.
    </div>`,
  },
  {
    title: 'સત્તાવાર મહોર / સ્ટેમ્પ બેજ (Official Stamp Seal)',
    html: `<div class="doc-shape" style="display: inline-block; border: 2px dashed #dc2626; color: #dc2626; padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 10px 0;">
      ✓ પ્રમાણિત નકલ / સત્તાવાર આદેશ
    </div>`,
  },
  {
    title: 'ડબલ બોર્ડર સારાંશ ફ્રેમ (Double Border Summary Frame)',
    html: `<div class="doc-shape" style="border: 4px double #334155; padding: 14px 18px; margin: 18px 0; background-color: #f8fafc; font-size: 13.5px;">
      <div style="font-weight: bold; text-align: center; margin-bottom: 6px; text-decoration: underline; font-size: 14.5px;">આચાર્યશ્રીનો અંતિમ આદેશ / નિર્ણય</div>
      <p style="margin: 0; line-height: 1.6;">ઉપરોક્ત તાલીમાર્થી સામે ખાતાકીય નિયમાનુસાર જરૂરી કડક પગલાં લેવામાં આવ્યા છે.</p>
    </div>`,
  },
  {
    title: 'સુશોભિત આડી રેખા (Decorative Divider)',
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
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const insertContentIntoEditor = (htmlContent: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(htmlContent);
    } else {
      // Fallback
      onChange(value + '\n' + htmlContent);
    }
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
      {/* Top Helper Bar: Quick Insert Tags & Shapes */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>મર્જ ટૅગ્સ:</span>
          </span>

          {/* Frequently used quick tags */}
          {[
            { tag: '{{Trainee_Name}}', label: 'વિદ્યાર્થી નામ' },
            { tag: '{{Roll_No}}', label: 'રોલ નં' },
            { tag: '{{Attendance_Percentage}}', label: 'હાજરી %' },
            { tag: '{{Previous_Notice_Dates}}', label: 'અગાઉની નોટિસ' },
            { tag: '{{Trainee_Attendance_Table}}', label: 'ઓછી હાજરી કોષ્ટક' },
            { tag: '{{Current_Date}}', label: 'તારીખ' },
            { tag: '{{Ref_No}}', label: 'જાવક નં' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handleTagClick(item.tag)}
              title={`ઇન્સર્ટ કરો: ${item.tag}`}
              className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors whitespace-nowrap cursor-pointer"
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
              className="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <span>બધા ટૅગ્સ ({MERGE_TAG_ITEMS.length})</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showTagMenu && (
              <div className="absolute left-0 top-full mt-1 w-80 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-1 mb-1 border-b border-slate-100">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="ટૅગ શોધો (Search tag)..."
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
                        <div className="font-medium">{item.label}</div>
                        <div className="font-mono text-[10px] text-slate-400">{item.tag}</div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold px-1 py-0.5 rounded bg-blue-50">
                        +ઉમેરો
                      </span>
                    </button>
                  ))}
                  {filteredTags.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">કોઈ ટૅગ મળ્યો નથી</div>
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
          >
            <Shapes className="w-3.5 h-3.5 text-emerald-600" />
            <span>આકારો અને બોક્સ (Shapes)</span>
            <ChevronDown className="w-3 h-3 text-emerald-600" />
          </button>

          {showShapeMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-1 border-b border-slate-100 mb-1">
                સત્તાવાર નોટિસ આકારો
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
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded font-bold">
                      +ઉમેરો
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
              <span>TinyMCE એડિટર લોડ થઈ રહ્યું છે...</span>
            </div>
          </div>
        )}

        {loadError ? (
          /* Offline Fallback Rich Textarea if CDN is blocked */
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg text-xs border border-amber-200">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>ઓફલાઇન એડિટર મોડ: આપ નીચે સીધું HTML અથવા ટેક્સ્ટ સંપાદિત કરી શકો છો.</span>
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
                'table customMergeTag customShape | removeformat code fullscreen',
              toolbar_mode: 'sliding',
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
                  text: 'મર્જ ટૅગ્સ (Merge Tags)',
                  icon: 'bookmark',
                  tooltip: 'ઇન્સર્ટ મેઇલ મર્જ ટૅગ (Insert Dynamic Field Tag)',
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
                  text: 'આકાર (Shapes)',
                  icon: 'shapes',
                  tooltip: 'સત્તાવાર દસ્તાવેજ આકારો ઉમેરો (Insert Document Shapes)',
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
            TinyMCE 7 રિચ એડિટર સક્રિય • A4 પ્રિન્ટ અને <strong>&#123;&#123;મર્જ ટૅગ્સ&#125;&#125;</strong> સપોર્ટેડ
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>આચાર્યશ્રી અહેવાલ અને તાલીમાર્થી નોટિસ બંને માટે અનુકૂળ</span>
        </div>
      </div>
    </div>
  );
}
