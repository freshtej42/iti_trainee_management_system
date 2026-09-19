import { useState, useMemo, useRef, useEffect } from 'react';
import { Instructor, Trainee, AttendanceRecord, DispatchLog } from '../types';
import {
  Printer,
  FileCheck,
  Calendar,
  Send,
  Plus,
  Trash2,
  Building2,
  ExternalLink,
  Edit3,
  Download,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { exportElementToPdf, printCleanDocument } from '../utils/pdfExport';
import A4PrintPreviewModal from './A4PrintPreviewModal';
import { useLanguage } from '../contexts/LanguageContext';

interface PrincipalReportProps {
  instructor: Instructor;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  dispatchLogs: DispatchLog[];
  onOpenBatchModal: () => void;
  onSelectTraineeForNotice: (traineeId: string, templateId?: string) => void;
}

interface ReportRow {
  id: string;
  traineeId: string;
  rollNo: string;
  nameAndAddress: string;
  continuousAbsentSince: string;
  attendancePercentage: number;
  remarks: string;
}

export default function PrincipalReport({
  instructor,
  trainees,
  attendanceRecords,
  dispatchLogs,
  onOpenBatchModal,
  onSelectTraineeForNotice,
}: PrincipalReportProps) {
  const { t, tText } = useLanguage();

  // Available Months
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(attendanceRecords.map((r) => r.month_year)));
    return months.length > 0 ? months : ['August 2025', 'September 2025'];
  }, [attendanceRecords]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || 'August 2025');
  const [reportDate, setReportDate] = useState<string>(
    new Date().toLocaleDateString('gu-IN')
  );
  const [supervisorName, setSupervisorName] = useState<string>(instructor.name);
  const [tradeName, setTradeName] = useState<string>(instructor.trade);
  const [itiName, setItiName] = useState<string>(instructor.iti_name);

  // Gujarati numeral conversion helper
  const toGujaratiDigits = (num: number | string): string => {
    const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    return String(num).replace(/[0-9]/g, (w) => gujaratiDigits[+w]);
  };

  // Convert English month to Gujarati display
  const formatMonthGujarati = (monthYear: string): string => {
    const map: Record<string, string> = {
      'August 2025': 'ઓગસ્ટ ૨૦૨૫',
      'September 2025': 'સપ્ટેમ્બર ૨૦૨૫',
      'October 2025': 'ઓક્ટોબર ૨૦૨૫',
      'July 2025': 'જુલાઈ ૨૦૨૫',
    };
    return map[monthYear] || monthYear;
  };

  // Build rows from attendance records (<80% or flagged)
  const initialRows = useMemo(() => {
    const instructorTraineeMap = new Map(trainees.map((t) => [t.id, t]));

    const filteredRecords = attendanceRecords.filter(
      (rec) =>
        rec.month_year === selectedMonth &&
        rec.instructor_id === instructor.id &&
        instructorTraineeMap.has(rec.trainee_id) &&
        rec.attendance_percentage < 80.0
    );

    return filteredRecords.map((rec, index) => {
      const trainee = instructorTraineeMap.get(rec.trainee_id)!;
      const fullAddr = [trainee.address, trainee.village, trainee.taluka ? `તા. ${trainee.taluka}` : '', trainee.district ? `જિ. ${trainee.district}` : '', trainee.pincode]
        .filter(Boolean)
        .join(', ');

      const fullName = `${trainee.surname} ${trainee.student_name} ${trainee.father_name}`;

      return {
        id: rec.id,
        traineeId: trainee.id,
        rollNo: trainee.roll_no || String(index + 1),
        nameAndAddress: `${fullName}\n${fullAddr}`,
        continuousAbsentSince:
          rec.continuous_absent_since ||
          rec.absent_from_date ||
          `૧૧/૦૮/૨૦૨૫ થી`,
        attendancePercentage: rec.attendance_percentage,
        remarks: rec.remarks || 'ઓછી ટકાવારી અંગે વાલીને જાણ કરવા ભલામણ',
      };
    });
  }, [attendanceRecords, trainees, selectedMonth, instructor.id]);

  // Editable rows state
  const [rows, setRows] = useState<ReportRow[]>(initialRows);

  // Sync rows when month or initial data changes
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const handleRowChange = (index: number, field: keyof ReportRow, value: string | number) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomRow = () => {
    const newRow: ReportRow = {
      id: `custom-${Date.now()}`,
      traineeId: '',
      rollNo: String(rows.length + 1),
      nameAndAddress: 'તાલીમાર્થીનું નામ અને સરનામું લખો...',
      continuousAbsentSince: 'સતત ગેરહાજર તારીખ',
      attendancePercentage: 65.0,
      remarks: 'વાલીને જાણ કરવી',
    };
    setRows((prev) => [...prev, newRow]);
  };

  const reportPaperRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handlePrint = () => {
    // Generate true A4 Portrait preview and allow direct printing or saving as PDF
    setIsPrintModalOpen(true);
  };

  const handleExportPdf = async () => {
    if (!reportPaperRef.current) return;
    try {
      setIsExportingPdf(true);
      setExportProgress('PDF તૈયાર થઈ રહ્યો છે...');
      const cleanMonth = selectedMonth.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `આચાર્યશ્રી_ગેરહાજરી_રિપોર્ટ_${cleanMonth}.pdf`;

      await exportElementToPdf(reportPaperRef.current, {
        filename,
        orientation,
        scale: 2.2,
        onProgress: (msg) => setExportProgress(msg),
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      // Fallback to opening A4 print preview
      setIsPrintModalOpen(true);
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                ITI Shankheshwar (Mahila) Official Document Format
              </span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                {tText('આચાર્યશ્રી રિપોર્ટ', 'प्राचार्य रिपोर्ट', 'Principal Report')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {tText(
                'તાલીમાર્થીની ગેરહાજરી તેમજ ઓછી ટકાવારીની વાલીને જાણ કરવા બાબત રજૂઆત',
                'प्रशिक्षु की अनुपस्थिति एवं कम प्रतिशत की अभिभावक को सूचना देने विषयक प्रस्तुति',
                'Report to Principal Regarding Trainee Absence and Low Attendance Notification to Parents'
              )}
            </h2>
            <p className="text-xs text-slate-500">
              {tText(
                'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર દ્વારા આચાર્યશ્રીને મોકલાતો સત્તાવાર અહેવાલ અને પત્રક.',
                'पर्यवेक्षक प्रशिक्षक द्वारा प्राचार्य को भेजी जाने वाली आधिकारिक रिपोर्ट एवं तालिका।',
                'Supervisor Instructor official forwarding report to Principal with attendance sheet.'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-semibold text-slate-700">{tText('માસ:', 'माह:', 'Month:')}</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthGujarati(m)} ({m})
                  </option>
                ))}
              </select>
            </div>

            {/* A4 Orientation Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  orientation === 'portrait'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Portrait (Standard Official Letter size 210 × 297 mm)"
              >
                {tText('ઉભું (Portrait)', 'खड़ा (Portrait)', 'Portrait')}
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  orientation === 'landscape'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Landscape (Wide Table size 297 × 210 mm)"
              >
                {tText('આડું (Landscape)', 'आड़ा (Landscape)', 'Landscape')}
              </button>
            </div>

            <button
              onClick={handleAddCustomRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {tText('રો ઉમેરો', 'पंक्ति जोड़ें', 'Add Row')}
            </button>

            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {tText('તમામ વાલીઓને નોટિસ મોકલો', 'सभी अभिभावकों को नोटिस भेजें', 'Send Notices to All Parents')}
            </button>

            {/* Download A4 PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all disabled:opacity-50"
              title="Download clean A4 PDF file directly"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{exportProgress || tText('PDF તૈયાર થાય છે...', 'PDF तैयार हो रही है...', 'Preparing PDF...')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>{tText('ડાઉનલોડ PDF (A4 Export)', 'डाउनलोड PDF (A4 Export)', 'Download PDF (A4)')}</span>
                </>
              )}
            </button>

            {/* A4 Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-all"
              title="Print document in true A4 size"
            >
              <Printer className="w-4 h-4" />
              <span>{tText('પ્રિન્ટ (A4 Print)', 'प्रिंट (A4 Print)', 'Print (A4)')}</span>
            </button>
          </div>
        </div>

        {/* Informational Notification */}
        <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            💡 <strong>{tText('માર્ગદર્શન:', 'मार्गदर्शन:', 'Guidance:')}</strong> {tText(
              'આ રિપોર્ટ પસંદ કરેલ માસના ૮૦% થી ઓછી હાજરી વાળા તાલીમાર્થીઓની યાદી આપોઆપ બનાવે છે.',
              'यह रिपोर्ट चयनित माह में ८०% से कम उपस्थिति वाले प्रशिक्षुओं की सूची स्वतः तैयार करती है।',
              'This report automatically lists trainees with attendance below 80% for the selected month.'
            )}
          </span>
          <span className="font-semibold text-amber-900 shrink-0">
            {tText('કુલ અનિયમિત તાલીમાર્થી:', 'कुल अनियमित प्रशिक्षु:', 'Total Irregular Trainees:')} {rows.length}
          </span>
        </div>
      </div>

      {/* Official A4 Paper Canvas Matching Image 1 Exactly */}
      <div className="flex justify-center print:block print:w-full print:m-0 print:p-0">
        <div
          ref={reportPaperRef}
          id="principal-report-canvas"
          className={`w-full ${
            orientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[210mm]'
          } bg-white text-slate-900 border border-slate-300 shadow-xl rounded-sm p-8 sm:p-12 font-serif text-[15px] leading-relaxed a4-printable-document print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none print:rounded-none`}
        >
          {/* Top-Right Sender Information matching Image 1 */}
          <div className="flex justify-end mb-6">
            <div className="text-left leading-snug text-sm sm:text-[15px] min-w-[260px]">
              <div className="flex items-center gap-1">
                <span className="font-bold">{tText('સુ.ઇ નું નામ :', 'पर्यवेक्षक अनुदेशक নাম :', 'SI Name:')}</span>
                <input
                  type="text"
                  value={supervisorName || ''}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 text-sm w-44"
                />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-bold">{tText('ટ્રેડ :', 'ट्रेड :', 'Trade:')}</span>
                <input
                  type="text"
                  value={tradeName || ''}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 text-sm w-44"
                />
              </div>
              <div className="mt-0.5">
                <input
                  type="text"
                  value={itiName || ''}
                  onChange={(e) => setItiName(e.target.value)}
                  className="font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 text-sm w-full"
                />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-bold">{tText('તારીખ :', 'दिनांक :', 'Date:')}</span>
                <input
                  type="text"
                  value={reportDate || ''}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="font-medium bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 text-sm w-32"
                />
              </div>
            </div>
          </div>

          {/* Left Recipient Header matching Image 1 */}
          <div className="mb-4 text-sm sm:text-[15px] leading-snug">
            <div className="font-bold">{tText('પ્રતિ,', 'प्रति,', 'To,')}</div>
            <div className="font-bold">{tText('આચાર્યશ્રી,', 'प्राचार्य महोदय,', 'The Principal,')}</div>
            <div>{tText('ઔદ્યોગિક તાલીમ સંસ્થા', 'औद्योगिक प्रशिक्षण संस्थान', 'Industrial Training Institute')}</div>
            <div>{tText('શંખેશ્વર(મહિલા).', 'शंखेश्वर (महिला).', 'Shankheshwar (Women).')}</div>
          </div>

          {/* Subject Line matching Image 1 */}
          <div className="text-left font-bold text-sm sm:text-[15px] my-3">
            {tText(
              'વિષય : તાલીમાર્થીની ગેરહાજરી તેમજ ઓછી ટકાવારીની વાલીને જાણ કરવા બાબત.',
              'विषय : प्रशिक्षु की अनुपस्थिति एवं कम प्रतिशत की अभिभावक को सूचना देने बाबत।',
              'Subject: Trainee absence and notifying parents regarding low attendance.'
            )}
          </div>

          {/* Salutation & Body Paragraph matching Image 1 */}
          <div className="text-sm sm:text-[15px] mb-2 font-bold">
            {tText('માનનીય સાહેબશ્રી,', 'आदरणीय महोदय,', 'Respected Sir,')}
          </div>

          <p className="text-sm sm:text-[15px] text-justify leading-relaxed mb-5" style={{ textIndent: '2rem' }}>
            {tText(
              'ઉપરોક્ત વિષય અન્વયે જણાવવાનું કે આ સાથે અત્રેના ટ્રેડમાં તાલીમ લઈ રહેલા નીચેના તાલીમાર્થીઓની હાજરીની વિગત',
              'उपरोक्त विषय के संदर्भ में सूचित करना है कि इसके साथ हमारे ट्रेड में प्रशिक्षण ले रहे निम्नलिखित प्रशिक्षुओं की उपस्थिति विवरण',
              'With reference to the above subject, the attendance details of the following trainees currently under training in this trade for'
            )}{' '}
            <span className="font-bold border-b border-slate-400 px-1">
              {formatMonthGujarati(selectedMonth)}
            </span>{' '}
            {tText(
              'માસ અંતિત નીચે મુજબ છે આ તાલીમાર્થીઓની હાજરી પરિક્ષામાં બેસવાના સમયે ૮૦ ટકાથી ઓછી હાજરી હશે તો પરિક્ષામાં બેસવા નહિ દેવા અંગેની જાણ તથા સંસ્થા ખાતે નિયમિત હાજરી આપે તે અંગે જાણ કરવા વિનંતી.',
              'माह अंत में नीचे दिए अनुसार है। इन प्रशिक्षुओं की परीक्षा समय पर ८०% से कम उपस्थिति होने पर परीक्षा में बैठने न देने संबंधी सूचना तथा नियमित उपस्थिति हेतु अवगत कराने की विनती है।',
              'month-end are as given below. You are requested to notify guardians that trainees with attendance below 80% will not be eligible to appear for the exam and to ensure regular attendance.'
            )}
          </p>

          {/* The Official 5-Column Table matching Image 1 */}
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border-2 border-black text-xs sm:text-[13.5px] leading-snug">
              <thead>
                <tr className="border-b-2 border-black bg-slate-50 font-bold text-center">
                  <th className="border border-black p-2 w-[8%] text-center">
                    {tText('ક્રમ', 'क्र.', 'Sr.')}
                  </th>
                  <th className="border border-black p-2 w-[44%] text-center">
                    {tText('તાલીમાર્થીનું નામ અને સરનામું', 'प्रशिक्षु का नाम और पता', 'Trainee Name & Address')}
                  </th>
                  <th className="border border-black p-2 w-[22%] text-center">
                    {tText('કઈ તારીખથી સતત ગેરહાજર છે?', 'किस तारीख से लगातार अनुपस्थित है?', 'Continuous Absent Since')}
                  </th>
                  <th className="border border-black p-2 w-[14%] text-center">
                    {tText('માસ અંતિત હાજરીના ટકા', 'माह अंत में उपस्थिति प्रतिशत', 'Month-End Attendance %')}
                  </th>
                  <th className="border border-black p-2 w-[12%] text-center">
                    {tText('નોંધ', 'टिप्पणी', 'Remarks')}
                  </th>
                  <th className="border border-black p-1 w-[6%] text-center print:hidden">
                    {tText('એક્શન', 'कार्यवाही', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-black p-4 text-center text-slate-500 italic"
                    >
                      આ માસ માટે ૮૦% થી ઓછી હાજરી વાળો કોઈ તાલીમાર્થી નથી.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const gujIndex = toGujaratiDigits(index + 1);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50">
                        {/* Serial Number */}
                        <td className="border border-black p-2 text-center font-bold align-top">
                          {gujIndex}
                        </td>

                        {/* Trainee Name and Address */}
                        <td className="border border-black p-2 align-top">
                          <textarea
                            value={row.nameAndAddress || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'nameAndAddress', e.target.value)
                            }
                            rows={2}
                            className="w-full bg-transparent border-none resize-none focus:outline-hidden font-medium text-slate-900 leading-tight"
                          />
                        </td>

                        {/* Continuous Absent Date */}
                        <td className="border border-black p-2 text-center align-top">
                          <input
                            type="text"
                            value={row.continuousAbsentSince || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'continuousAbsentSince', e.target.value)
                            }
                            className="w-full bg-transparent border-none text-center focus:outline-hidden font-medium text-slate-900 text-xs sm:text-[13px]"
                          />
                        </td>

                        {/* Attendance Percentage */}
                        <td className="border border-black p-2 text-center font-bold align-top">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={row.attendancePercentage ?? 0}
                              onChange={(e) =>
                                handleRowChange(
                                  index,
                                  'attendancePercentage',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-14 bg-transparent border-none text-center focus:outline-hidden font-bold text-slate-900"
                            />
                            <span>%</span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="border border-black p-2 align-top text-xs sm:text-[13px]">
                          <textarea
                            value={row.remarks || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'remarks', e.target.value)
                            }
                            rows={2}
                            className="w-full bg-transparent border-none resize-none focus:outline-hidden text-slate-800"
                          />
                        </td>

                        {/* Action buttons (hidden in print) */}
                        <td className="border border-black p-1 text-center align-middle print:hidden">
                          <div className="flex flex-col items-center gap-1">
                            {row.traineeId && (
                              <button
                                onClick={() =>
                                  onSelectTraineeForNotice(
                                    row.traineeId,
                                    'tpl-shankheshwar-parent'
                                  )
                                }
                                title="આ તાલીમાર્થીની વાલી નોટિસ બનાવો (Generate Parent Notice)"
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveRow(index)}
                              title="રો કાઢી નાખો"
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom-Left Forwarding Note matching Image 1 */}
          <div className="mt-6 text-sm sm:text-[15px] leading-normal">
            <div>{tText('ઉપરોક્ત તાલીમાર્થીઓ અંગે ઘટતી કાર્યવાહી કરવા નમ્ર વિનંતી.', 'उपरोक्त प्रशिक्षुओं के संबंध में उचित कार्यवाही हेतु सादर निवेदन।', 'Kindly take appropriate action regarding the above trainees.')}</div>
            <div className="mt-1">{tText('આભાર સહ....', 'सधन्यवाद....', 'With regards....')}</div>
          </div>

          {/* Bottom-Right Signature Block matching Image 1 */}
          <div className="flex justify-end mt-12 mb-4">
            <div className="text-center min-w-[220px]">
              <div className="h-12 flex items-end justify-center">
                {/* Visual signature placeholder if needed */}
                <div className="border-b border-slate-400 w-36"></div>
              </div>
              <div className="font-bold text-sm sm:text-[15px] mt-1">{tText('આપનો વિશ્વાસુ', 'भवदीय', 'Yours faithfully')}</div>
              <div className="text-xs sm:text-sm text-slate-800 mt-0.5">
                ({supervisorName})
              </div>
              <div className="text-xs text-slate-600">
                {tText('સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (સુ.ઇ.)', 'पर्यवेक्षक अनुदेशक (प.अ.)', 'Supervisor Instructor (SI)')}
              </div>
              <div className="text-xs text-slate-600">
                {tradeName}, {itiName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Size Portrait Print Preview & Direct Print / Save PDF Modal */}
      {isPrintModalOpen && (
        <A4PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={tText('આચાર્યશ્રી ગેરહાજરી રજૂઆત અહેવાલ', 'प्राचार्य अनुपस्थिति प्रस्तुति रिपोर्ट', 'Principal Absence Forwarding Report')}
          subtitle={`${itiName} • ${tradeName} • ${formatMonthGujarati(selectedMonth)}`}
          filename={`ITI_Principal_Report_${selectedMonth.replace(/\s+/g, '_')}`}
          initialOrientation={orientation}
        >
          <div className="font-serif text-[14px] leading-relaxed text-slate-900 select-text">
            {/* Top-Right Sender Information */}
            <div className="flex justify-end mb-6">
              <div className="text-left leading-snug min-w-[250px]">
                <div><span className="font-bold">{tText('સુ.ઇ નું નામ :', 'पर्यवेक्षक अनुदेशक नाम :', 'SI Name:')}</span> {supervisorName}</div>
                <div className="mt-0.5"><span className="font-bold">{tText('ટ્રેડ :', 'ट्रेड :', 'Trade:')}</span> {tradeName}</div>
                <div className="mt-0.5">{itiName}</div>
                <div className="mt-0.5"><span className="font-bold">{tText('તારીખ :', 'दिनांक :', 'Date:')}</span> {reportDate}</div>
              </div>
            </div>

            {/* Left Recipient Header */}
            <div className="mb-4 leading-snug">
              <div className="font-bold">{tText('પ્રતિ,', 'प्रति,', 'To,')}</div>
              <div className="font-bold">{tText('આચાર્યશ્રી,', 'प्राचार्य महोदय,', 'The Principal,')}</div>
              <div>{tText('ઔદ્યોગિક તાલીમ સંસ્થા', 'औद्योगिक प्रशिक्षण संस्थान', 'Industrial Training Institute')}</div>
              <div>{tText('શંખેશ્વર(મહિલા).', 'शंखेश्वर (महिला).', 'Shankheshwar (Women).')}</div>
            </div>

            {/* Subject Line */}
            <div className="text-left font-bold text-[15px] my-4">
              {tText(
                'વિષય : તાલીમાર્થીની ગેરહાજરી તેમજ ઓછી ટકાવારીની વાલીને જાણ કરવા બાબત.',
                'विषय : प्रशिक्षु की अनुपस्थिति एवं कम प्रतिशत की अभिभावक को सूचना देने बाबत।',
                'Subject: Trainee absence and notifying parents regarding low attendance.'
              )}
            </div>

            {/* Salutation & Body Paragraph */}
            <div className="mb-2 font-bold">{tText('માનનીય સાહેબશ્રી,', 'आदरणीय महोदय,', 'Respected Sir,')}</div>
            <p className="text-justify leading-relaxed mb-5" style={{ textIndent: '2.5rem' }}>
              {tText(
                'ઉપરોક્ત વિષય અન્વયે જણાવવાનું કે આ સાથે અત્રેના ટ્રેડમાં તાલીમ લઈ રહેલા નીચેના તાલીમાર્થીઓની હાજરીની વિગત',
                'उपरोक्त विषय के संदर्भ में सूचित करना है कि इसके साथ हमारे ट्रेड में प्रशिक्षण ले रहे निम्नलिखित प्रशिक्षुओं की उपस्थिति विवरण',
                'With reference to the above subject, the attendance details of the following trainees currently under training in this trade for'
              )}{' '}
              <span className="font-bold border-b border-slate-700 px-1">
                {formatMonthGujarati(selectedMonth)}
              </span>{' '}
              {tText(
                'માસ અંતિત નીચે મુજબ છે આ તાલીમાર્થીઓની હાજરી પરિક્ષામાં બેસવાના સમયે ૮૦ ટકાથી ઓછી હાજરી હશે તો પરિક્ષામાં બેસવા નહિ દેવા અંગેની જાણ તથા સંસ્થા ખાતે નિયમિત હાજરી આપે તે અંગે જાણ કરવા વિનંતી.',
                'माह अंत में नीचे दिए अनुसार है। इन प्रशिक्षुओं की परीक्षा समय पर ८०% से कम उपस्थिति होने पर परीक्षा में बैठने न देने संबंधी सूचना तथा नियमित उपस्थिति हेतु अवगत कराने की विनती है।',
                'month-end are as given below. You are requested to notify guardians that trainees with attendance below 80% will not be eligible to appear for the exam and to ensure regular attendance.'
              )}
            </p>

            {/* The Official 5-Column Table */}
            <div className="my-5">
              <table className="w-full border-collapse border-2 border-black text-[13px] leading-snug">
                <thead>
                  <tr className="border-b-2 border-black bg-slate-100 font-bold text-center">
                    <th className="border border-black p-2 w-[8%] text-center">{tText('ક્રમ', 'क्र.', 'Sr.')}</th>
                    <th className="border border-black p-2 w-[44%] text-center">{tText('તાલીમાર્થીનું નામ અને સરનામું', 'प्रशिक्षु का नाम और पता', 'Trainee Name & Address')}</th>
                    <th className="border border-black p-2 w-[22%] text-center">
                      {tText('કઈ તારીખથી સતત ગેરહાજર છે?', 'किस तारीख से लगातार अनुपस्थित है?', 'Continuous Absent Since')}
                    </th>
                    <th className="border border-black p-2 w-[14%] text-center">
                      {tText('માસ અંતિત હાજરીના ટકા', 'माह अंत में उपस्थिति प्रतिशत', 'Month-End Attendance %')}
                    </th>
                    <th className="border border-black p-2 w-[12%] text-center">{tText('નોંધ', 'टिप्पणी', 'Remarks')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-black p-6 text-center text-slate-500 italic"
                      >
                        {tText(
                          'આ માસ માટે ૮૦% થી ઓછી હાજરી વાળો કોઈ તાલીમાર્થી નથી.',
                          'इस माह के लिए ८०% से कम उपस्थिति वाला कोई प्रशिक्षु नहीं है।',
                          'No trainees with attendance below 80% for this month.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="border border-black p-2 text-center font-bold align-top">
                          {toGujaratiDigits(index + 1)}
                        </td>
                        <td className="border border-black p-2 align-top whitespace-pre-line font-medium leading-tight">
                          {row.nameAndAddress}
                        </td>
                        <td className="border border-black p-2 text-center align-top font-medium">
                          {row.continuousAbsentSince}
                        </td>
                        <td className="border border-black p-2 text-center font-bold align-top">
                          {row.attendancePercentage}%
                        </td>
                        <td className="border border-black p-2 align-top text-xs">
                          {row.remarks}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom-Left Forwarding Note */}
            <div className="mt-8 text-[14px]">
              <div>{tText('ઉપરોક્ત તાલીમાર્થીઓ અંગે ઘટતી કાર્યવાહી કરવા નમ્ર વિનંતી.', 'उपरोक्त प्रशिक्षुओं के संबंध में उचित कार्यवाही हेतु सादर निवेदन।', 'Kindly take appropriate action regarding the above trainees.')}</div>
              <div className="mt-1">{tText('આભાર સહ....', 'सधन्यवाद....', 'With regards....')}</div>
            </div>

            {/* Bottom-Right Signature Block */}
            <div className="flex justify-end mt-12 mb-4">
              <div className="text-center min-w-[220px]">
                <div className="h-12 flex items-end justify-center">
                  <div className="border-b border-slate-600 w-40"></div>
                </div>
                <div className="font-bold text-[15px] mt-1.5">{tText('આપનો વિશ્વાસુ', 'भवदीय', 'Yours faithfully')}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  ({supervisorName})
                </div>
                <div className="text-xs text-slate-700">
                  {tText('સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (સુ.ઇ.)', 'पर्यवेक्षक अनुदेशक (प.अ.)', 'Supervisor Instructor (SI)')}
                </div>
                <div className="text-xs text-slate-600">
                  {tradeName}, {itiName}
                </div>
              </div>
            </div>
          </div>
        </A4PrintPreviewModal>
      )}
    </div>
  );
}
