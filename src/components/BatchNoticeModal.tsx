import { useState, useMemo, useRef } from 'react';
import {
  Trainee,
  AttendanceRecord,
  LetterTemplate,
  Instructor,
  DispatchLog,
} from '../types';
import {
  Printer,
  X,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  Building2,
  CheckCircle,
  Download,
  Loader2,
  Eye,
} from 'lucide-react';
import { mergeTemplateTags, generateOutwardReference } from '../utils/mergeTags';
import { exportBatchElementsToPdf, printCleanDocument } from '../utils/pdfExport';
import BatchNoticePrintPreviewModal, { BatchNoticeItem } from './BatchNoticePrintPreviewModal';

interface BatchNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  templates: LetterTemplate[];
  instructor: Instructor;
  dispatchLogs: DispatchLog[];
  onBatchLogDispatch: (logs: Omit<DispatchLog, 'id' | 'created_at'>[]) => void;
}

export default function BatchNoticeModal({
  isOpen,
  onClose,
  trainees,
  attendanceRecords,
  templates,
  instructor,
  dispatchLogs,
  onBatchLogDispatch,
}: BatchNoticeModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>(() => {
    // Default select all low attendance (<80%)
    const flaggedIds = trainees
      .filter((t) => {
        const rec = attendanceRecords.find((r) => r.trainee_id === t.id);
        return rec ? rec.attendance_percentage < 80.0 : false;
      })
      .map((t) => t.id);
    return flaggedIds.length > 0 ? flaggedIds : trainees.slice(0, 3).map((t) => t.id);
  });

  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);
  const [autoLogDispatch, setAutoLogDispatch] = useState<boolean>(true);
  const [isBatchPreviewOpen, setIsBatchPreviewOpen] = useState<boolean>(false);

  // Hook declarations MUST be called unconditionally in the exact same order on every render
  const batchPrintRef = useRef<HTMLDivElement>(null);
  const [isExportingBatchPdf, setIsExportingBatchPdf] = useState(false);
  const [batchPdfProgress, setBatchPdfProgress] = useState('');

  if (!isOpen) return null;

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Map trainees to attendance records
  const traineeDataList = trainees.map((trainee) => {
    const rec = attendanceRecords.find((r) => r.trainee_id === trainee.id);
    const percentage = rec ? rec.attendance_percentage : 75.0;
    const isFlagged = percentage < 80.0;
    return {
      trainee,
      record: rec,
      percentage,
      isFlagged,
    };
  });

  // Selected trainees objects
  const selectedTraineeObjects = traineeDataList.filter((item) =>
    selectedTraineeIds.includes(item.trainee.id)
  );

  // Toggle selection
  const toggleTrainee = (id: string) => {
    if (selectedTraineeIds.includes(id)) {
      setSelectedTraineeIds(selectedTraineeIds.filter((tId) => tId !== id));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, id]);
    }
  };

  const selectAllFlagged = () => {
    const flagged = traineeDataList.filter((t) => t.isFlagged).map((t) => t.trainee.id);
    setSelectedTraineeIds(flagged);
  };

  const selectAll = () => {
    setSelectedTraineeIds(trainees.map((t) => t.id));
  };

  const clearSelection = () => {
    setSelectedTraineeIds([]);
  };

  // Generate HTML for a specific trainee
  const generateLetterHtml = (item: (typeof traineeDataList)[0]) => {
    const { trainee, record, percentage } = item;
    const workingDays = record?.total_working_days || 24;
    const presentDays = record?.present_days || 14;
    const absentDays = record?.absent_days || 10;
    const monthYear = record?.month_year || 'August 2025';
    const refNum = generateOutwardReference(instructor.trade, trainee.roll_no, monthYear);

    // Look up previous dispatch for this trainee
    const traineeDispatches = dispatchLogs.filter((l) => l.trainee_id === trainee.id);
    const lastDate =
      traineeDispatches.length > 0
        ? traineeDispatches[traineeDispatches.length - 1].issue_date
        : undefined;

    return mergeTemplateTags(activeTemplate.content_html, {
      trainee,
      instructor,
      monthYear,
      workingDays,
      presentDays,
      absentDays,
      attendancePercentage: percentage,
      referenceNumber: refNum,
      noticeIssueDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      lastNoticeDate: lastDate,
      aiCommentary:
        percentage < 80
          ? `તાલીમાર્થીની હાજરી ${percentage}% નોંધાયેલ છે, જે નિયમાનુસાર ૮૦% કરતા ઓછી હોવાથી પરીક્ષા માટે ગેરલાયક ઠરી શકે છે. વાલીશ્રીએ તાત્કાલિક સંસ્થા ખાતે આવી ખુલાસો રજૂ કરવો.`
          : undefined,
    });
  };

  // Prepared notice items for preview and export
  const batchNoticeItems: BatchNoticeItem[] = useMemo(() => {
    return selectedTraineeObjects.map((item) => {
      const { trainee, record, percentage, isFlagged } = item;
      const monthYear = record?.month_year || 'August 2025';
      const outwardNumber = generateOutwardReference(instructor.trade, trainee.roll_no, monthYear);
      const html = generateLetterHtml(item);
      return {
        trainee,
        html,
        percentage,
        outwardNumber,
        monthYear,
        isFlagged,
      };
    });
  }, [selectedTraineeObjects, activeTemplate, instructor, dispatchLogs]);

  // Record dispatch logs
  const recordDispatches = () => {
    if (!autoLogDispatch || selectedTraineeObjects.length === 0) return;
    const logsToRecord: Omit<DispatchLog, 'id' | 'created_at'>[] = selectedTraineeObjects.map(
      ({ trainee, record, percentage }) => {
        const monthYear = record?.month_year || 'August 2025';
        const refNum = generateOutwardReference(instructor.trade, trainee.roll_no, monthYear);
        const traineeDispatches = dispatchLogs.filter((l) => l.trainee_id === trainee.id);

        return {
          trainee_id: trainee.id,
          instructor_id: instructor.id,
          ref_number: refNum,
          outward_number: refNum,
          entry_type: 'outward',
          notice_type:
            percentage < 60
              ? 'Final Notice'
              : traineeDispatches.length > 0
              ? '2nd Warning'
              : '1st Warning',
          issue_date: new Date().toISOString().split('T')[0],
          issued_date: new Date().toISOString().split('T')[0],
          month_year: monthYear,
          attendance_percentage: percentage,
          status: 'Dispatched',
        };
      }
    );
    onBatchLogDispatch(logsToRecord);
  };

  // Export all notices as combined multi-page A4 PDF
  const handleExportBatchPdf = async () => {
    if (!batchPrintRef.current) return;
    const pages = Array.from(batchPrintRef.current.children) as HTMLElement[];
    if (pages.length === 0) {
      alert('Please select at least one trainee notice to export.');
      return;
    }

    try {
      setIsExportingBatchPdf(true);
      setBatchPdfProgress(`Starting A4 PDF generation for ${pages.length} notices...`);

      recordDispatches();

      const cleanTrade = instructor.trade.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `ITI_Batch_Notices_${cleanTrade}_${pages.length}_Letters.pdf`;

      await exportBatchElementsToPdf(pages, {
        filename,
        orientation: 'portrait',
        scale: 2.0,
        onProgress: (msg) => setBatchPdfProgress(msg),
        onPageProgress: (curr, total) => {
          setBatchPdfProgress(`Rendering A4 Notice ${curr} of ${total}...`);
        },
      });
    } catch (err) {
      console.error('Batch PDF generation failed:', err);
      alert('Error generating Batch PDF. You can also use the Print All Letters option.');
    } finally {
      setIsExportingBatchPdf(false);
      setBatchPdfProgress('');
    }
  };

  // Reliable Clean Printing
  const handlePrint = async () => {
    recordDispatches();

    if (batchPrintRef.current) {
      await printCleanDocument(batchPrintRef.current, {
        title: `ITI Batch Notices - ${instructor.trade}`,
        orientation: 'portrait',
      });
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Dialog (Hidden on @media print) */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-lg text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Batch Multi-Page Notice Print & Export
              </h3>
              <p className="text-xs text-slate-500">
                Generate seamless multi-page A4 print stream with CSS page breaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Selection Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                1. Select Notice Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Trainee Selection List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Select Trainees ({selectedTraineeIds.length} of {trainees.length})
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={selectAllFlagged}
                    className="text-rose-700 hover:underline font-semibold"
                  >
                    All &lt;80%
                  </button>
                  <span>•</span>
                  <button onClick={selectAll} className="text-blue-700 hover:underline font-semibold">
                    All
                  </button>
                  <span>•</span>
                  <button onClick={clearSelection} className="text-slate-500 hover:underline">
                    Clear
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                {traineeDataList.map(({ trainee, percentage, isFlagged }) => {
                  const isSelected = selectedTraineeIds.includes(trainee.id);
                  return (
                    <div
                      key={trainee.id}
                      onClick={() => toggleTrainee(trainee.id)}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <div>
                          <div className="text-slate-900 font-semibold">
                            Roll {trainee.roll_no}: {trainee.surname} {trainee.student_name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {trainee.village}, {trainee.district}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isFlagged ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                        {isFlagged && (
                          <div className="text-[10px] text-rose-500 font-bold">&lt;80%</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Automatic Outward Register Option */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <label className="flex items-start gap-2 text-xs text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLogDispatch}
                  onChange={(e) => setAutoLogDispatch(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <div>
                  <span className="font-bold">Auto-Record in Outward Dispatch Register</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Automatically creates sequential dispatch entries (e.g. ITI/{instructor.trade.toUpperCase()}/.../01) for all printed trainees.
                  </p>
                </div>
              </label>
            </div>

            {/* Print Preview Check & Confirm Banner */}
            <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-indigo-950">
              <Eye className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs">પ્રિન્ટ પૂર્વાવલોકન અને પુષ્ટિ (Print Preview Check & Confirm)</div>
                <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                  પ્રિન્ટ અથવા પીડીએફ નિકાસ કરતા પહેલાં દરેક પત્રના સરનામાં, ગુજરાતી ફોન્ટ્સ અને જાવક ક્રમાંકની ચકાસણી કરવા માટે નીચેનું <strong>"A4 પ્રિન્ટ પ્રીવ્યૂ"</strong> બટન વાપરો.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Page Live Preview (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 rounded-xl p-4 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3 gap-2 flex-wrap">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>
                    A4 Notice Draft ({selectedTraineeObjects.length > 0 ? previewPageIndex + 1 : 0} / {selectedTraineeObjects.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTraineeObjects.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewPageIndex(Math.max(0, previewPageIndex - 1))}
                        disabled={previewPageIndex === 0}
                        className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-300"
                        title="Previous Notice"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-700" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700 px-1">
                        {previewPageIndex + 1}
                      </span>
                      <button
                        onClick={() =>
                          setPreviewPageIndex(
                            Math.min(selectedTraineeObjects.length - 1, previewPageIndex + 1)
                          )
                        }
                        disabled={previewPageIndex >= selectedTraineeObjects.length - 1}
                        className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-300"
                        title="Next Notice"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                  )}

                  {/* Open Full-Screen A4 Print Preview Modal */}
                  <button
                    onClick={() => setIsBatchPreviewOpen(true)}
                    disabled={selectedTraineeObjects.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs disabled:opacity-40 transition-colors"
                    title="Open full-screen A4 Print Preview modal to check and confirm all notices"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>A4 પ્રિન્ટ પ્રીવ્યૂ</span>
                  </button>
                </div>
              </div>

              {/* Scaled Preview Sheet */}
              <div className="flex justify-center overflow-hidden">
                {selectedTraineeObjects.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    Please select at least one trainee on the left to preview notice.
                  </div>
                ) : (
                  <div className="w-[170mm] max-w-full bg-white border border-slate-300 shadow-md p-6 text-[11px] rounded leading-relaxed select-none max-h-[440px] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center border-b pb-2 mb-3">
                      <div className="font-bold text-slate-800">{instructor.iti_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {instructor.trade} • {instructor.unit} • {instructor.batch}
                      </div>
                    </div>
                    {/* Body */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generateLetterHtml(
                          selectedTraineeObjects[
                            Math.min(previewPageIndex, selectedTraineeObjects.length - 1)
                          ]
                        ),
                      }}
                    />
                    {/* Signature */}
                    <div className="mt-6 pt-2 border-t flex justify-end text-right text-[10px]">
                      <div>
                        <div className="font-bold text-slate-800">{instructor.name}</div>
                        <div className="text-slate-500">{instructor.designation}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Paper Standard: A4 (210 × 297 mm)</span>
              <span>Indic Text Shaping: HarfBuzz Enabled</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 gap-3">
          <div className="text-xs text-slate-600">
            Selected for Export: <strong>{selectedTraineeObjects.length} letters</strong>
            {batchPdfProgress && (
              <span className="ml-2 text-blue-700 font-semibold inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {batchPdfProgress}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>

            {/* A4 Print Preview to Check and Confirm */}
            <button
              onClick={() => setIsBatchPreviewOpen(true)}
              disabled={selectedTraineeObjects.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs disabled:opacity-50 transition-colors"
              title="ચકાસણી અને પુષ્ટિ: પ્રિન્ટ કે સેવ કરતા પહેલાં સંપૂર્ણ A4 પ્રિન્ટ પ્રીવ્યૂ જુઓ"
            >
              <Eye className="w-4 h-4" />
              <span>પ્રિન્ટ પ્રીવ્યૂ (A4 Print Preview)</span>
            </button>

            {/* Direct Multi-Page A4 PDF Export */}
            <button
              onClick={handleExportBatchPdf}
              disabled={selectedTraineeObjects.length === 0 || isExportingBatchPdf}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs disabled:opacity-50 transition-colors"
              title="Download all selected trainee notices into a single combined multi-page A4 PDF file"
            >
              {isExportingBatchPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF તૈયાર થાય છે...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ડાઉનલોડ તમામ A4 PDF</span>
                </>
              )}
            </button>

            {/* Print All Notices */}
            <button
              onClick={handlePrint}
              disabled={selectedTraineeObjects.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs disabled:opacity-50 transition-colors"
              title="Print all selected trainee notices in A4 format"
            >
              <Printer className="w-4 h-4" />
              <span>પ્રિન્ટ તમામ પત્રો (A4 Print)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rendered DOM Stream for High-DPI Canvas Capture & Clean Print Rendering */}
      <div
        ref={batchPrintRef}
        id="batch-print-stream"
        className="fixed -left-[9999px] top-0 pointer-events-none print:static print:pointer-events-auto print:left-auto print:block print:w-full"
      >
        {selectedTraineeObjects.map((item, idx) => (
          <div
            key={item.trainee.id}
            className="w-[210mm] max-w-[210mm] min-h-[297mm] p-12 bg-white text-slate-900 mx-auto flex flex-col justify-between a4-printable-document"
            style={{
              pageBreakAfter: idx < selectedTraineeObjects.length - 1 ? 'always' : 'auto',
              breakAfter: idx < selectedTraineeObjects.length - 1 ? 'page' : 'auto',
              fontFamily:
                activeTemplate.language === 'Hindi'
                  ? "'Noto Sans Devanagari', sans-serif"
                  : "'Noto Sans Gujarati', sans-serif",
            }}
          >
            {/* Header */}
            <div className="mb-6 border-b-2 border-slate-800 pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center">
                  <div className="text-[8px] font-bold">GOVT OF</div>
                  <div className="text-sm font-black text-blue-900">ITI</div>
                  <div className="text-[7px] font-bold">GUJARAT</div>
                </div>

                <div className="text-center grow">
                  <div className="text-xs font-semibold text-slate-600">
                    શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર
                  </div>
                  <h1 className="text-lg font-black text-slate-900 font-serif">
                    {instructor.iti_name}
                  </h1>
                  <div className="text-xs font-semibold text-slate-700">
                    Industrial Training Institute • વ્યવસાય: {instructor.trade} ({instructor.unit})
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ઈમેલ: {instructor.email}
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center">
                  <div className="text-[7px] font-bold text-blue-800">Skill</div>
                  <div className="text-xs font-black text-orange-600">India</div>
                </div>
              </div>
            </div>

            {/* Letter Body */}
            <div
              className="grow leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: generateLetterHtml(item) }}
            />

            {/* Signature Area */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between">
              <div className="border border-dashed border-slate-400 p-2 rounded text-[10px] text-slate-400 max-w-[150px]">
                <div>સંસ્થાનું ગોળ સીલ</div>
                <div className="mt-4 text-center">[ સિક્કો ]</div>
              </div>

              <div className="text-right min-w-[200px]">
                <div className="font-bold text-xs text-slate-900">{instructor.name}</div>
                <div className="text-[11px] text-slate-700">{instructor.designation}</div>
                <div className="text-[10px] text-slate-500">
                  {instructor.trade} • {instructor.iti_name.split('(')[0]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen A4 Print Preview Modal for Batch Notices */}
      {isBatchPreviewOpen && (
        <BatchNoticePrintPreviewModal
          isOpen={isBatchPreviewOpen}
          onClose={() => setIsBatchPreviewOpen(false)}
          notices={batchNoticeItems}
          instructor={instructor}
          templateName={activeTemplate.name}
          language={activeTemplate.language}
          onRecordDispatches={recordDispatches}
        />
      )}
    </div>
  );
}
