import { useState, useMemo } from 'react';
import { DispatchLog, Trainee, Instructor } from '../types';
import {
  SendHorizontal,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  Download,
  FileText,
  UserCheck,
  Building,
} from 'lucide-react';
import A4PrintPreviewModal from './A4PrintPreviewModal';

interface DispatchHistoryProps {
  dispatchLogs: DispatchLog[];
  trainees: Trainee[];
  instructor: Instructor;
  onUpdateStatus: (logId: string, newStatus: DispatchLog['status']) => void;
  onViewNotice: (traineeId: string) => void;
}

export default function DispatchHistory({
  dispatchLogs,
  trainees,
  instructor,
  onUpdateStatus,
  onViewNotice,
}: DispatchHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | '1st Warning' | '2nd Warning' | 'Final Notice'>('all');
  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState(false);

  // Trainee lookup map
  const traineeMap = useMemo(() => {
    const map = new Map<string, Trainee>();
    trainees.forEach((t) => map.set(t.id, t));
    return map;
  }, [trainees]);

  // Instructor-specific logs
  const instructorLogs = useMemo(() => {
    return dispatchLogs.filter((l) => l.instructor_id === instructor.id);
  }, [dispatchLogs, instructor.id]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return instructorLogs.filter((log) => {
      const trainee = traineeMap.get(log.trainee_id);
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.outward_number.toLowerCase().includes(q) ||
        log.notice_type.toLowerCase().includes(q) ||
        (trainee &&
          (trainee.student_name.toLowerCase().includes(q) ||
            trainee.student_name_en.toLowerCase().includes(q) ||
            trainee.roll_no.includes(q)));

      if (!matchesSearch) return false;
      if (typeFilter !== 'all' && log.notice_type !== typeFilter) return false;
      return true;
    });
  }, [instructorLogs, traineeMap, searchQuery, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = instructorLogs.length;
    const firstWarning = instructorLogs.filter((l) => l.notice_type === '1st Warning').length;
    const secondWarning = instructorLogs.filter((l) => l.notice_type === '2nd Warning').length;
    const finalNotice = instructorLogs.filter((l) => l.notice_type === 'Final Notice').length;
    return { total, firstWarning, secondWarning, finalNotice };
  }, [instructorLogs]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Outward Number', 'Roll No', 'Trainee Name', 'Notice Type', 'Month/Year', 'Attendance %', 'Issue Date', 'Status'];
    const rows = filteredLogs.map((log) => {
      const trainee = traineeMap.get(log.trainee_id);
      return [
        `"${log.outward_number}"`,
        `"${trainee?.roll_no || ''}"`,
        `"${trainee ? `${trainee.surname} ${trainee.student_name}` : ''}"`,
        `"${log.notice_type}"`,
        `"${log.month_year}"`,
        `"${log.attendance_percentage}%"`,
        `"${log.issue_date}"`,
        `"${log.status}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ITI_Dispatch_Register_${instructor.trade}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SendHorizontal className="w-5 h-5 text-blue-700" />
            <span>Official Outward Register & Dispatch Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500">
            Unit: {instructor.trade} • {instructor.unit} • {instructor.iti_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintRegisterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>પ્રિન્ટ રજીસ્ટર (A4 Print Outward)</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">Total Notices Dispatched</div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400">All outward records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-xs text-blue-700 font-medium mb-1">1st Warning Notices</div>
          <div className="text-2xl font-black text-blue-700">{stats.firstWarning}</div>
          <div className="text-[11px] text-blue-600">Initial parental advice</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-xs text-amber-700 font-medium mb-1">2nd Warning Notices</div>
          <div className="text-2xl font-black text-amber-700">{stats.secondWarning}</div>
          <div className="text-[11px] text-amber-600">Escalated irregularity</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="text-xs text-rose-700 font-medium mb-1">Final Show-Cause Notices</div>
          <div className="text-2xl font-black text-rose-700">{stats.finalNotice}</div>
          <div className="text-[11px] text-rose-600">Pre-exam debarment</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Outward No, Trainee Name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['all', '1st Warning', '2nd Warning', 'Final Notice'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded font-medium ${
                typeFilter === t
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Outward Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Outward Ref No (જાવક નંબર)</th>
                <th className="py-3 px-4">Trainee Name & Roll</th>
                <th className="py-3 px-4">Notice Stage</th>
                <th className="py-3 px-4 text-center">Month</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No dispatch outward records found. When notices are printed or saved, they appear here.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const trainee = traineeMap.get(log.trainee_id);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 text-xs">
                        {log.outward_number}
                      </td>
                      <td className="py-3 px-4">
                        {trainee ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {trainee.surname} {trainee.student_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Roll {trainee.roll_no} • {trainee.student_name_en}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unknown Trainee</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.notice_type === 'Final Notice'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : log.notice_type === '2nd Warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.notice_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {log.month_year}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                        {log.attendance_percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {log.issue_date}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={log.status}
                          onChange={(e) =>
                            onUpdateStatus(log.id, e.target.value as DispatchLog['status'])
                          }
                          className="text-[11px] font-semibold border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Dispatched">Dispatched</option>
                          <option value="Acknowledged">Acknowledged</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewNotice(log.trainee_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Notice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* A4 Print Preview Modal for Outward Register */}
      {isPrintRegisterOpen && (
        <A4PrintPreviewModal
          isOpen={isPrintRegisterOpen}
          onClose={() => setIsPrintRegisterOpen(false)}
          title="સત્તાવાર જાવક રજીસ્ટર પ્રિન્ટ પ્રીવ્યૂ (Outward Register)"
          subtitle={`${instructor.iti_name} • ${instructor.trade} (${instructor.unit})`}
          filename={`ITI_Outward_Register_${instructor.trade.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`}
          initialOrientation="portrait"
        >
          <div className="w-full text-slate-900 text-xs leading-relaxed font-sans">
            {/* Header / Letterhead */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-slate-50">
                  <div className="text-[7px] font-bold text-slate-800">GOVT OF</div>
                  <div className="text-sm font-black text-blue-900">ITI</div>
                  <div className="text-[6px] font-bold text-slate-700">GUJARAT</div>
                </div>

                <div className="text-center grow">
                  <div className="text-[10px] font-semibold text-slate-600">
                    શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 font-serif">
                    {instructor.iti_name}
                  </h1>
                  <div className="text-xs font-bold text-blue-950 mt-0.5">
                    સત્તાવાર નોટિસ જાવક રજીસ્ટર અને ડિસ્પેચ ઓડિટ ટ્રેઇલ (Outward Register)
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-blue-50/40">
                  <div className="text-[7px] font-bold text-blue-800 uppercase">Skill</div>
                  <div className="text-[11px] font-black text-orange-600">India</div>
                  <div className="text-[6px] text-slate-600">કૌશલ ભારત</div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-300 text-[11px] bg-slate-50 p-2 rounded">
                <div>
                  <span className="text-slate-500">વ્યવસાય (Trade):</span>{' '}
                  <strong className="text-slate-900">{instructor.trade}</strong>
                </div>
                <div>
                  <span className="text-slate-500">યુનિટ / બેચ:</span>{' '}
                  <strong className="text-slate-900">
                    {instructor.unit} / {instructor.batch}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">કુલ જાવક નોંધણી:</span>{' '}
                  <strong className="text-blue-900">{filteredLogs.length} Records</strong>
                </div>
              </div>
            </div>

            {/* Outward Register Table */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-8">અનુ.</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left w-36">જાવક નંબર (Outward No)</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-10">રોલ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">
                    તાલીમાર્થીનું પૂરું નામ (Trainee Name)
                  </th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-24">નોટિસ પ્રકાર</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-16">માસ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">હાજરી %</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-20">ઇશ્યૂ તારીખ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-20">સ્થિતિ</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-slate-400 py-4 text-center text-slate-400">
                      કોઈ જાવક રેકોર્ડ મળેલ નથી.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const trainee = traineeMap.get(log.trainee_id);
                    return (
                      <tr key={log.id} className="even:bg-slate-50/50">
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-mono font-bold text-blue-900 text-[9px]">
                          {log.outward_number}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-bold font-mono">
                          {trainee?.roll_no || '-'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-semibold">
                          {trainee ? `${trainee.surname} ${trainee.student_name}` : 'Unknown'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 text-center">
                          <span
                            className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                              log.notice_type === 'Final Notice'
                                ? 'text-rose-700 bg-rose-50'
                                : 'text-amber-700 bg-amber-50'
                            }`}
                          >
                            {log.notice_type}
                          </span>
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center text-[9px]">
                          {log.month_year.split(' ')[0]}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono font-bold">
                          {log.attendance_percentage}%
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono text-[9px]">
                          {log.issue_date}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center text-[9px] font-semibold text-emerald-800">
                          {log.status}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Signatures */}
            <div className="flex items-end justify-between pt-8 border-t border-slate-400 mt-6">
              {/* Left: Dispatch Clerk / Instructor Sign */}
              <div className="text-center min-w-[180px]">
                <div className="h-9 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-800 text-xs">
                    {instructor.name}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">{instructor.name}</div>
                  <div className="text-[10px] text-slate-600">જાવક કારકુન / ઇન્સ્ટ્રક્ટર</div>
                  <div className="text-[9px] text-slate-500">{instructor.trade}</div>
                </div>
              </div>

              {/* Center: Seal */}
              <div className="border border-dashed border-slate-400 p-2 rounded text-[9px] text-slate-400 text-center w-36">
                <div>સંસ્થાનું ગોળ સીલ</div>
                <div className="mt-3">[ ITI Seal ]</div>
              </div>

              {/* Right: Principal Sign */}
              <div className="text-center min-w-[180px]">
                <div className="h-9 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-slate-400 text-[11px]">સહી / Signature</span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">આચાર્યશ્રી / સંસ્થા વડા</div>
                  <div className="text-[10px] text-slate-600">{instructor.iti_name.split('(')[0]}</div>
                  <div className="text-[9px] text-slate-500">તારીખ: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            </div>
          </div>
        </A4PrintPreviewModal>
      )}
    </div>
  );
}
