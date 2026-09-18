import { useState, useMemo } from 'react';
import {
  LetterTemplate,
  Trainee,
  AttendanceRecord,
  Instructor,
  DispatchLog,
} from '../../types';
import WordRibbon from './WordRibbon';
import A4Canvas from './A4Canvas';
import A4PrintPreviewModal from '../A4PrintPreviewModal';
import { mergeTemplateTags, generateOutwardReference } from '../../utils/mergeTags';
import { exportElementToPdf, printCleanDocument } from '../../utils/pdfExport';
import {
  FileText,
  User,
  Sparkles,
  Printer,
  Save,
  Send,
  Check,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface WordEditorProps {
  templates: LetterTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSaveTemplate: (template: LetterTemplate) => void;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  dispatchLogs: DispatchLog[];
  instructor: Instructor;
  selectedTraineeId?: string;
  onSelectTrainee: (id: string) => void;
  onLogDispatch: (log: Omit<DispatchLog, 'id' | 'created_at'>) => void;
  onTriggerPrint: () => void;
}

export default function WordEditor({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  trainees,
  attendanceRecords,
  dispatchLogs,
  instructor,
  selectedTraineeId,
  onSelectTrainee,
  onLogDispatch,
  onTriggerPrint,
}: WordEditorProps) {
  // Current active template
  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === activeTemplateId) || templates[0];
  }, [templates, activeTemplateId]);

  // Current editor contents
  const [contentHtml, setContentHtml] = useState<string>(currentTemplate?.content_html || '');
  const [templateName, setTemplateName] = useState<string>(currentTemplate?.name || 'Untitled Template');
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'view'>('home');

  // Styling state
  const [fontFamily, setFontFamily] = useState<string>("'Noto Sans Gujarati', sans-serif");
  const [fontSize, setFontSize] = useState<string>('12');
  const [showLetterhead, setShowLetterhead] = useState<boolean>(true);
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [pageMargin, setPageMargin] = useState<'normal' | 'narrow' | 'wide'>('normal');

  // View state
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [previewMerged, setPreviewMerged] = useState<boolean>(false);

  // AI Generation State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Sync content when active template changes
  const handleTemplateChange = (id: string) => {
    onSelectTemplate(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setContentHtml(tmpl.content_html);
      setTemplateName(tmpl.name);
      if (tmpl.language === 'Hindi') {
        setFontFamily("'Noto Sans Devanagari', sans-serif");
      } else if (tmpl.language === 'Gujarati') {
        setFontFamily("'Noto Sans Gujarati', sans-serif");
      }
    }
  };

  // Selected Trainee for preview
  const currentTrainee = useMemo(() => {
    if (selectedTraineeId) {
      const found = trainees.find((t) => t.id === selectedTraineeId);
      if (found) return found;
    }
    return trainees[0];
  }, [trainees, selectedTraineeId]);

  // Selected Trainee's latest attendance
  const currentAttendance = useMemo(() => {
    if (!currentTrainee) return null;
    const recs = attendanceRecords.filter((r) => r.trainee_id === currentTrainee.id);
    return recs[recs.length - 1] || null;
  }, [attendanceRecords, currentTrainee]);

  // Selected Trainee's last dispatch log
  const lastNoticeDate = useMemo(() => {
    if (!currentTrainee) return undefined;
    const logs = dispatchLogs.filter((l) => l.trainee_id === currentTrainee.id);
    if (logs.length === 0) return undefined;
    return logs[logs.length - 1].issue_date;
  }, [dispatchLogs, currentTrainee]);

  // Merged HTML evaluation
  const mergedHtml = useMemo(() => {
    if (!currentTrainee) return contentHtml;
    const workingDays = currentAttendance?.total_working_days || 24;
    const presentDays = currentAttendance?.present_days || 14;
    const absentDays = currentAttendance?.absent_days || (workingDays - presentDays);
    const percentage = currentAttendance?.attendance_percentage || Number(((presentDays / workingDays) * 100).toFixed(2));
    const monthYear = currentAttendance?.month_year || 'August 2025';
    const refNumber = generateOutwardReference(instructor.trade, currentTrainee.roll_no, monthYear);

    return mergeTemplateTags(contentHtml, {
      trainee: currentTrainee,
      instructor,
      monthYear,
      workingDays,
      presentDays,
      absentDays,
      attendancePercentage: percentage,
      referenceNumber: refNumber,
      noticeIssueDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      lastNoticeDate,
      aiCommentary:
        currentAttendance && currentAttendance.attendance_percentage < 80
          ? `તાલીમાર્થીની હાજરી ${percentage}% નોંધાયેલ છે, જે નિયમાનુસાર ૮૦% કરતા ઓછી હોવાથી પરીક્ષા માટે ગેરલાયક ઠરી શકે છે. વાલીશ્રીએ તાત્કાલિક સંસ્થા ખાતે આવી ખુલાસો રજૂ કરવો.`
          : undefined,
    });
  }, [contentHtml, currentTrainee, currentAttendance, instructor, lastNoticeDate]);

  // Execute standard formatting commands
  const handleExecuteCommand = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
  };

  // Insert Dynamic Variable into editor
  const handleInsertTag = (tag: string) => {
    // If in contentEditable, insert at cursor or append
    document.execCommand('insertHTML', false, `<span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: bold;">${tag}</span>&nbsp;`);
  };

  // Insert Table
  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #94a3b8;"><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">Cell ${r + 1},${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p></p>';
    document.execCommand('insertHTML', false, tableHtml);
  };

  // Save current template
  const handleSave = () => {
    onSaveTemplate({
      ...currentTemplate,
      name: templateName,
      content_html: contentHtml,
      updated_at: new Date().toISOString(),
    });
    setAiMessage('Template saved successfully!');
    setTimeout(() => setAiMessage(null), 2500);
  };

  // Call Gemini AI: Smart Parent Advisory Commentary
  const handleGenerateAiCommentary = async () => {
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const resp = await fetch('/api/gemini/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentTrainee
            ? `${currentTrainee.surname} ${currentTrainee.student_name}`
            : 'તાલીમાર્થી',
          presentDays: currentAttendance?.present_days || 12,
          absentDays: currentAttendance?.absent_days || 12,
          totalWorkingDays: currentAttendance?.total_working_days || 24,
          attendancePercentage: currentAttendance?.attendance_percentage || 50.0,
          previousNoticeHistory: lastNoticeDate ? `Previous notice issued on ${lastNoticeDate}` : 'First notice',
          language: currentTemplate.language,
          tone: 'Firm, Urgent & Officially Polite',
        }),
      });

      const data = await resp.json();
      if (data.commentary) {
        // Insert into editor as dynamic paragraph
        const commentaryBlock = `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px; margin: 14px 0; font-size: 12px; color: #991b1b; border-radius: 0 6px 6px 0;"><strong>વાલીશ્રી માટે વિશેષ સુચના (Special Parent Advisory):</strong><br/>${data.commentary}</div><p></p>`;
        document.execCommand('insertHTML', false, commentaryBlock);
        setAiMessage('✨ Gemini AI Parent Commentary inserted!');
      }
    } catch (err: any) {
      console.error('AI Commentary error:', err);
      setAiMessage('Could not connect to Gemini API. Using default administrative phrasing.');
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(null), 4000);
    }
  };

  // Call Gemini AI: Polish Vernacular / Grammar Check
  const handleGrammarCheck = async () => {
    setIsAiLoading(true);
    setAiMessage(null);
    try {
      const resp = await fetch('/api/gemini/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentHtml,
          language: currentTemplate.language,
        }),
      });
      const data = await resp.json();
      if (data.polishedText) {
        setContentHtml(data.polishedText);
        setAiMessage('✨ Text polished with official administrative grammar!');
      }
    } catch (err: any) {
      console.error('Grammar check error:', err);
      setAiMessage('Polishing failed. Reverting to original text.');
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(null), 4000);
    }
  };

  // Manual Dispatch Log action from within editor
  const handleLogAsDispatched = () => {
    if (!currentTrainee) return;
    const monthYear = currentAttendance?.month_year || 'August 2025';
    const refNum = generateOutwardReference(instructor.trade, currentTrainee.roll_no, monthYear);
    const percentage = currentAttendance?.attendance_percentage || 60.0;

    onLogDispatch({
      trainee_id: currentTrainee.id,
      instructor_id: instructor.id,
      outward_number: refNum,
      notice_type: percentage < 60 ? 'Final Notice' : lastNoticeDate ? '2nd Warning' : '1st Warning',
      issue_date: new Date().toISOString().split('T')[0],
      month_year: monthYear,
      attendance_percentage: percentage,
      status: 'Dispatched',
    });

    setDispatchSuccessMsg(`Logged Outward: ${refNum} for ${currentTrainee.student_name}`);
    setTimeout(() => setDispatchSuccessMsg(null), 3000);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Direct A4 PDF Download
  const handleExportPdf = async () => {
    const sheetEl = document.getElementById('notice-a4-sheet');
    if (!sheetEl) {
      setIsPrintModalOpen(true);
      return;
    }

    try {
      setIsExportingPdf(true);
      const studentTag = currentTrainee
        ? `Roll_${currentTrainee.roll_no}_${currentTrainee.student_name.replace(/\s+/g, '_')}`
        : 'Template';
      const cleanTemplateName = currentTemplate.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `ITI_Notice_${studentTag}_${cleanTemplateName}.pdf`;

      await exportElementToPdf(sheetEl, {
        filename,
        orientation: 'portrait',
        scale: 2.2,
      });
    } catch (err) {
      console.error('Failed to export Notice PDF:', err);
      // Fallback to opening preview modal
      setIsPrintModalOpen(true);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Reliable Clean A4 Print & Preview
  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Document Selector & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Template Selector & Name */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Template:</span>
            <select
              value={activeTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.language})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Template Name..."
          />
        </div>

        {/* Right: Trainee Live Preview Selector & Quick Dispatch Log */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Trainee Selector */}
          <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
            <User className="w-3.5 h-3.5 text-blue-700" />
            <span className="font-semibold text-blue-900">Preview Trainee:</span>
            <select
              value={currentTrainee?.id || ''}
              onChange={(e) => onSelectTrainee(e.target.value)}
              className="bg-transparent font-bold text-blue-900 focus:outline-none cursor-pointer"
            >
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  Roll {t.roll_no}: {t.student_name} ({t.surname})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Log Dispatch button */}
          <button
            onClick={handleLogAsDispatched}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            title="Record entry in Dispatch Outward Register"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Log Outward</span>
          </button>
        </div>
      </div>

      {/* AI / Action Notifications Banner */}
      {aiMessage && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{aiMessage}</span>
        </div>
      )}

      {dispatchSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* MS Word 2021 Container */}
      <div className="bg-[#e9edf2] rounded-xl border border-slate-300 shadow-sm relative">
        {/* Word 2021 Ribbon Header & Tabs */}
        <WordRibbon
          activeTab={activeRibbonTab}
          setActiveTab={setActiveRibbonTab}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onExecuteCommand={handleExecuteCommand}
          onInsertTag={handleInsertTag}
          onInsertTable={handleInsertTable}
          showLetterhead={showLetterhead}
          setShowLetterhead={setShowLetterhead}
          showSignature={showSignature}
          setShowSignature={setShowSignature}
          pageMargin={pageMargin}
          setPageMargin={setPageMargin}
          showRuler={showRuler}
          setShowRuler={setShowRuler}
          showMarginGuides={showMarginGuides}
          setShowMarginGuides={setShowMarginGuides}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          previewMerged={previewMerged}
          setPreviewMerged={setPreviewMerged}
          onTriggerAiCommentary={handleGenerateAiCommentary}
          onTriggerGrammarCheck={handleGrammarCheck}
          isAiLoading={isAiLoading}
          onSaveTemplate={handleSave}
          onPrintDocument={handlePrint}
          onExportPdf={handleExportPdf}
          isExportingPdf={isExportingPdf}
        />

        {/* Info bar below ribbon */}
        <div className="bg-white/80 border-b border-slate-200 px-4 py-1.5 text-xs flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mode:</span>
            {previewMerged ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                Merged Live Preview (Roll {currentTrainee?.roll_no}: {currentTrainee?.student_name})
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px]">
                Template Edit Mode (Placeholders Active)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Language: <strong>{currentTemplate.language}</strong></span>
            <span>A4 Size: 210mm × 297mm</span>
            {lastNoticeDate && (
              <span className="text-amber-700 font-medium">
                Last Notice: {lastNoticeDate}
              </span>
            )}
          </div>
        </div>

        {/* A4 Canvas Sheet */}
        <div className="p-4 sm:p-8 min-h-[700px] flex justify-center bg-[#dfe3e8]">
          <A4Canvas
            contentHtml={contentHtml}
            onContentChange={setContentHtml}
            fontFamily={fontFamily}
            fontSize={fontSize}
            showLetterhead={showLetterhead}
            showSignature={showSignature}
            pageMargin={pageMargin}
            showRuler={showRuler}
            showMarginGuides={showMarginGuides}
            zoomLevel={zoomLevel}
            previewMerged={previewMerged}
            mergedHtml={mergedHtml}
            instructor={instructor}
            onZoomChange={setZoomLevel}
          />
        </div>
      </div>

      {/* A4 Print Preview Modal for Notice */}
      {isPrintModalOpen && (
        <A4PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`નોટિસ પ્રિન્ટ પ્રીવ્યૂ - ${currentTrainee ? currentTrainee.student_name : 'ટેમ્પ્લેટ'}`}
          subtitle={`${instructor.iti_name} • ${currentTemplate.name}`}
          filename={`ITI_Notice_${currentTrainee ? `Roll_${currentTrainee.roll_no}_${currentTrainee.student_name.replace(/\s+/g, '_')}` : 'Notice'}`}
          initialOrientation="portrait"
        >
          <div
            className="w-full text-slate-900 leading-relaxed"
            style={{
              fontFamily,
              fontSize: `${fontSize}pt`,
            }}
          >
            {/* Letterhead */}
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

                  {/* Header Text */}
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

            {/* Merged Notice Body */}
            <div
              className="prose max-w-none text-slate-900 leading-relaxed min-h-[350px]"
              dangerouslySetInnerHTML={{ __html: mergedHtml }}
            />

            {/* Signature Block */}
            {showSignature && (
              <div className="mt-12 pt-4 border-t border-slate-300 flex items-end justify-between select-none">
                {/* Left: ITI Seal */}
                <div className="border border-dashed border-slate-400 p-2 rounded text-[10px] text-slate-500 max-w-[170px] bg-slate-50/60">
                  <div className="font-bold text-slate-700">સંસ્થાનું ગોળ સીલ (ITI Seal)</div>
                  <div className="text-[9px] text-slate-400 mt-4 text-center">
                    [ સત્તાવાર સિક્કો અહીં લગાવો ]
                  </div>
                </div>

                {/* Center: Badge */}
                <div className="text-center text-[10px] text-slate-400">
                  <div className="inline-flex items-center gap-1 font-mono text-[9px] text-slate-500">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Authorized Administrative Notice</span>
                  </div>
                </div>

                {/* Right: Signature */}
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
        </A4PrintPreviewModal>
      )}
    </div>
  );
}
