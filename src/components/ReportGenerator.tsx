import React, { useState, useRef, useEffect } from 'react';
import {
  Instructor,
  Trainee,
  AttendanceRecord,
  LetterTemplate,
  DispatchLog,
  HeaderConfig,
} from '../types';
import {
  Printer,
  FileText,
  Users,
  CheckSquare,
  Square,
  AlertTriangle,
  AlertCircle,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  GripVertical,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { mergeTemplateTags } from '../utils/mergeTags';
import DraggableFieldsPalette from './DraggableFieldsPalette';

interface ReportGeneratorProps {
  instructor: Instructor;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  templates: LetterTemplate[];
  onBatchLogDispatch?: (logs: DispatchLog[]) => void;
}

export const isTraineeAssigned = (tr: Trainee): boolean => {
  return Boolean(tr.trade?.trim() && tr.batch?.trim() && tr.unit?.trim());
};

export default function ReportGenerator({
  instructor,
  trainees,
  attendanceRecords,
  templates,
  onBatchLogDispatch,
}: ReportGeneratorProps) {
  // Step 1: Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );

  // Hierarchy Filters (Trade > Batch > Unit)
  const availableTrades = instructor.trades || [instructor.trade || 'કોપા (COPA)'];
  const [selectedTrade, setSelectedTrade] = useState<string>(availableTrades[0] || '');

  const availableBatches = instructor.batches || [instructor.batch || '૨૦૨૫–૨૦૨૬'];
  const [selectedBatch, setSelectedBatch] = useState<string>(availableBatches[0] || '');

  const availableUnits = instructor.units || [instructor.unit || 'Unit A'];
  const [selectedUnit, setSelectedUnit] = useState<string>(availableUnits[0] || '');

  // Step 2: Quick Filter
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'low_only' | 'continuous_absent'>('low_only');

  // Trainee Selection State
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [dispatchLoggedNotice, setDispatchLoggedNotice] = useState<boolean>(false);

  // Drag & Drop / Editor Customization State
  const [templateOverrides, setTemplateOverrides] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');
  const [showFieldsPalette, setShowFieldsPalette] = useState<boolean>(true);
  const [isDragOverDoc, setIsDragOverDoc] = useState<boolean>(false);
  const [fieldDropToast, setFieldDropToast] = useState<string | null>(null);

  // Letterhead toggle state (smartly initialized per template)
  const [customHeaderToggle, setCustomHeaderToggle] = useState<Record<string, boolean>>({});

  const editorRef = useRef<HTMLDivElement>(null);

  // Filter trainees by selected Trade, Batch, Unit
  const filteredTrainees = trainees.filter((tr) => {
    const matchesTrade = !selectedTrade || tr.trade === selectedTrade;
    const matchesBatch = !selectedBatch || tr.batch === selectedBatch;
    const matchesUnit = !selectedUnit || tr.unit === selectedUnit;
    if (!matchesTrade || !matchesBatch || !matchesUnit) return false;

    const att = attendanceRecords.find((a) => a.trainee_id === tr.id);
    const pct = att ? att.attendance_percentage : 100;

    if (attendanceFilter === 'low_only') {
      return pct < 80.0;
    }
    if (attendanceFilter === 'continuous_absent') {
      return Boolean(att?.continuous_absent_since);
    }
    return true;
  });

  const assignedFilteredTrainees = filteredTrainees.filter(isTraineeAssigned);
  const totalUnassignedCount = trainees.filter((t) => !isTraineeAssigned(t)).length;

  // Automatically select first valid assigned trainee if none are selected so instructor instantly sees preview
  useEffect(() => {
    if (selectedTraineeIds.length === 0 && assignedFilteredTrainees.length > 0) {
      setSelectedTraineeIds([assignedFilteredTrainees[0].id]);
    }
  }, [assignedFilteredTrainees, selectedTraineeIds.length]);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const currentTemplateContent =
    (selectedTemplate && templateOverrides[selectedTemplate.id]) ||
    selectedTemplate?.content_html ||
    '';

  // Smart check: Does the template already contain a full memo / letter layout?
  // (e.g., Shankheshwar memo starts with supervisor name, trade, ITI, પ્રતિ આચાર્યશ્રી, etc.)
  const templateHasBuiltInHeader = /આચાર્યશ્રી|પ્રતિ|સુ\.ઇ|કચેરી/i.test(currentTemplateContent);

  const showInstituteHeader =
    selectedTemplate && selectedTemplate.id in customHeaderToggle
      ? customHeaderToggle[selectedTemplate.id]
      : !templateHasBuiltInHeader;

  const headerConfig: HeaderConfig =
    instructor.header_config || {
      show_logo: true,
      institute_name_gu: instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા',
      institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
      department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
      address: instructor.institution_address || 'ગુજરાત',
      ref_prefix: instructor.outward_code_prefix || 'ઔતાસં/તલમ/૨૦૨૫',
    };

  // Clean outward prefix without trailing slashes
  const cleanRefPrefix = (headerConfig.ref_prefix || 'ઔતાસં/તલમ/૨૦૨૬').replace(/\/+$/, '');

  // Keep editor content in sync when switching templates or entering editor mode
  useEffect(() => {
    if (viewMode === 'editor' && editorRef.current) {
      editorRef.current.innerHTML = currentTemplateContent;
    }
  }, [viewMode, selectedTemplateId]);

  // Toggle selection (blocks selection if trainee is not assigned)
  const toggleTrainee = (id: string) => {
    const tr = trainees.find((t) => t.id === id);
    if (tr && !isTraineeAssigned(tr)) {
      alert(
        `નિયમ અનુસાર જે તાલીમાર્થીને ટ્રેડ, બેચ અથવા યુનિટ સોંપેલ ન હોય તેમના માટે રિપોર્ટ કે નોટિસ જનરેટ થઈ શકશે નહીં.\n(વિદ્યાર્થી: ${tr.student_name} ${tr.surname})`
      );
      return;
    }
    setSelectedTraineeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    // Only select trainees that have trade, batch, and unit assigned
    setSelectedTraineeIds(assignedFilteredTrainees.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTraineeIds([]);
  };

  // Build merged HTML for any given trainee using centralized merge engine
  const getRenderedMergedHtml = (trainee: Trainee) => {
    if (!selectedTemplate) return '';
    const att = attendanceRecords.find((a) => a.trainee_id === trainee.id);
    const refNo = `${cleanRefPrefix}/${trainee.roll_no || '૧'}`;

    return mergeTemplateTags(currentTemplateContent, {
      trainee,
      attendance: att,
      instructor,
      referenceNumber: refNo,
      noticeIssueDate: new Date().toLocaleDateString('gu-IN'),
      monthYear: att?.month_year || 'ઓગસ્ટ ૨૦૨૫',
      workingDays: att?.total_working_days || 24,
      presentDays: att?.present_days || 0,
      absentDays: att?.absent_days || 0,
      attendancePercentage: att?.attendance_percentage || 0,
      absentFromDate: att?.absent_from_date || '૦૧/૦૯/૨૦૨૫',
      absentToDate: att?.absent_to_date || new Date().toLocaleDateString('gu-IN'),
      continuousAbsentSince: att?.continuous_absent_since || '૦૧/૦૯/૨૦૨૫',
      remarks: att?.remarks || 'વાલીને રૂબરૂ બોલાવવા માટે નોંધ કરેલ છે.',
      language: 'Gujarati',
    });
  };

  // Update modified template content
  const handleTemplateContentChange = (newHtml: string) => {
    if (!selectedTemplate) return;
    setTemplateOverrides((prev) => ({
      ...prev,
      [selectedTemplate.id]: newHtml,
    }));
  };

  // Insert a tag programmatically
  const handleInsertTag = (tag: string) => {
    if (viewMode === 'editor' && editorRef.current) {
      // Insert at current caret position
      editorRef.current.focus();
      document.execCommand('insertText', false, tag);
      handleTemplateContentChange(editorRef.current.innerHTML);
    } else {
      // In preview mode: append or insert before closing table / div
      let updated = currentTemplateContent;
      if (updated.includes('</table>')) {
        updated = updated.replace(
          '</table>',
          `</table>\n<p style="margin-top: 10px; font-weight: bold;">${tag}</p>`
        );
      } else {
        updated += ` ${tag}`;
      }
      handleTemplateContentChange(updated);
    }

    setFieldDropToast(`✓ ડાયનેમિક ફિલ્ડ ${tag} પત્રમાં ઉમેરાયું છે.`);
    setTimeout(() => setFieldDropToast(null), 2500);
  };

  // Handle Drag & Drop directly onto Document
  const handleDragOverDoc = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverDoc) setIsDragOverDoc(true);
  };

  const handleDragLeaveDoc = (e: React.DragEvent<HTMLDivElement>) => {
    // Check if target is leaving the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverDoc(false);
    }
  };

  const handleDropOnDoc = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverDoc(false);

    const tag =
      e.dataTransfer.getData('application/x-merge-tag') ||
      e.dataTransfer.getData('text/plain');

    if (!tag) return;

    if (viewMode === 'editor' && editorRef.current) {
      editorRef.current.focus();
      // Try to place caret exactly at mouse drop point
      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          document.execCommand('insertText', false, tag);
          handleTemplateContentChange(editorRef.current.innerHTML);
        } else {
          document.execCommand('insertText', false, tag);
          handleTemplateContentChange(editorRef.current.innerHTML);
        }
      } else {
        document.execCommand('insertText', false, tag);
        handleTemplateContentChange(editorRef.current.innerHTML);
      }
    } else {
      // When dropped in Live Preview mode:
      // Insert into template content cleanly and refresh live preview
      let updated = currentTemplateContent;
      if (updated.includes('</table>')) {
        updated = updated.replace(
          '</table>',
          `</table>\n<div style="margin: 8px 0; font-weight: bold;">${tag}</div>`
        );
      } else {
        updated += ` ${tag}`;
      }
      handleTemplateContentChange(updated);
    }

    setFieldDropToast(`✓ ડાયનેમિક ફિલ્ડ ${tag} પત્રમાં સફળતાપૂર્વક મૂકાયું!`);
    setTimeout(() => setFieldDropToast(null), 3000);
  };

  // Reset template to default
  const handleResetTemplate = () => {
    if (!selectedTemplate) return;
    if (
      window.confirm(
        'શું તમે ખરેખર ટેમ્પલેટને મૂળ લખાણમાં રીસેટ કરવા માંગો છો? તમારા કસ્ટમ ફેરફારો રદ થશે.'
      )
    ) {
      setTemplateOverrides((prev) => {
        const copy = { ...prev };
        delete copy[selectedTemplate.id];
        return copy;
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = selectedTemplate.content_html;
      }
      setFieldDropToast('ટેમ્પલેટ મૂળ સ્વરૂપમાં રીસેટ કરવામાં આવ્યું.');
      setTimeout(() => setFieldDropToast(null), 2500);
    }
  };

  // Direct Print
  const handlePrint = () => {
    if (selectedTraineeIds.length === 0) {
      alert('કૃપા કરીને પ્રિન્ટ કરવા માટે ઓછામાં ઓછો એક વિદ્યાર્થી પસંદ કરો.');
      return;
    }

    const invalidSelected = trainees
      .filter((t) => selectedTraineeIds.includes(t.id))
      .filter((t) => !isTraineeAssigned(t));

    if (invalidSelected.length > 0) {
      alert(
        `ધ્યાન આપો: પસંદ કરેલ ${invalidSelected.length} તાલીમાર્થીઓ માટે ટ્રેડ, બેચ અથવા યુનિટ સોંપેલ ન હોવાથી નિયમ અનુસાર રિપોર્ટ જનરેટ કે પ્રિન્ટ થઈ શકશે નહીં.\nકૃપા કરીને પ્રથમ તાલીમાર્થી મેનેજમેન્ટમાં જઈ આ વિદ્યાર્થીઓને યોગ્ય ટ્રેડ, બેચ અને યુનિટ સોંપો.`
      );
      return;
    }

    // Automatically log dispatches if handler provided
    if (onBatchLogDispatch) {
      const validTrainees = selectedTraineesList.filter(isTraineeAssigned);
      const logs: DispatchLog[] = validTrainees.map((tr, idx) => {
        const att = attendanceRecords.find((a) => a.trainee_id === tr.id);
        const refNum = `${cleanRefPrefix}/${tr.roll_no || idx + 1}`;
        const todayStr = new Date().toISOString().split('T')[0];
        return {
          id: `disp-${Date.now()}-${idx}`,
          trainee_id: tr.id,
          instructor_id: instructor.id,
          ref_number: refNum,
          outward_number: refNum,
          entry_type: 'outward',
          notice_type: selectedTemplate?.notice_type || '1st Warning',
          subject: selectedTemplate?.subject || 'ગેરહાજરી બાબત નોટિસ',
          issue_date: todayStr,
          issued_date: todayStr,
          attendance_percentage: att ? att.attendance_percentage : 0,
          month_year: att?.month_year || 'ઓગસ્ટ ૨૦૨૫',
          status: 'Printed',
          dispatch_mode: 'સાદી ટપાલ / રૂબરૂ',
          created_at: new Date().toISOString(),
        };
      });

      onBatchLogDispatch(logs);
      setDispatchLoggedNotice(true);
      setTimeout(() => setDispatchLoggedNotice(false), 4000);
    }

    window.print();
  };

  const selectedTraineesList = trainees
    .filter((t) => selectedTraineeIds.includes(t.id))
    .filter(isTraineeAssigned);
  const activePreviewTrainee = selectedTraineesList[activePreviewIndex] || selectedTraineesList[0];

  const isTemplateModified = Boolean(
    selectedTemplate && templateOverrides[selectedTemplate.id]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Printer className="w-6 h-6 text-[#f2edc2]" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              યુનિફાઇડ રિપોર્ટ અને નોટિસ જનરેટર (Unified Report Generation)
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            ટેમ્પલેટ પસંદ કરો → ડાયનેમિક ફિલ્ડ્સ ડ્રેગ & ડ્રોપ કરો → લાઈવ મર્જ પ્રિવ્યુ → સિંગલ કન્સોલિડેટેડ પ્રિન્ટ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePrint}
            disabled={selectedTraineeIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#346739] hover:bg-[#264e2b] disabled:opacity-40 text-[#f2edc2] text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            <Printer className="w-4 h-4" />
            <span>પીડીએફ જનરેટ / પ્રિન્ટ કરો ({selectedTraineeIds.length} પાનાં)</span>
          </button>
        </div>
      </div>

      {dispatchLoggedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 print:hidden animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{selectedTraineeIds.length} વિદ્યાર્થીઓના જાવક પત્રો આવક-જાવક રજીસ્ટરમાં સફળતાપૂર્વક નોંધાઈ ગયા છે.</span>
        </div>
      )}

      {/* Screen Interactive Workspace (Hidden during print) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        {/* Left Column: Config & Trainee Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Choose Template */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#346739] font-black text-[10px] flex items-center justify-center">
                  ૧
                </span>
                <span>રિપોર્ટ ટેમ્પ્લેટ પસંદ કરો</span>
              </span>
              <span className="text-[10px] text-slate-500">{templates.length} ઉપલબ્ધ</span>
            </div>

            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setActivePreviewIndex(0);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-1 focus:ring-[#346739] focus:border-[#346739]"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.template_name || tmpl.name} ({tmpl.notice_type})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800">{selectedTemplate?.subject}</div>
            </div>
          </div>

          {/* 2. Filter Hierarchy (Trade > Batch > Unit) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#346739] font-black text-[10px] flex items-center justify-center">
                  ૨
                </span>
                <span>શૈક્ષણિક યુનિટ અને ફિલ્ટર</span>
              </span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">ટ્રેડ</label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {availableTrades.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">બેચ</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">યુનિટ</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {availableUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance Status Filter */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setAttendanceFilter('low_only')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                  attendanceFilter === 'low_only'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ગેરહાજર (&lt;૮૦%)
              </button>

              <button
                type="button"
                onClick={() => setAttendanceFilter('all')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                  attendanceFilter === 'all'
                    ? 'bg-[#346739] text-[#f2edc2]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                તમામ વિદ્યાર્થી
              </button>
            </div>
          </div>

          {/* 3. Trainees Selection List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            {totalUnassignedCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-bold">{totalUnassignedCount} તાલીમાર્થીઓ</span> માટે ટ્રેડ, બેચ અથવા યુનિટ સોંપેલ ન હોવાથી નિયમ મુજબ રિપોર્ટ જનરેટ થશે નહીં.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#346739] font-black text-[10px] flex items-center justify-center">
                  ૩
                </span>
                <span className="font-bold text-xs text-slate-900">
                  તાલીમાર્થીઓ ({selectedTraineesList.length} માન્ય પસંદિત)
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-blue-700 font-bold hover:underline"
                >
                  માન્ય બધા પસંદ
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  રદ
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredTrainees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  પસંદ કરેલ ફિલ્ટર મુજબ કોઈ વિદ્યાર્થી મળ્યા નથી.
                </div>
              ) : (
                filteredTrainees.map((tr) => {
                  const assigned = isTraineeAssigned(tr);
                  const isChecked = selectedTraineeIds.includes(tr.id) && assigned;
                  const att = attendanceRecords.find((a) => a.trainee_id === tr.id);
                  const pct = att ? att.attendance_percentage : 0;
                  const isLow = pct < 80.0;

                  return (
                    <div
                      key={tr.id}
                      onClick={() => toggleTrainee(tr.id)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                        !assigned
                          ? 'bg-rose-50/50 border-rose-200 opacity-75 cursor-not-allowed'
                          : isChecked
                          ? 'bg-emerald-50/80 border-[#346739] cursor-pointer'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {!assigned ? (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#346739] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {tr.roll_no}. {tr.student_name} {tr.surname}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            મો: {tr.mobile || '—'}
                          </div>
                          {!assigned && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              ⚠️ ટ્રેડ/બેચ/યુનિટ બાકી (રિપોર્ટ અમાન્ય)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-bold text-[10px] px-1.5 py-0.5 rounded-full ${
                            isLow
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Preview & Drag-and-Drop Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Control Bar: Mode Toggle, Dynamic Fields Palette toggle, Header Options */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Left: View Mode Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>લાઈવ મર્જ પ્રિવ્યુ (Preview)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ટેમ્પલેટ & ડ્રેગ-ડ્રોપ એડિટર (Edit & Drag)</span>
              </button>
            </div>

            {/* Middle: Toggle Dynamic Fields Tray & Letterhead */}
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showInstituteHeader}
                  onChange={(e) => {
                    if (selectedTemplate) {
                      setCustomHeaderToggle((prev) => ({
                        ...prev,
                        [selectedTemplate.id]: e.target.checked,
                      }));
                    }
                  }}
                  className="rounded text-[#346739] focus:ring-[#346739]"
                />
                <span className="text-[11px]">સંસ્થા લેટરહેડ બેનર દર્શાવો</span>
              </label>

              <button
                type="button"
                onClick={() => setShowFieldsPalette(!showFieldsPalette)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  showFieldsPalette
                    ? 'bg-emerald-50 text-[#346739] border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5" />
                <span>ડાયનેમિક ફિલ્ડ્સ {showFieldsPalette ? 'છુપાવો' : 'દર્શાવો'}</span>
              </button>

              {isTemplateModified && (
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  title="ટેમ્પલેટમાં કરેલા ફેરફારો રદ કરી મૂળ સ્વરૂપ લાવો"
                  className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold px-2 py-1 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>રીસેટ</span>
                </button>
              )}
            </div>

            {/* Right: Trainee Page Navigator in Preview Mode */}
            {selectedTraineesList.length > 0 && viewMode === 'preview' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  વિદ્યાર્થી {activePreviewIndex + 1} of {selectedTraineesList.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActivePreviewIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activePreviewIndex === 0}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePreviewIndex((prev) =>
                        Math.min(selectedTraineesList.length - 1, prev + 1)
                      )
                    }
                    disabled={activePreviewIndex >= selectedTraineesList.length - 1}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Fields Draggable Palette Tray */}
          {showFieldsPalette && (
            <DraggableFieldsPalette onInsertTag={handleInsertTag} />
          )}

          {/* Field Dropped Alert Notification Toast */}
          {fieldDropToast && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center justify-between animate-in fade-in duration-150">
              <span className="font-semibold">{fieldDropToast}</span>
              <button
                type="button"
                onClick={() => setFieldDropToast(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* DOCUMENT CANVAS CONTAINER (Supports Drag and Drop) */}
          <div
            onDragOver={handleDragOverDoc}
            onDragLeave={handleDragLeaveDoc}
            onDrop={handleDropOnDoc}
            className={`relative bg-slate-100 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto min-h-[580px] border-2 transition-all ${
              isDragOverDoc
                ? 'border-emerald-500 bg-emerald-50/40 shadow-inner'
                : 'border-slate-200'
            }`}
          >
            {/* Visual Drop Target Highlight Overlay */}
            {isDragOverDoc && (
              <div className="absolute inset-4 z-40 bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded-xl flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>ડાયનેમિક ફિલ્ડ અહીં મૂકવા છોડો (Drop dynamic field here)</span>
                </div>
              </div>
            )}

            {selectedTraineesList.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white max-w-md my-auto">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <div className="font-bold text-slate-700 text-sm">કોઈ વિદ્યાર્થી પસંદ થયેલ નથી</div>
                <p className="text-xs text-slate-500 mt-1">
                  ડાબી બાજુની પેનલમાંથી વિદ્યાર્થીઓની પસંદગી કરો જેથી અહીં લાઈવ પત્ર પ્રિવ્યુ જોઈ શકાય.
                </p>
              </div>
            ) : (
              /* A4 Sheet Simulation Canvas */
              <div
                className="bg-white shadow-xl border border-slate-300 p-8 sm:p-10 w-full max-w-[210mm] text-slate-900 font-gujarati rounded-sm space-y-4"
                style={{ minHeight: '297mm' }}
              >
                {/* 1. Optional Institute Letterhead Banner */}
                {showInstituteHeader && (
                  <div className="text-center pb-4 border-b-2 border-slate-900/80 space-y-1 select-none">
                    {headerConfig.show_logo && (
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-slate-300 overflow-hidden mb-1">
                        {headerConfig.logo_url ? (
                          <img
                            src={headerConfig.logo_url}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          'ITI LOGO'
                        )}
                      </div>
                    )}
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      {headerConfig.institute_name_gu}
                    </h1>
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      {headerConfig.institute_name_en}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {headerConfig.department_subtitle}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {headerConfig.address}
                    </div>

                    {/* Ref Number and Date under header */}
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
                      <div>
                        જા.નં.: {cleanRefPrefix}/{activePreviewTrainee?.roll_no || '૧'}
                      </div>
                      <div>તારીખ: {new Date().toLocaleDateString('gu-IN')}</div>
                    </div>

                    {/* Subject Line if separate letterhead */}
                    {selectedTemplate?.subject && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center mt-2">
                        વિષય: {selectedTemplate.subject}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Document Content Area */}
                {viewMode === 'preview' ? (
                  /* Live Merged Mode: HTML parsed with student data */
                  <div
                    className="report-rendered-document text-xs sm:text-sm leading-relaxed text-slate-900 select-text"
                    dangerouslySetInnerHTML={{
                      __html: getRenderedMergedHtml(activePreviewTrainee),
                    }}
                  />
                ) : (
                  /* Template Editor & Drag-and-Drop Mode */
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                      <span>
                        ✏️ <strong>એડિટ મોડ:</strong> તમે ટેક્સ્ટ ટાઈપ કરી શકો છો અથવા ઉપરથી ડાયનેમિક ફિલ્ડ્સ અહીં ડ્રેગ-ડ્રોપ કરી શકો છો.
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className="text-[#346739] font-bold hover:underline ml-2 shrink-0"
                      >
                        પ્રિવ્યુ જુઓ →
                      </button>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleTemplateContentChange(e.currentTarget.innerHTML)
                      }
                      className="outline-none min-h-[460px] text-xs sm:text-sm leading-relaxed text-slate-900 focus:ring-1 focus:ring-emerald-400 p-2 rounded border border-dashed border-slate-300"
                    />
                  </div>
                )}

                {/* 3. Optional Signatory Footer if separate letterhead enabled */}
                {showInstituteHeader && (
                  <div className="pt-8 flex justify-between items-end text-xs select-none border-t border-slate-200">
                    <div className="text-slate-500 text-[10px]">
                      * આ પત્ર ઈન્સ્ટ્રક્ટર પોર્ટલ દ્વારા કમ્પ્યુટરાઈઝ્ડ જનરેટ થયેલ છે.
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                      <div className="font-bold text-slate-900">({instructor.name})</div>
                      <div className="text-[11px] text-slate-600">{instructor.designation}</div>
                      <div className="text-[10px] text-slate-500">
                        {headerConfig.institute_name_gu}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY CONSOLIDATED MULTI-PAGE CONTAINER */}
      {/* Generates high-fidelity continuous sequence of A4 pages for each trainee */}
      {/* ========================================================================= */}
      <div className="hidden print:block space-y-0">
        {selectedTraineesList.map((trainee, idx) => (
          <div
            key={trainee.id}
            className="bg-white p-8 space-y-4 text-slate-900 font-gujarati"
            style={{
              pageBreakAfter: idx < selectedTraineesList.length - 1 ? 'always' : 'auto',
              minHeight: '100vh',
            }}
          >
            {/* Optional Header */}
            {showInstituteHeader && (
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                {headerConfig.show_logo && headerConfig.logo_url && (
                  <div className="w-14 h-14 mx-auto mb-1">
                    <img
                      src={headerConfig.logo_url}
                      alt="Logo"
                      className="w-full h-full object-contain mx-auto"
                    />
                  </div>
                )}
                <h1 className="text-lg font-black text-slate-900">
                  {headerConfig.institute_name_gu}
                </h1>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {headerConfig.institute_name_en}
                </div>
                <div className="text-[11px] text-slate-600">
                  {headerConfig.department_subtitle}
                </div>
                <div className="text-[10px] text-slate-500">
                  {headerConfig.address}
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-2 border-t border-slate-300 mt-2">
                  <div>
                    જા.નં.: {cleanRefPrefix}/{trainee.roll_no}
                  </div>
                  <div>તારીખ: {new Date().toLocaleDateString('gu-IN')}</div>
                </div>

                {selectedTemplate?.subject && (
                  <div className="p-1.5 border-y border-slate-800 text-xs font-black text-center mt-2">
                    વિષય: {selectedTemplate.subject}
                  </div>
                )}
              </div>
            )}

            {/* Rendered Merged HTML Body */}
            <div
              className="report-rendered-document text-sm leading-relaxed text-slate-900 py-2"
              dangerouslySetInnerHTML={{
                __html: getRenderedMergedHtml(trainee),
              }}
            />

            {/* Optional Signatory */}
            {showInstituteHeader && (
              <div className="pt-12 flex justify-between items-end text-xs border-t border-slate-300 mt-6">
                <div className="text-[10px] text-slate-600">
                  સંદર્ભ ફાઈલ: {trainee.enrollment_no} | બેચ: {trainee.batch}
                </div>

                <div className="text-right space-y-0.5">
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <div className="font-bold text-sm text-slate-900">({instructor.name})</div>
                  <div className="text-xs text-slate-700">{instructor.designation}</div>
                  <div className="text-xs text-slate-600">{headerConfig.institute_name_gu}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
