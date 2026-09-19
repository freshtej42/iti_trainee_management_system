import { useState, useMemo, FormEvent } from 'react';
import { DispatchLog, Trainee, Instructor } from '../types';
import {
  SendHorizontal,
  Search,
  Filter,
  Printer,
  Download,
  FileText,
  Trash2,
  Edit2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Layers,
  Building,
  CheckSquare,
  Square,
  Truck,
  Hash,
} from 'lucide-react';
import A4PrintPreviewModal from './A4PrintPreviewModal';
import { useLanguage } from '../contexts/LanguageContext';

interface DispatchHistoryProps {
  dispatchLogs: DispatchLog[];
  trainees: Trainee[];
  instructor: Instructor;
  onUpdateStatus: (logId: string, newStatus: DispatchLog['status']) => void;
  onUpdateDispatchLog?: (log: DispatchLog) => void;
  onDeleteDispatchLog?: (logId: string) => void;
  onBatchDeleteDispatchLogs?: (logIds: string[]) => void;
  onCreateDispatchLog?: (log: Omit<DispatchLog, 'id' | 'created_at'>) => void;
  onViewNotice: (traineeId: string) => void;
}

export default function DispatchHistory({
  dispatchLogs,
  trainees,
  instructor,
  onUpdateStatus,
  onUpdateDispatchLog,
  onDeleteDispatchLog,
  onBatchDeleteDispatchLogs,
  onCreateDispatchLog,
  onViewNotice,
}: DispatchHistoryProps) {
  const { t, tText, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outward' | 'inward'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'my_trade' | 'all'>('all');

  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  // Modals state
  const [editingLog, setEditingLog] = useState<DispatchLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<DispatchLog | null>(null);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record Form State
  const [newEntry, setNewEntry] = useState<{
    entry_type: 'outward' | 'inward';
    ref_number: string;
    trainee_id: string;
    custom_recipient: string;
    notice_type: string;
    subject: string;
    issue_date: string;
    month_year: string;
    attendance_percentage: number;
    status: DispatchLog['status'];
    dispatch_mode: string;
    tracking_number: string;
    notes: string;
  }>({
    entry_type: 'outward',
    ref_number: `ITI/${instructor.trade.split(' ')[0] || 'GEN'}/${new Date().getFullYear()}/OUT-${String(Math.floor(100 + Math.random() * 900))}`,
    trainee_id: '',
    custom_recipient: '',
    notice_type: '1st Warning',
    subject: tText('સંસ્થામાં વગર પરવાનગીએ ગેરહાજરી બાબત નોટિસ', 'संस्थान में बिना अनुमति अनुपस्थिति संबंधी नोटिस', 'Notice regarding unauthorized absence from institute'),
    issue_date: new Date().toISOString().split('T')[0],
    month_year: tText('ઓગસ્ટ ૨૦૨૫', 'अगस्त २०२५', 'August 2025'),
    attendance_percentage: 65,
    status: 'Dispatched',
    dispatch_mode: tText('રજીસ્ટર્ડ પોસ્ટ (RPAD)', 'पंजीकृत डाक (RPAD)', 'Registered Post (RPAD)'),
    tracking_number: '',
    notes: '',
  });

  // Trainee lookup map
  const traineeMap = useMemo(() => {
    const map = new Map<string, Trainee>();
    trainees.forEach((t) => map.set(t.id, t));
    return map;
  }, [trainees]);

  // Check if log belongs to instructor's scope
  const isInstructorRecord = (log: DispatchLog) => {
    if (log.instructor_id === instructor.id) return true;
    if (!log.instructor_id) return true;
    const tr = traineeMap.get(log.trainee_id);
    if (tr) {
      if (tr.instructor_id === instructor.id) return true;
      if (tr.trade && instructor.trade && tr.trade.trim().toLowerCase() === instructor.trade.trim().toLowerCase()) {
        return true;
      }
    }
    // If super admin, match all
    if (instructor.role === 'super_admin') return true;
    return false;
  };

  // Base logs by scope
  const scopedLogs = useMemo(() => {
    if (scopeFilter === 'all' || instructor.role === 'super_admin') {
      return dispatchLogs;
    }
    const myLogs = dispatchLogs.filter(isInstructorRecord);
    if (myLogs.length === 0 && dispatchLogs.length > 0) {
      return dispatchLogs;
    }
    return myLogs;
  }, [dispatchLogs, scopeFilter, instructor, traineeMap]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return scopedLogs.filter((log) => {
      const trainee = traineeMap.get(log.trainee_id);
      const q = searchQuery.toLowerCase().trim();

      const refNo = (log.outward_number || log.ref_number || '').toLowerCase();
      const noticeType = (log.notice_type || '').toLowerCase();
      const subject = (log.subject || '').toLowerCase();
      const tracking = (log.tracking_number || '').toLowerCase();
      const customRecipient = (log.sender_recipient || '').toLowerCase();
      const notes = (log.notes || '').toLowerCase();

      const matchesSearch =
        !q ||
        refNo.includes(q) ||
        noticeType.includes(q) ||
        subject.includes(q) ||
        tracking.includes(q) ||
        customRecipient.includes(q) ||
        notes.includes(q) ||
        (trainee &&
          (trainee.student_name.toLowerCase().includes(q) ||
            trainee.student_name_en.toLowerCase().includes(q) ||
            trainee.roll_no.includes(q) ||
            trainee.surname.toLowerCase().includes(q) ||
            (trainee.father_name && trainee.father_name.toLowerCase().includes(q))));

      if (!matchesSearch) return false;

      // Inward / Outward Filter
      const entryType = log.entry_type || 'outward';
      if (directionFilter !== 'all' && entryType !== directionFilter) return false;

      // Stage Filter
      if (typeFilter !== 'all' && log.notice_type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      return true;
    });
  }, [scopedLogs, traineeMap, searchQuery, directionFilter, typeFilter, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = scopedLogs.length;
    const outward = scopedLogs.filter((l) => (l.entry_type || 'outward') === 'outward').length;
    const inward = scopedLogs.filter((l) => l.entry_type === 'inward').length;
    const dispatched = scopedLogs.filter((l) => l.status === 'Dispatched' || l.status === 'Printed').length;
    const delivered = scopedLogs.filter((l) => l.status === 'Delivered' || l.status === 'Acknowledged').length;
    return { total, outward, inward, dispatched, delivered };
  }, [scopedLogs]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  // Delete Single Handler
  const confirmDeleteSingle = (log: DispatchLog) => {
    setDeletingLog(log);
  };

  const executeDeleteSingle = () => {
    if (!deletingLog) return;
    if (onDeleteDispatchLog) {
      onDeleteDispatchLog(deletingLog.id);
    }
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      next.delete(deletingLog.id);
      return next;
    });
    setDeletingLog(null);
  };

  // Batch Delete Handler
  const executeBatchDelete = () => {
    const ids = Array.from(selectedLogIds) as string[];
    if (ids.length === 0) return;
    if (onBatchDeleteDispatchLogs) {
      onBatchDeleteDispatchLogs(ids);
    } else if (onDeleteDispatchLog) {
      ids.forEach((id) => onDeleteDispatchLog(id));
    }
    setSelectedLogIds(new Set());
    setIsBatchDeleteConfirmOpen(false);
  };

  // Batch Status Update
  const handleBatchStatusUpdate = (newStatus: DispatchLog['status']) => {
    const ids = Array.from(selectedLogIds) as string[];
    ids.forEach((id) => onUpdateStatus(id, newStatus));
    setSelectedLogIds(new Set());
  };

  // Save Edit Handler
  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    const sanitizedLog: DispatchLog = {
      ...editingLog,
      instructor_id: editingLog.instructor_id || instructor.id,
      outward_number: editingLog.outward_number || editingLog.ref_number || '',
      ref_number: editingLog.ref_number || editingLog.outward_number || '',
      issue_date: editingLog.issue_date || editingLog.issued_date || new Date().toISOString().split('T')[0],
      issued_date: editingLog.issued_date || editingLog.issue_date || new Date().toISOString().split('T')[0],
    };
    if (onUpdateDispatchLog) {
      onUpdateDispatchLog(sanitizedLog);
    }
    setEditingLog(null);
  };

  // Save New Entry Handler
  const handleSaveNewEntry = (e: FormEvent) => {
    e.preventDefault();
    if (!newEntry.ref_number.trim()) {
      return;
    }

    const createdRecord: Omit<DispatchLog, 'id' | 'created_at'> = {
      trainee_id: newEntry.trainee_id,
      instructor_id: instructor.id,
      ref_number: newEntry.ref_number.trim(),
      outward_number: newEntry.ref_number.trim(),
      entry_type: newEntry.entry_type,
      notice_type: newEntry.notice_type,
      subject: newEntry.subject.trim(),
      sender_recipient: newEntry.custom_recipient.trim(),
      issue_date: newEntry.issue_date,
      issued_date: newEntry.issue_date,
      attendance_percentage: Number(newEntry.attendance_percentage) || 0,
      month_year: newEntry.month_year.trim(),
      status: newEntry.status,
      dispatch_mode: newEntry.dispatch_mode,
      tracking_number: newEntry.tracking_number.trim(),
      notes: newEntry.notes.trim(),
    };

    if (onCreateDispatchLog) {
      onCreateDispatchLog(createdRecord);
    }

    setIsAddModalOpen(false);
    // Reset new entry form
    setNewEntry({
      entry_type: 'outward',
      ref_number: `ITI/${instructor.trade.split(' ')[0] || 'GEN'}/${new Date().getFullYear()}/OUT-${String(Math.floor(100 + Math.random() * 900))}`,
      trainee_id: '',
      custom_recipient: '',
      notice_type: '1st Warning',
      subject: 'સંસ્થામાં વગર પરવાનગીએ ગેરહાજરી બાબત નોટિસ',
      issue_date: new Date().toISOString().split('T')[0],
      month_year: 'ઓગસ્ટ ૨૦૨૫',
      attendance_percentage: 65,
      status: 'Dispatched',
      dispatch_mode: 'રજીસ્ટર્ડ પોસ્ટ (RPAD)',
      tracking_number: '',
      notes: '',
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Type (પ્રકાર)',
      'Outward/Inward No (ક્રમાંક)',
      'Trainee Roll / Name',
      'Recipient / Sender',
      'Subject / Notice Type',
      'Issue Date',
      'Month/Year',
      'Attendance %',
      'Dispatch Mode',
      'Tracking No',
      'Status',
      'Notes',
    ];

    const rows = filteredLogs.map((log) => {
      const trainee = traineeMap.get(log.trainee_id);
      const studentName = trainee ? `${trainee.surname} ${trainee.student_name}` : log.sender_recipient || '-';
      return [
        `"${log.entry_type === 'inward' ? 'આવક (Inward)' : 'જાવક (Outward)'}"`,
        `"${log.outward_number || log.ref_number || ''}"`,
        `"${trainee ? `Roll ${trainee.roll_no}: ${studentName}` : ''}"`,
        `"${log.sender_recipient || studentName}"`,
        `"${log.subject || log.notice_type}"`,
        `"${log.issue_date || log.issued_date || ''}"`,
        `"${log.month_year}"`,
        `"${log.attendance_percentage ?? '-'}%"`,
        `"${log.dispatch_mode || '-'}"`,
        `"${log.tracking_number || '-'}"`,
        `"${log.status}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ITI_Inward_Outward_Register_${instructor.trade.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <SendHorizontal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{t('dispatchRegister')}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {tText('ઇન્સ્ટ્રક્ટર', 'प्रशिक्षक', 'Instructor')}: <span className="font-semibold text-slate-700">{instructor.name}</span> • {t('trade')}: <span className="font-semibold text-slate-700">{instructor.trade} ({instructor.unit})</span> • {instructor.iti_name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Entry Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
            title={tText('નવી આવક અથવા જાવક એન્ટ્રી ઉમેરો', 'नई आवक या जावक प्रविष्टि जोड़ें', 'Add new inward or outward entry')}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addEntry')}</span>
          </button>

          {/* Print Register Button */}
          <button
            type="button"
            onClick={() => setIsPrintRegisterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{tText('પ્રિન્ટ રજીસ્ટર (A4)', 'रजिस्टर प्रिंट (A4)', 'Print Register (A4)')}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium mb-0.5">{t('total')} {t('records')}</div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-400">{tText('બધા આવક-જાવક રેકોર્ડ્સ', 'सभी आवक-जावक रिकॉर्ड', 'All inward-outward records')}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-[11px] text-blue-700 font-medium mb-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t('outwardLetters')}</span>
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.outward}</div>
          <div className="text-[10px] text-blue-600">{tText('નોટિસ / રવાનગી પત્રો', 'नोटिस / प्रेषण पत्र', 'Notices / Dispatches')}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] text-emerald-700 font-medium mb-0.5 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t('inwardLetters')}</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.inward}</div>
          <div className="text-[10px] text-emerald-600">{tText('વાલી જવાબ / કચેરી પત્રો', 'अभिभावक उत्तर / कार्यालय पत्र', 'Parent replies / Office dak')}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-[11px] text-amber-700 font-medium mb-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('inTransit')}</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.dispatched}</div>
          <div className="text-[10px] text-amber-600">{tText('ટપાલમાં / ડિસ્પેચ્ડ', 'डाक में / प्रेषित', 'In transit / Dispatched')}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-violet-200 shadow-xs bg-violet-50/20">
          <div className="text-[11px] text-violet-700 font-medium mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('delivered')}</span>
          </div>
          <div className="text-2xl font-black text-violet-700">{stats.delivered}</div>
          <div className="text-[10px] text-violet-600">{tText('સ્વીકૃતિ / પહોંચ થયેલ', 'स्वीकृति / पहुंच प्राप्त', 'Delivered / Acknowledged')}</div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tText('નંબર, વિદ્યાર્થીનું નામ, વિષય, ટ્રેકિંગ નં શોધો...', 'क्रमांक, छात्र नाम, विषय, ट्रैकिंग नं खोजें...', 'Search number, student, subject, tracking...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Direction Filter Tabs (All, Outward, Inward) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setDirectionFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                directionFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('all')} ({scopedLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('outward')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                directionFilter === 'outward'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>{t('outward')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('inward')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                directionFilter === 'inward'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              <span>{t('inward')}</span>
            </button>
          </div>

          {/* Scope Selector: My Trade vs All Institute */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <span className="text-slate-500 text-[11px] font-medium">{t('scope')}:</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as 'my_trade' | 'all')}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">{t('allInstitute')}</option>
              <option value="my_trade">{t('myTrade')} ({instructor.trade})</option>
            </select>
          </div>
        </div>

        {/* Secondary filters: Stage & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>{t('noticeStage')}:</span>
            </span>
            {(['all', '1st Warning', '2nd Warning', 'Final Notice', 'General Notice'] as const).map((stageKey) => (
              <button
                key={stageKey}
                type="button"
                onClick={() => setTypeFilter(stageKey)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  typeFilter === stageKey
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stageKey === 'all'
                  ? t('all')
                  : stageKey === '1st Warning'
                  ? t('firstWarning')
                  : stageKey === '2nd Warning'
                  ? t('secondWarning')
                  : stageKey === 'Final Notice'
                  ? t('finalNotice')
                  : t('generalNotice')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium">{t('status')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{t('all')} {t('status')}</option>
              <option value="Dispatched">{t('inTransit')}</option>
              <option value="Delivered">{t('delivered')}</option>
              <option value="Acknowledged">{t('acknowledged')}</option>
              <option value="Printed">{t('printed')}</option>
              <option value="Drafted">{t('drafted')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows are selected) */}
      {selectedLogIds.size > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 text-blue-300 rounded text-xs font-bold font-mono">
              {selectedLogIds.size} {t('records')} {tText('પસંદ કરેલ', 'चयनित', 'selected')}
            </span>
            <button
              type="button"
              onClick={() => setSelectedLogIds(new Set())}
              className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
            >
              {tText('પસંદગી રદ કરો', 'चयन रद्द करें', 'Clear selection')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">{tText('ઝડપી સ્ટેટસ:', 'त्वरित स्थिति:', 'Quick Status:')}</span>
            <button
              type="button"
              onClick={() => handleBatchStatusUpdate('Delivered')}
              className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] transition-colors cursor-pointer"
            >
              {t('delivered')}
            </button>
            <button
              type="button"
              onClick={() => handleBatchStatusUpdate('Acknowledged')}
              className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-medium text-[11px] transition-colors cursor-pointer"
            >
              {t('acknowledged')}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1"></div>

            {/* Batch Delete Button */}
            <button
              type="button"
              onClick={() => setIsBatchDeleteConfirmOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{tText('પસંદ કરેલા ડિલીટ કરો', 'चयनित हटाएं', 'Delete selected')} ({selectedLogIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Outward/Inward Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title={tText('બધા પસંદ કરો', 'सभी चुनें', 'Select all')}
                  />
                </th>
                <th className="py-3 px-3">{tText('પ્રકાર', 'प्रकार', 'Type')}</th>
                <th className="py-3 px-3">{t('refNumber')}</th>
                <th className="py-3 px-3">{t('traineeRecipient')}</th>
                <th className="py-3 px-3">{t('subject')}</th>
                <th className="py-3 px-3 text-center">{t('date')}</th>
                <th className="py-3 px-3 text-center">{t('percentage')}</th>
                <th className="py-3 px-3">{t('dispatchMode')}</th>
                <th className="py-3 px-3 text-center">{t('status')}</th>
                <th className="py-3 px-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SendHorizontal className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        {tText('કોઈ આવક-જાવક રેકોર્ડ મળેલ નથી.', 'कोई आवक-जावक रिकॉर्ड नहीं मिला।', 'No inward-outward records found.')}
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        {tText(
                          'જ્યારે નોટિસ પ્રિન્ટ થાય છે અથવા નવી નોંધણી કરવામાં આવે છે, ત્યારે તે અહીં રજીસ્ટરમાં દર્શાવાશે.',
                          'जब नोटिस प्रिंट होता है या नई प्रविष्टि की जाती है, तो वह यहां रजिस्टर में दिखाई देगी।',
                          'When notices are printed or new entries are added, they will appear here in the register.'
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        {t('addEntry')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const trainee = traineeMap.get(log.trainee_id);
                  const isSelected = selectedLogIds.has(log.id);
                  const isOutward = (log.entry_type || 'outward') === 'outward';
                  const displayRef = log.outward_number || log.ref_number || `REG-${log.id.slice(-5)}`;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(log.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Direction Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOutward
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isOutward ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>{t('outward')}</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>{t('inward')}</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Outward / Inward Ref Number */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-900 text-xs tracking-tight">
                          {displayRef}
                        </div>
                        {log.created_at && (
                          <div className="text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleTimeString(language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'gu-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>

                      {/* Trainee / Recipient */}
                      <td className="py-3 px-3">
                        {trainee ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {trainee.surname} {trainee.student_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {t('rollNo')}: <span className="font-mono font-bold">{trainee.roll_no}</span> • {trainee.trade} ({trainee.unit})
                            </div>
                            {trainee.father_name && (
                              <div className="text-[10px] text-slate-400">
                                {t('guardian')}: {trainee.father_name} {trainee.grandfather_name || ''} {trainee.surname}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {log.sender_recipient || tText('અન્ય / કાર્યાલય', 'अन्य / कार्यालय', 'Other / Office')}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              {tText('બિન-તાલીમાર્થી પત્ર વ્યવહાર', 'गैर-प्रशिक्षु पत्र व्यवहार', 'Non-trainee correspondence')}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Notice Stage / Subject */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.notice_type === 'Final Notice'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : log.notice_type === '2nd Warning'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : log.notice_type === '1st Warning'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.notice_type === '1st Warning'
                              ? t('firstWarning')
                              : log.notice_type === '2nd Warning'
                              ? t('secondWarning')
                              : log.notice_type === 'Final Notice'
                              ? t('finalNotice')
                              : log.notice_type === 'General Notice'
                              ? t('generalNotice')
                              : log.notice_type}
                          </span>
                          {log.month_year && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({log.month_year})
                            </span>
                          )}
                        </div>
                        {log.subject && (
                          <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {log.subject}
                          </div>
                        )}
                        {log.notes && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1">
                            {tText('નોંધ:', 'टिप्पणी:', 'Note:')} {log.notes}
                          </div>
                        )}
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-3 text-center whitespace-nowrap text-slate-700 font-medium font-mono text-[11px]">
                        {log.issue_date || log.issued_date || '-'}
                      </td>

                      {/* Attendance % */}
                      <td className="py-3 px-3 text-center">
                        {log.attendance_percentage !== undefined && log.attendance_percentage !== null ? (
                          <span
                            className={`font-mono font-bold ${
                              log.attendance_percentage < 60
                                ? 'text-rose-600'
                                : log.attendance_percentage < 80
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {Number(log.attendance_percentage).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Dispatch Mode / Tracking */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium text-[11px]">
                          {log.dispatch_mode || tText('સાદી ટપાલ / રૂબરૂ', 'साधारण डाक / व्यक्तिगत', 'Ordinary Post / In Person')}
                        </div>
                        {log.tracking_number ? (
                          <div className="text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5" />
                            <span>{log.tracking_number}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={log.status}
                          onChange={(e) =>
                            onUpdateStatus(log.id, e.target.value as DispatchLog['status'])
                          }
                          className={`text-[11px] font-bold border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                            log.status === 'Delivered' || log.status === 'Acknowledged'
                              ? 'border-emerald-300 text-emerald-800 bg-emerald-50/40'
                              : log.status === 'Dispatched'
                              ? 'border-blue-300 text-blue-800 bg-blue-50/40'
                              : 'border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="Dispatched">{t('inTransit')}</option>
                          <option value="Acknowledged">{t('acknowledged')}</option>
                          <option value="Delivered">{t('delivered')}</option>
                          <option value="Printed">{t('printed')}</option>
                          <option value="Drafted">{t('drafted')}</option>
                        </select>
                      </td>

                      {/* Action Buttons: View Notice, Edit, Delete */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Notice */}
                          {trainee && (
                            <button
                              type="button"
                              onClick={() => onViewNotice(log.trainee_id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
                              title={tText('નોટિસ ફોર્મેટ જુઓ', 'नोटिस प्रारूप देखें', 'View notice format')}
                            >
                              <FileText className="w-3 h-3" />
                              <span className="hidden xl:inline">{tText('નોટિસ', 'नोटिस', 'Notice')}</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingLog({ ...log })}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-1.5 rounded transition-colors cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => confirmDeleteSingle(log)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition-colors cursor-pointer"
                            title={t('delete')}
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
      </div>

      {/* ================= MODAL: EDIT RECORD ================= */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {tText('આવક - જાવક રેકોર્ડ સુધારો', 'आवक-जावक रिकॉर्ड संपादित करें', 'Edit Inward/Outward Record')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('refNumber')}: <span className="font-mono font-bold text-blue-900">{editingLog.outward_number || editingLog.ref_number}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {/* Entry Type Toggle */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {tText('નોંધણીનો પ્રકાર', 'प्रविष्टि प्रकार', 'Entry Type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLog({ ...editingLog, entry_type: 'outward' })}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      (editingLog.entry_type || 'outward') === 'outward'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{t('outward')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLog({ ...editingLog, entry_type: 'inward' })}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editingLog.entry_type === 'inward'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>{t('inward')}</span>
                  </button>
                </div>
              </div>

              {/* Reference / Outward Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('refNumber')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLog.outward_number || editingLog.ref_number || ''}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        outward_number: e.target.value,
                        ref_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('issueDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingLog.issue_date || editingLog.issued_date || ''}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        issue_date: e.target.value,
                        issued_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Associate Trainee or Custom Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('સંબંધિત તાલીમાર્થી', 'संबंधित प्रशिक्षु', 'Associated Trainee')}
                  </label>
                  <select
                    value={editingLog.trainee_id || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, trainee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">{tText('-- બિન-તાલીમાર્થી / અન્ય પત્ર --', '-- गैर-प्रशिक्षु / अन्य पत्र --', '-- Non-trainee / Other --')}</option>
                    {trainees.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.roll_no}: {t.surname} {t.student_name} ({t.trade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('મેળવનાર / મોકલનારનું નામ', 'प्राप्तकर्ता / प्रेषक का नाम', 'Recipient / Sender Name')}
                  </label>
                  <input
                    type="text"
                    placeholder={tText('દા.ત. વાલીશ્રી અથવા કચેરી', 'उदा. अभिभावक या कार्यालय', 'e.g. Guardian or Office')}
                    value={editingLog.sender_recipient || ''}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, sender_recipient: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notice Stage & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('noticeStage')}
                  </label>
                  <select
                    value={editingLog.notice_type || '1st Warning'}
                    onChange={(e) => setEditingLog({ ...editingLog, notice_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1st Warning">{t('firstWarning')}</option>
                    <option value="2nd Warning">{t('secondWarning')}</option>
                    <option value="Final Notice">{t('finalNotice')}</option>
                    <option value="General Notice">{t('generalNotice')}</option>
                    <option value="Parent Reply">{tText('વાલી ખુલાસો પત્ર', 'अभिभावक स्पष्टीकरण पत्र', 'Parent Reply')}</option>
                    <option value="Leave Application">{tText('રજા અરજી', 'अवकाश आवेदन', 'Leave Application')}</option>
                    <option value="Medical Certificate">{tText('તબીબી પ્રમાણપત્ર', 'चिकित्सा प्रमाण पत्र', 'Medical Certificate')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('માસ / સત્ર', 'माह / सत्र', 'Month / Session')}
                  </label>
                  <input
                    type="text"
                    value={editingLog.month_year || ''}
                    onChange={(e) => setEditingLog({ ...editingLog, month_year: e.target.value })}
                    placeholder={tText('દા.ત. ઓગસ્ટ ૨૦૨૫', 'उदा. अगस्त 2025', 'e.g. August 2025')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('subject')}
                </label>
                <input
                  type="text"
                  value={editingLog.subject || ''}
                  onChange={(e) => setEditingLog({ ...editingLog, subject: e.target.value })}
                  placeholder={tText('દા.ત. ગેરહાજરી બાબત નોટિસ', 'उदा. अनुपस्थिति संबंधी नोटिस', 'e.g. Notice regarding absence')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Attendance % and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('હાજરી ટકાવારી', 'उपस्थिति प्रतिशत', 'Attendance %')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingLog.attendance_percentage ?? ''}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        attendance_percentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={editingLog.status}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        status: e.target.value as DispatchLog['status'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Dispatched">{t('inTransit')}</option>
                    <option value="Acknowledged">{t('acknowledged')}</option>
                    <option value="Delivered">{t('delivered')}</option>
                    <option value="Printed">{t('printed')}</option>
                    <option value="Drafted">{t('drafted')}</option>
                  </select>
                </div>
              </div>

              {/* Dispatch Mode & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('dispatchMode')}
                  </label>
                  <select
                    value={editingLog.dispatch_mode || 'રજીસ્ટર્ડ પોસ્ટ (RPAD)'}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, dispatch_mode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="રજીસ્ટર્ડ પોસ્ટ (RPAD)">{tText('રજીસ્ટર્ડ પોસ્ટ (RPAD)', 'पंजीकृत डाक (RPAD)', 'Registered Post (RPAD)')}</option>
                    <option value="સ્પીડ પોસ્ટ (Speed Post)">{tText('સ્પીડ પોસ્ટ (Speed Post)', 'स्पीड पोस्ट (Speed Post)', 'Speed Post')}</option>
                    <option value="સાદી ટપાલ (Ordinary Post)">{tText('સાદી ટપાલ (Ordinary Post)', 'साधारण डाक (Ordinary Post)', 'Ordinary Post')}</option>
                    <option value="રૂબરૂ વાલીને સોંપેલ (By Hand)">{tText('રૂબરૂ વાલીને સોંપેલ (By Hand)', 'व्यक्तिगत अभिभावक को (By Hand)', 'By Hand to Guardian')}</option>
                    <option value="કચેરી ઈમેલ (Official Email)">{tText('કચેરી ઈમેલ (Official Email)', 'कार्यालयी ईमेल (Official Email)', 'Official Email')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('trackingNumber')}
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. RG123456789IN"
                    value={editingLog.tracking_number || ''}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, tracking_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {tText('વિશેષ નોંધ / વિગત', 'विशेष टिप्पणी / विवरण', 'Remarks / Notes')}
                </label>
                <textarea
                  rows={2}
                  value={editingLog.notes || ''}
                  onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
                  placeholder={tText('દા.ત. વાલીશ્રી રૂબરૂ મુલાકાતે આવ્યા હતા.', 'उदा. अभिभावक व्यक्तिगत रूप से उपस्थित हुए।', 'e.g. Guardian visited in person.')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW ENTRY ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {tText('નવી આવક - જાવક નોંધણી', 'नई आवक-जावक प्रविष्टि', 'New Register Entry')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tText('સત્તાવાર રજીસ્ટર બુકમાં નવો પત્ર / નોટિસ રેકોર્ડ ઉમેરો', 'आधिकारिक रजिस्टर में नया पत्र / नोटिस रिकॉर्ड जोड़ें', 'Add new letter / notice record to official register')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEntry} className="p-5 space-y-4 text-xs">
              {/* Direction Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {tText('નોંધણીનો પ્રકાર', 'प्रविष्टि प्रकार', 'Entry Type')} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewEntry({
                        ...newEntry,
                        entry_type: 'outward',
                        ref_number: `ITI/${instructor.trade.split(' ')[0] || 'GEN'}/${new Date().getFullYear()}/OUT-${String(Math.floor(100 + Math.random() * 900))}`,
                      })
                    }
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newEntry.entry_type === 'outward'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{t('outward')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewEntry({
                        ...newEntry,
                        entry_type: 'inward',
                        ref_number: `ITI/${instructor.trade.split(' ')[0] || 'GEN'}/${new Date().getFullYear()}/IN-${String(Math.floor(100 + Math.random() * 900))}`,
                      })
                    }
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newEntry.entry_type === 'inward'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>{t('inward')}</span>
                  </button>
                </div>
              </div>

              {/* Reference Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('refNumber')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEntry.ref_number}
                    onChange={(e) => setNewEntry({ ...newEntry, ref_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('issueDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEntry.issue_date}
                    onChange={(e) => setNewEntry({ ...newEntry, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Associate Trainee or Custom Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('સંબંધિત તાલીમાર્થી', 'संबंधित प्रशिक्षु', 'Associated Trainee')}
                  </label>
                  <select
                    value={newEntry.trainee_id}
                    onChange={(e) => setNewEntry({ ...newEntry, trainee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">{tText('-- બિન-તાલીમાર્થી / અન્ય પત્ર --', '-- गैर-प्रशिक्षु / अन्य पत्र --', '-- Non-trainee / Other --')}</option>
                    {trainees.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.roll_no}: {t.surname} {t.student_name} ({t.trade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('મેળવનાર / મોકલનારનું નામ', 'प्राप्तकर्ता / प्रेषक का नाम', 'Recipient / Sender Name')}
                  </label>
                  <input
                    type="text"
                    placeholder={tText('દા.ત. વાલીશ્રી અથવા કચેરી', 'उदा. अभिभावक या कार्यालय', 'e.g. Guardian or Office')}
                    value={newEntry.custom_recipient}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, custom_recipient: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Type & Month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('noticeStage')}
                  </label>
                  <select
                    value={newEntry.notice_type}
                    onChange={(e) => setNewEntry({ ...newEntry, notice_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1st Warning">{t('firstWarning')}</option>
                    <option value="2nd Warning">{t('secondWarning')}</option>
                    <option value="Final Notice">{t('finalNotice')}</option>
                    <option value="General Notice">{t('generalNotice')}</option>
                    <option value="Parent Reply">{tText('વાલી ખુલાસો પત્ર', 'अभिभावक स्पष्टीकरण पत्र', 'Parent Reply')}</option>
                    <option value="Leave Application">{tText('રજા અરજી', 'अवकाश आवेदन', 'Leave Application')}</option>
                    <option value="Medical Certificate">{tText('તબીબી પ્રમાણપત્ર', 'चिकित्सा प्रमाण पत्र', 'Medical Certificate')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tText('માસ / સત્ર', 'माह / सत्र', 'Month / Session')}
                  </label>
                  <input
                    type="text"
                    value={newEntry.month_year}
                    onChange={(e) => setNewEntry({ ...newEntry, month_year: e.target.value })}
                    placeholder={tText('દા.ત. ઓગસ્ટ ૨૦૨૫', 'उदा. अगस्त 2025', 'e.g. August 2025')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('subject')} *
                </label>
                <input
                  type="text"
                  required
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  placeholder={tText('દા.ત. ગેરહાજરી બાબત નોટિસ', 'उदा. अनुपस्थिति संबंधी नोटिस', 'e.g. Notice regarding absence')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Dispatch Mode & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('dispatchMode')}
                  </label>
                  <select
                    value={newEntry.dispatch_mode}
                    onChange={(e) => setNewEntry({ ...newEntry, dispatch_mode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="રજીસ્ટર્ડ પોસ્ટ (RPAD)">{tText('રજીસ્ટર્ડ પોસ્ટ (RPAD)', 'पंजीकृत डाक (RPAD)', 'Registered Post (RPAD)')}</option>
                    <option value="સ્પીડ પોસ્ટ (Speed Post)">{tText('સ્પીડ પોસ્ટ (Speed Post)', 'स्पीड पोस्ट (Speed Post)', 'Speed Post')}</option>
                    <option value="સાદી ટપાલ (Ordinary Post)">{tText('સાદી ટપાલ (Ordinary Post)', 'साधारण डाक (Ordinary Post)', 'Ordinary Post')}</option>
                    <option value="રૂબરૂ વાલીને સોંપેલ (By Hand)">{tText('રૂબરૂ વાલીને સોંપેલ (By Hand)', 'व्यक्तिगत अभिभावक को (By Hand)', 'By Hand to Guardian')}</option>
                    <option value="કચેરી ઈમેલ (Official Email)">{tText('કચેરી ઈમેલ (Official Email)', 'कार्यालयी ईमेल (Official Email)', 'Official Email')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('trackingNumber')}
                  </label>
                  <input
                    type="text"
                    placeholder="દા.ત. RG123456789IN"
                    value={newEntry.tracking_number}
                    onChange={(e) => setNewEntry({ ...newEntry, tracking_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {tText('વિશેષ નોંધ / વિગત', 'विशेष टिप्पणी / विवरण', 'Remarks / Notes')}
                </label>
                <textarea
                  rows={2}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder={tText('વિશેષ વિગત અથવા નોંધ...', 'विशेष विवरण या टिप्पणी...', 'Special details or remarks...')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SINGLE CONFIRMATION ================= */}
      {deletingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {tText('રેકોર્ડ ડિલીટ કરવાની ખાતરી', 'रिकॉर्ड हटाने की पुष्टि', 'Confirm Delete Record')}
                </h3>
                <p className="text-xs text-slate-500">
                  {tText('આ ક્રિયા કાયમી છે અને ડેટાબેઝમાંથી રેકોર્ડ દૂર કરશે.', 'यह क्रिया स्थायी है और डेटाबेस से रिकॉर्ड हटा देगी।', 'This action is permanent and will remove the record from database.')}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-slate-500">{t('refNumber')}:</span>{' '}
                <strong className="font-mono text-blue-900">
                  {deletingLog.outward_number || deletingLog.ref_number}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('પ્રકાર', 'प्रकार', 'Type')}:</span>{' '}
                <span className="font-semibold">
                  {deletingLog.entry_type === 'inward' ? t('inward') : t('outward')} ({deletingLog.notice_type})
                </span>
              </div>
              <div>
                <span className="text-slate-500">{t('issueDate')}:</span>{' '}
                <span>{deletingLog.issue_date || deletingLog.issued_date || '-'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={executeDeleteSingle}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BATCH DELETE CONFIRMATION ================= */}
      {isBatchDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {tText('પસંદ કરેલા રેકોર્ડ્સ ડિલીટ કરો', 'चयनित रिकॉर्ड हटाएं', 'Delete Selected Records')}
                </h3>
                <p className="text-xs text-slate-500">
                  {tText(
                    `શું તમે ખરેખર પસંદ કરેલા તમામ ${selectedLogIds.size} રેકોર્ડ્સ કાયમ માટે ડિલીટ કરવા માંગો છો?`,
                    `क्या आप वास्तव में सभी चयनित ${selectedLogIds.size} रिकॉर्ड हटाना चाहते हैं?`,
                    `Are you sure you want to permanently delete all ${selectedLogIds.size} selected records?`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={executeBatchDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('delete')} ({selectedLogIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: A4 PRINT REGISTER ================= */}
      {isPrintRegisterOpen && (
        <A4PrintPreviewModal
          isOpen={isPrintRegisterOpen}
          onClose={() => setIsPrintRegisterOpen(false)}
          title="સત્તાવાર આવક - જાવક રજીસ્ટર પ્રિન્ટ પ્રીવ્યૂ (Inward & Outward Register)"
          subtitle={`${instructor.iti_name} • ${instructor.trade} (${instructor.unit})`}
          filename={`ITI_Inward_Outward_Register_${instructor.trade.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`}
          initialOrientation="landscape"
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
                    સત્તાવાર આવક - જાવક રજીસ્ટર અને ડિસ્પેચ ઓડિટ ટ્રેઇલ (Inward & Outward Register)
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-blue-50/40">
                  <div className="text-[7px] font-bold text-blue-800 uppercase">Skill</div>
                  <div className="text-[11px] font-black text-orange-600">India</div>
                  <div className="text-[6px] text-slate-600">કૌશલ ભારત</div>
                </div>
              </div>

              {/* Meta Details */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-300 text-[11px] bg-slate-50 p-2 rounded">
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
                  <span className="text-slate-500">રજીસ્ટર તારીખ:</span>{' '}
                  <strong className="text-slate-900">{new Date().toLocaleDateString('gu-IN')}</strong>
                </div>
                <div>
                  <span className="text-slate-500">કુલ દર્શાવેલ નોંધણી:</span>{' '}
                  <strong className="text-blue-900">{filteredLogs.length} Records</strong>
                </div>
              </div>
            </div>

            {/* Official Table */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-8">અનુ.</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">પ્રકાર</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left w-32">નોંધણી / પત્ર ક્રમાંક</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-10">રોલ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">
                    તાલીમાર્થી / મોકલનાર / મેળવનાર
                  </th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">વિષય / નોટિસ વિગત</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-16">માસ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">હાજરી %</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-20">તારીખ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-24">રવાનગી & ટ્રેકિંગ</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-16">સ્થિતિ</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="border border-slate-400 py-4 text-center text-slate-400">
                      કોઈ આવક-જાવક રેકોર્ડ મળેલ નથી.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const trainee = traineeMap.get(log.trainee_id);
                    const isOutward = (log.entry_type || 'outward') === 'outward';
                    const displayRef = log.outward_number || log.ref_number || `REG-${log.id.slice(-5)}`;
                    const studentName = trainee
                      ? `${trainee.surname} ${trainee.student_name}`
                      : log.sender_recipient || '-';

                    return (
                      <tr key={log.id} className="even:bg-slate-50/50">
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-bold">
                          <span className={isOutward ? 'text-blue-800' : 'text-emerald-800'}>
                            {isOutward ? 'જાવક' : 'આવક'}
                          </span>
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-mono font-bold text-blue-900 text-[9px]">
                          {displayRef}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-bold font-mono">
                          {trainee?.roll_no || '-'}
                        </td>
                        <td className="border border-slate-400 py-1 px-2 font-semibold">
                          <div>{studentName}</div>
                          {trainee?.father_name && (
                            <div className="text-[8px] text-slate-500 font-normal">
                              વાલી: {trainee.father_name} {trainee.grandfather_name || ''}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-400 py-1 px-2">
                          <div className="font-medium text-[9.5px]">{log.subject || log.notice_type}</div>
                          <div className="text-[8px] text-slate-500">{log.notice_type}</div>
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center text-[9px]">
                          {log.month_year.split(' ')[0]}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono font-bold">
                          {log.attendance_percentage !== undefined ? `${log.attendance_percentage}%` : '-'}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center font-mono text-[9px]">
                          {log.issue_date || log.issued_date || '-'}
                        </td>
                        <td className="border border-slate-400 py-1 px-1.5 text-center text-[8.5px]">
                          <div>{log.dispatch_mode || 'રૂબરૂ / ટપાલ'}</div>
                          {log.tracking_number && (
                            <div className="font-mono font-bold text-blue-900">{log.tracking_number}</div>
                          )}
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

            {/* Official Signatures */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-400 mt-4">
              <div className="text-center min-w-[180px]">
                <div className="h-8 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-800 text-xs">
                    {instructor.name}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">{instructor.name}</div>
                  <div className="text-[10px] text-slate-600">આવક-જાવક કારકુન / ઇન્સ્ટ્રક્ટર</div>
                  <div className="text-[9px] text-slate-500">{instructor.trade}</div>
                </div>
              </div>

              <div className="border border-dashed border-slate-400 p-2 rounded text-[9px] text-slate-400 text-center w-36">
                <div>સંસ્થાનું ગોળ સીલ</div>
                <div className="mt-2">[ ITI Official Seal ]</div>
              </div>

              <div className="text-center min-w-[180px]">
                <div className="h-8 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-slate-400 text-[11px]">સહી / સિક્કો</span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">આચાર્યશ્રી / સંસ્થા વડા</div>
                  <div className="text-[10px] text-slate-600">{instructor.iti_name.split('(')[0]}</div>
                  <div className="text-[9px] text-slate-500">તારીખ: {new Date().toLocaleDateString('gu-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </A4PrintPreviewModal>
      )}
    </div>
  );
}
