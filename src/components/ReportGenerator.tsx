import React, { useState } from 'react';
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
} from 'lucide-react';

interface ReportGeneratorProps {
  instructor: Instructor;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  templates: LetterTemplate[];
  onBatchLogDispatch?: (logs: DispatchLog[]) => void;
}

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

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const headerConfig: HeaderConfig =
    instructor.header_config || {
      show_logo: true,
      institute_name_gu: instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા',
      institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
      department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
      address: instructor.institution_address || 'ગુજરાત',
      ref_prefix: instructor.outward_code_prefix || 'ઔતાસં/તલમ/૨૦૨૫',
    };

  // Toggle selection
  const toggleTrainee = (id: string) => {
    setSelectedTraineeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedTraineeIds(filteredTrainees.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTraineeIds([]);
  };

  // Format merged text for a trainee
  const getMergedContent = (trainee: Trainee) => {
    if (!selectedTemplate) return '';
    const att = attendanceRecords.find((a) => a.trainee_id === trainee.id);
    const pct = att ? att.attendance_percentage.toFixed(2) + '%' : '0%';
    const present = att ? att.present_days.toString() : '૦';
    const absent = att ? att.absent_days.toString() : '૦';
    const total = att ? att.total_working_days.toString() : '૨૪';
    const today = new Date().toLocaleDateString('gu-IN');
    const refNo = `${headerConfig.ref_prefix}/${trainee.roll_no || '૧'}`;

    return selectedTemplate.content_html
      .replace(/\{\{Trainee_Name\}\}/g, `${trainee.student_name} ${trainee.father_name || ''} ${trainee.surname || ''}`.trim())
      .replace(/\{\{Trainee_Name_EN\}\}/g, `${trainee.student_name_en || ''} ${trainee.surname_en || ''}`.trim())
      .replace(/\{\{Roll_No\}\}/g, trainee.roll_no || '')
      .replace(/\{\{Enrollment_No\}\}/g, trainee.enrollment_no || '')
      .replace(/\{\{Father_Name\}\}/g, trainee.father_name || trainee.student_name)
      .replace(/\{\{Mobile\}\}/g, trainee.mobile || '')
      .replace(/\{\{Parent_Mobile\}\}/g, trainee.parent_mobile || trainee.mobile || '')
      .replace(/\{\{Category\}\}/g, trainee.category || 'General')
      .replace(/\{\{Address\}\}/g, trainee.address || '')
      .replace(/\{\{Village\}\}/g, trainee.village || '')
      .replace(/\{\{Taluka\}\}/g, trainee.taluka || '')
      .replace(/\{\{District\}\}/g, trainee.district || '')
      .replace(/\{\{Trade\}\}/g, trainee.trade || instructor.trade)
      .replace(/\{\{Batch\}\}/g, trainee.batch || instructor.batch)
      .replace(/\{\{Unit\}\}/g, trainee.unit || instructor.unit)
      .replace(/\{\{Attendance_Percentage\}\}/g, pct)
      .replace(/\{\{Present_Days\}\}/g, present)
      .replace(/\{\{Absent_Days\}\}/g, absent)
      .replace(/\{\{Total_Working_Days\}\}/g, total)
      .replace(/\{\{Ref_No\}\}/g, refNo)
      .replace(/\{\{Current_Date\}\}/g, today)
      .replace(/\{\{Instructor_Name\}\}/g, instructor.name)
      .replace(/\{\{ITI_Name\}\}/g, headerConfig.institute_name_gu);
  };

  // Direct Print
  const handlePrint = () => {
    if (selectedTraineeIds.length === 0) {
      alert('કૃપા કરીને પ્રિન્ટ કરવા માટે ઓછામાં ઓછો એક વિદ્યાર્થી પસંદ કરો.');
      return;
    }

    // Automatically log dispatches if handler provided
    if (onBatchLogDispatch) {
      const logs: DispatchLog[] = selectedTraineeIds.map((tId, idx) => {
        const tr = trainees.find((t) => t.id === tId);
        const att = attendanceRecords.find((a) => a.trainee_id === tId);
        return {
          id: `disp-${Date.now()}-${idx}`,
          trainee_id: tId,
          instructor_id: instructor.id,
          ref_number: `${headerConfig.ref_prefix}/${tr?.roll_no || idx + 1}`,
          notice_type: selectedTemplate?.notice_type || '1st Warning',
          issue_date: new Date().toLocaleDateString('gu-IN'),
          attendance_percentage: att ? att.attendance_percentage : 0,
          month_year: att?.month_year || 'ઓગસ્ટ ૨૦૨૫',
          status: 'Printed',
          created_at: new Date().toISOString(),
        };
      });

      onBatchLogDispatch(logs);
      setDispatchLoggedNotice(true);
      setTimeout(() => setDispatchLoggedNotice(false), 4000);
    }

    window.print();
  };

  const selectedTraineesList = trainees.filter((t) => selectedTraineeIds.includes(t.id));
  const activePreviewTrainee = selectedTraineesList[activePreviewIndex] || selectedTraineesList[0];

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
            ટેમ્પ્લેટ પસંદ કરો → તાલીમાર્થીઓ પસંદ કરો → લાઈવ મર્જ પ્રિવ્યુ → સિંગલ કન્સોલિડેટેડ પીડીએફ / ડાયરેક્ટ પ્રિન્ટ
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={selectedTraineeIds.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#346739] hover:bg-[#264e2b] disabled:opacity-40 text-[#f2edc2] text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>પીડીએફ જનરેટ / પ્રિન્ટ કરો ({selectedTraineeIds.length} પાનાં)</span>
        </button>
      </div>

      {dispatchLoggedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{selectedTraineeIds.length} વિદ્યાર્થીઓના જાવક પત્રો આવક-જાવક રજીસ્ટરમાં સફળતાપૂર્વક નોંધાઈ ગયા છે.</span>
        </div>
      )}

      {/* Screen Interactive Workspace (Hidden during print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Left Column: Config & Trainee Selection */}
        <div className="space-y-4">
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
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
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
                onClick={() => setAttendanceFilter('all')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                  attendanceFilter === 'all'
                    ? 'bg-[#346739] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                તમામ વિદ્યાર્થી
              </button>
            </div>
          </div>

          {/* 3. Trainees Selection List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#346739] font-black text-[10px] flex items-center justify-center">
                  ૩
                </span>
                <span className="font-bold text-xs text-slate-900">
                  તાલીમાર્થીઓ પસંદ કરો ({selectedTraineeIds.length}/{filteredTrainees.length})
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={selectAllFiltered}
                  className="text-blue-700 font-bold hover:underline"
                >
                  બધા પસંદ
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  રદ
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredTrainees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  પસંદ કરેલ માપદંડો મુજબ કોઈ વિદ્યાર્થી મળ્યા નથી.
                </div>
              ) : (
                filteredTrainees.map((tr) => {
                  const isChecked = selectedTraineeIds.includes(tr.id);
                  const att = attendanceRecords.find((a) => a.trainee_id === tr.id);
                  const pct = att ? att.attendance_percentage : 0;
                  const isLow = pct < 80.0;

                  return (
                    <div
                      key={tr.id}
                      onClick={() => toggleTrainee(tr.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isChecked
                          ? 'bg-emerald-50/80 border-[#346739]'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#346739] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">
                            {tr.roll_no}. {tr.student_name} {tr.surname}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            મો: {tr.mobile || '—'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
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

        {/* Right 2 Columns: Live Document Preview (Page-by-page simulator) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#346739]" />
              <h3 className="font-bold text-sm text-slate-900">
                લાઈવ પત્ર પ્રિવ્યુ (Live Consolidated Preview)
              </h3>
            </div>

            {selectedTraineesList.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  વિદ્યાર્થી {activePreviewIndex + 1} of {selectedTraineesList.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePreviewIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activePreviewIndex === 0}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setActivePreviewIndex((prev) =>
                        Math.min(selectedTraineesList.length - 1, prev + 1)
                      )
                    }
                    disabled={activePreviewIndex >= selectedTraineesList.length - 1}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedTraineesList.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-700 text-sm">કોઈ વિદ્યાર્થી પસંદ થયેલ નથી</div>
              <p className="text-xs text-slate-500 mt-1">
                ડાબી બાજુની પેનલમાંથી વિદ્યાર્થીઓની પસંદગી કરો જેથી અહીં લાઈવ પત્ર દર્શાવી શકાય.
              </p>
            </div>
          ) : (
            /* A4 Sheet Simulation */
            <div className="max-w-2xl mx-auto bg-white border border-slate-300 rounded-xl p-8 shadow-sm space-y-5 text-slate-900 font-gujarati">
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900/80 space-y-1">
                {headerConfig.show_logo && (
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-slate-300 overflow-hidden mb-1">
                    {headerConfig.logo_url ? (
                      <img src={headerConfig.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      'ITI LOGO'
                    )}
                  </div>
                )}
                <h1 className="text-base font-black tracking-tight text-slate-900">
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
              </div>

              {/* Ref Number and Date */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-1">
                <div>જા.નં.: {headerConfig.ref_prefix}/{activePreviewTrainee.roll_no}</div>
                <div>તારીખ: {new Date().toLocaleDateString('gu-IN')}</div>
              </div>

              {/* Subject */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center">
                {selectedTemplate?.subject}
              </div>

              {/* Body */}
              <div className="text-xs leading-relaxed whitespace-pre-line text-slate-800">
                {getMergedContent(activePreviewTrainee)}
              </div>

              {/* Signatory Footer */}
              <div className="pt-8 flex justify-between items-end text-xs">
                <div className="text-slate-500 text-[10px]">
                  * આ પત્ર ઈન્સ્ટ્રક્ટર પોર્ટલ દ્વારા કમ્પ્યુટરાઈઝ્ડ જનરેટ થયેલ છે.
                </div>

                <div className="text-right space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto"></div>
                  <div className="font-bold text-slate-900">{instructor.name}</div>
                  <div className="text-[11px] text-slate-600">{instructor.designation}</div>
                  <div className="text-[10px] text-slate-500">{headerConfig.institute_name_gu}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINT-ONLY CONSOLIDATED MULTI-PAGE CONTAINER */}
      {/* Generates a continuous sequence of A4 pages, each dedicated to one selected trainee */}
      <div className="hidden print:block space-y-0">
        {selectedTraineesList.map((trainee, idx) => (
          <div
            key={trainee.id}
            className="bg-white p-8 space-y-6 text-slate-900 font-gujarati"
            style={{ pageBreakAfter: idx < selectedTraineesList.length - 1 ? 'always' : 'auto', minHeight: '100vh' }}
          >
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              {headerConfig.show_logo && headerConfig.logo_url && (
                <div className="w-14 h-14 mx-auto mb-2">
                  <img src={headerConfig.logo_url} alt="Logo" className="w-full h-full object-contain mx-auto" />
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
            </div>

            {/* Ref Number and Date */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-2">
              <div>જા.નં.: {headerConfig.ref_prefix}/{trainee.roll_no}</div>
              <div>તારીખ: {new Date().toLocaleDateString('gu-IN')}</div>
            </div>

            {/* Subject */}
            <div className="p-2 border-y border-slate-800 text-xs font-black text-center">
              {selectedTemplate?.subject}
            </div>

            {/* Body */}
            <div className="text-sm leading-relaxed whitespace-pre-line text-slate-900 py-4">
              {getMergedContent(trainee)}
            </div>

            {/* Signatory Footer */}
            <div className="pt-16 flex justify-between items-end text-xs">
              <div className="text-[10px] text-slate-600">
                સંદર્ભ ફાઈલ: {trainee.enrollment_no} | બેચ: {trainee.batch}
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-sm text-slate-900">{instructor.name}</div>
                <div className="text-xs text-slate-700">{instructor.designation}</div>
                <div className="text-xs text-slate-600">{headerConfig.institute_name_gu}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
