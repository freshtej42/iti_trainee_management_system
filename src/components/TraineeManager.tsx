import { useState, useEffect, FormEvent } from 'react';
import { Trainee, Instructor, AttendanceRecord } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Check,
  X,
  FileSpreadsheet,
  Languages,
  Sparkles,
  Info,
  Phone,
  Layers,
  Filter,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';
import TraineeImportModal from './TraineeImportModal';
import { useLanguage } from '../contexts/LanguageContext';
import { GUJARAT_DISTRICTS, POPULAR_TALUKAS_BY_DISTRICT } from '../data/registrationOptions';

interface TraineeManagerProps {
  trainees: Trainee[];
  instructor: Instructor;
  imeLanguage?: 'Gujarati' | 'Hindi' | 'English';
  initialTradeFilter?: string;
  initialBatchFilter?: string;
  initialUnitFilter?: string;
  onAddTrainee: (trainee: Omit<Trainee, 'id' | 'created_at'>) => void;
  onUpdateTrainee: (trainee: Trainee) => void;
  onDeleteTrainee: (traineeId: string) => void;
  onImportTrainees?: (newTrainees: Trainee[], initialAttendance: AttendanceRecord[]) => Promise<void> | void;
  onOpenBatchUnitModal?: () => void;
}

export default function TraineeManager({
  trainees,
  instructor,
  imeLanguage: propImeLanguage,
  initialTradeFilter,
  initialBatchFilter,
  initialUnitFilter,
  onAddTrainee,
  onUpdateTrainee,
  onDeleteTrainee,
  onImportTrainees,
  onOpenBatchUnitModal,
}: TraineeManagerProps) {
  const { t, tText, imeLanguageName } = useLanguage();
  const imeLanguage = propImeLanguage || imeLanguageName;
  const isGuest = instructor.role === 'guest' || instructor.is_guest || instructor.id === 'guest-demo-instructor';
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);
  const [useImeInForm, setUseImeInForm] = useState(true);

  // Trade, Unit, and Batch Filters
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>(
    initialTradeFilter || 'ALL'
  );
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>(
    initialUnitFilter || 'ALL'
  );
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>(
    initialBatchFilter || 'ALL'
  );
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Update filter if initial prop changes
  useEffect(() => {
    if (initialTradeFilter) setSelectedTradeFilter(initialTradeFilter);
  }, [initialTradeFilter]);

  useEffect(() => {
    if (initialUnitFilter) setSelectedUnitFilter(initialUnitFilter);
  }, [initialUnitFilter]);

  useEffect(() => {
    if (initialBatchFilter) setSelectedBatchFilter(initialBatchFilter);
  }, [initialBatchFilter]);

  // Dynamic Hierarchy resolution from instructor.academic_hierarchy
  const academicHierarchy =
    instructor.academic_hierarchy && instructor.academic_hierarchy.length > 0
      ? instructor.academic_hierarchy
      : [
          {
            id: 'trade-copa',
            name: instructor.trade || 'Computer Operator and Programming Assistant (COPA)',
            batches: [
              {
                id: 'batch-default',
                name: instructor.batch || '૨૦૨૫–૨૦૨૬',
                units: [
                  { id: 'u-1', name: instructor.unit || 'Unit A' },
                  { id: 'u-2', name: 'Unit B' },
                ],
              },
            ],
          },
        ];

  const availableTrades = academicHierarchy.map((t) => t.name);

  // Overall unique batches & units for filters
  const filterBatches = Array.from(
    new Set(
      academicHierarchy.flatMap((t) => t.batches?.map((b) => b.name) || [])
    )
  );
  const allFilterBatches =
    filterBatches.length > 0 ? filterBatches : [instructor.batch || '૨૦૨૫–૨૦૨૬'];

  const filterUnits = Array.from(
    new Set(
      academicHierarchy.flatMap((t) =>
        t.batches?.flatMap((b) => b.units?.map((u) => u.name) || []) || []
      )
    )
  );
  const allFilterUnits =
    filterUnits.length > 0 ? filterUnits : ['Unit A', 'Unit B', 'Unit C'];

  // Default values for initial form state
  const defaultTrade = availableTrades[0] || instructor.trade;
  const defaultTradeObj =
    academicHierarchy.find((t) => t.name === defaultTrade) || academicHierarchy[0];
  const defaultBatches =
    defaultTradeObj?.batches && defaultTradeObj.batches.length > 0
      ? defaultTradeObj.batches.map((b) => b.name)
      : [instructor.batch || '૨૦૨૫–૨૦૨૬'];
  const defaultBatch = defaultBatches[0];
  const defaultBatchObj =
    defaultTradeObj?.batches?.find((b) => b.name === defaultBatch) ||
    defaultTradeObj?.batches?.[0];
  const defaultUnits =
    defaultBatchObj?.units && defaultBatchObj.units.length > 0
      ? defaultBatchObj.units.map((u) => u.name)
      : ['Unit A', 'Unit B', 'Unit C'];
  const defaultUnit = defaultUnits[0];

  // Form State
  const initialFormState = {
    roll_no: '',
    enrollment_no: '',
    trade: defaultTrade,
    batch: defaultBatch,
    unit: defaultUnit,
    surname: '',
    student_name: '',
    father_name: '',
    grandfather_name: '',
    surname_en: '',
    student_name_en: '',
    father_name_en: '',
    grandfather_name_en: '',
    mobile: '',
    parent_mobile: '',
    gender: 'Male',
    category: 'General',
    address: '',
    address_gu: '',
    village: '',
    village_gu: '',
    taluka: '',
    taluka_gu: '',
    district: 'Patan',
    district_gu: 'પાટણ',
    pincode: '384242',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Form Cascading Hierarchy (computed safely AFTER formData is declared)
  const currentTradeObj =
    academicHierarchy.find((t) => t.name === formData.trade) || defaultTradeObj;

  const formBatches =
    currentTradeObj?.batches && currentTradeObj.batches.length > 0
      ? currentTradeObj.batches.map((b) => b.name)
      : [instructor.batch || '૨૦૨૫–૨૦૨૬'];

  const currentBatchObj =
    currentTradeObj?.batches?.find((b) => b.name === formData.batch) ||
    currentTradeObj?.batches?.[0];

  const formUnits =
    currentBatchObj?.units && currentBatchObj.units.length > 0
      ? currentBatchObj.units.map((u) => u.name)
      : ['Unit A', 'Unit B', 'Unit C'];

  const handleTradeChange = (tradeName: string) => {
    const tradeObj = academicHierarchy.find((t) => t.name === tradeName);
    const firstBatch = tradeObj?.batches?.[0]?.name || defaultBatch;
    const firstUnit = tradeObj?.batches?.[0]?.units?.[0]?.name || defaultUnit;
    setFormData((prev) => ({
      ...prev,
      trade: tradeName,
      batch: firstBatch,
      unit: firstUnit,
    }));
  };

  const handleBatchChange = (batchName: string) => {
    const batchObj = currentTradeObj?.batches?.find((b) => b.name === batchName);
    const firstUnit = batchObj?.units?.[0]?.name || defaultUnit;
    setFormData((prev) => ({
      ...prev,
      batch: batchName,
      unit: firstUnit,
    }));
  };

  const openAddModal = () => {
    setEditingTrainee(null);
    const nextRoll = (trainees.length + 101).toString();
    setFormData({
      ...initialFormState,
      roll_no: nextRoll,
      enrollment_no: `ITI/${defaultTrade.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${nextRoll}`,
      trade: defaultTrade,
      batch: defaultBatch,
      unit: defaultUnit,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trainee: Trainee) => {
    setEditingTrainee(trainee);
    setFormData({
      roll_no: trainee.roll_no || '',
      enrollment_no: trainee.enrollment_no || '',
      trade: trainee.trade || instructor.trade || '',
      batch: trainee.batch || instructor.batch || '',
      unit: trainee.unit || instructor.unit || 'Unit A',
      surname: trainee.surname || '',
      student_name: trainee.student_name || '',
      father_name: trainee.father_name || '',
      grandfather_name: trainee.grandfather_name || '',
      surname_en: trainee.surname_en || '',
      student_name_en: trainee.student_name_en || '',
      father_name_en: trainee.father_name_en || '',
      grandfather_name_en: trainee.grandfather_name_en || '',
      mobile: trainee.mobile || '',
      parent_mobile: trainee.parent_mobile || '',
      gender: trainee.gender || 'Male',
      category: trainee.category || 'General',
      address: trainee.address || '',
      address_gu: trainee.address_gu || '',
      village: trainee.village || '',
      village_gu: trainee.village_gu || '',
      taluka: trainee.taluka || '',
      taluka_gu: trainee.taluka_gu || '',
      district: trainee.district || 'Patan',
      district_gu: trainee.district_gu || 'પાટણ',
      pincode: trainee.pincode || '',
    });
    setIsModalOpen(true);
  };

  // When English name is typed, auto-fill the regional script field if IME is on!
  const handleEnglishFieldChange = (
    fieldEn: 'surname_en' | 'student_name_en' | 'father_name_en' | 'grandfather_name_en',
    fieldReg: 'surname' | 'student_name' | 'father_name' | 'grandfather_name',
    val: string
  ) => {
    const updated = { ...formData, [fieldEn]: val };
    if (useImeInForm && (imeLanguage === 'Gujarati' || imeLanguage === 'Hindi')) {
      updated[fieldReg] = transliterateText(val, imeLanguage);
    }
    setFormData(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.roll_no || !formData.student_name) return;

    if (editingTrainee) {
      onUpdateTrainee({
        ...editingTrainee,
        ...formData,
      });
    } else {
      onAddTrainee({
        instructor_id: instructor.id,
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered trainees by search, trade, unit, and batch
  const filteredTrainees = trainees.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.roll_no.includes(q) ||
      t.enrollment_no.toLowerCase().includes(q) ||
      t.student_name.toLowerCase().includes(q) ||
      t.surname.toLowerCase().includes(q) ||
      t.student_name_en.toLowerCase().includes(q) ||
      t.surname_en.toLowerCase().includes(q) ||
      (t.mobile && t.mobile.includes(q)) ||
      t.village.toLowerCase().includes(q);

    const matchesTrade =
      selectedTradeFilter === 'ALL' || (t.trade || instructor.trade) === selectedTradeFilter;

    const matchesUnit =
      selectedUnitFilter === 'ALL' ||
      t.unit.toLowerCase() === selectedUnitFilter.toLowerCase() ||
      (selectedUnitFilter === 'Unit A' && (t.unit === 'Unit 1' || t.unit === 'યુનિટ ૧')) ||
      (selectedUnitFilter === 'Unit B' && (t.unit === 'Unit 2' || t.unit === 'યુનિટ ૨'));

    const matchesBatch =
      selectedBatchFilter === 'ALL' || t.batch === selectedBatchFilter;

    return matchesSearch && matchesTrade && matchesUnit && matchesBatch;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar with Quick Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#346739]" />
            <span>{tText('તાલીમાર્થી ડેટાબેઝ અને સંચાલન', 'પ્રશિક્ષુ ડેટાબેઝ એવં પ્રબંધન', 'Trainee Records & Management')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {instructor.iti_name} • {instructor.trade} • {instructor.batch} ({trainees.length} {tText('નોંધાયેલ તાલીમાર્થીઓ', 'पंजीकृत प्रशिक्षु', 'Registered Trainees')})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Import Trainees Button */}
          {onImportTrainees && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-lg shadow-xs min-h-[42px] transition-colors bg-[#79ae6f] hover:bg-[#669a5c] text-white"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>{tText('આયાત કરો', 'आयात करें', 'Import')}</span>
            </button>
          )}

          {/* Enroll Single Trainee */}
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg shadow-xs min-h-[42px] transition-colors bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2]"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{tText('નવો તાલીમાર્થી', 'नया प्रशिक्षु', 'Enroll Trainee')}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Unit Tabs (All, Unit A, Unit B, Unit C) & Batch Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Unit Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#346739]" />
            <span>{t('unit')}:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedUnitFilter('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedUnitFilter === 'ALL'
                ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
                : 'bg-[#f2edc2]/40 hover:bg-[#f2edc2] text-[#346739]'
            }`}
          >
            {t('all')}
          </button>
          {allFilterUnits.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setSelectedUnitFilter(u)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedUnitFilter === u
                  ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
                  : 'bg-[#f2edc2]/40 hover:bg-[#f2edc2] text-[#346739]'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Trade & Batch Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <span className="text-xs font-semibold text-slate-500">{tText('ટ્રેડ:', 'ट्रेड:', 'Trade:')}</span>
          <select
            value={selectedTradeFilter}
            onChange={(e) => setSelectedTradeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 max-w-[180px] truncate"
          >
            <option value="ALL">{tText('તમામ ટ્રેડ (All Trades)', 'सभी ट्रेड', 'All Trades')}</option>
            {availableTrades.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>

          <span className="text-xs font-semibold text-slate-500">{t('batch')}:</span>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            <option value="ALL">{t('allBatches')}</option>
            {allFilterBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700">
            {filteredTrainees.length} {t('records')}
          </span>
        </div>
      </div>

      {/* Search & Mobile View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tText('રોલ નં, નામ, મોબાઈલ, ગામ શોધો...', 'रोल नं, नाम, मोबाइल, गाँव खोजें...', 'Search Roll No, Name, Mobile, Village...')}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[40px]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Phonetic typing hint */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {tText('ફોનેટિક ટાઇપિંગ:', 'ध्वन्यात्मक टाइपिंग:', 'Phonetic Typing:')} <strong>Ramesh Patel</strong> &rarr; <strong className="text-amber-900 font-sans">{tText('રમેશ પટેલ', 'रमेश पटेल', 'Ramesh Patel')}</strong>
            </span>
          </div>

          {/* Mobile View Mode Toggle (Cards vs Table) */}
          <div className="flex md:hidden items-center bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[34px] ${
                mobileViewMode === 'cards'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[34px] ${
                mobileViewMode === 'table'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Optimized for phone touchscreens) */}
      <div className={`${mobileViewMode === 'cards' ? 'block md:hidden' : 'hidden'} space-y-3`}>
        {filteredTrainees.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            No trainees found matching your filter or search query.
          </div>
        ) : (
          filteredTrainees.map((trainee) => (
            <div
              key={trainee.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Header: Roll, Names, Quick Phone Call */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-[#f2edc2] text-[#346739] font-mono font-black text-xs flex items-center justify-center shrink-0 border border-[#9fcb98]">
                    {trainee.roll_no}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm leading-snug truncate">
                      {trainee.surname} {trainee.student_name} {trainee.father_name}
                      {trainee.grandfather_name && ` ${trainee.grandfather_name}`}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {trainee.surname_en} {trainee.student_name_en} {trainee.father_name_en}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Enroll: {trainee.enrollment_no}
                    </div>
                  </div>
                </div>

                {/* Direct Dial Call Button */}
                {(trainee.parent_mobile || trainee.mobile) && (
                  <a
                    href={`tel:${trainee.parent_mobile || trainee.mobile}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all shrink-0 min-h-[38px]"
                    title={`Call: ${trainee.parent_mobile || trainee.mobile}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {/* Unit, Batch & Demographics */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        trainee.unit.includes('A') || trainee.unit.includes('૧')
                          ? 'bg-blue-100 text-blue-800'
                          : trainee.unit.includes('B') || trainee.unit.includes('૨')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {trainee.unit}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono font-medium">
                      {t('batch')}: {trainee.batch || '—'}
                    </span>
                    {(!trainee.trade?.trim() || !trainee.batch?.trim() || !trainee.unit?.trim()) && (
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                        ⚠️ {tText('અપૂર્ણ', 'अपूर्ण', 'Incomplete')}
                      </span>
                    )}
                  </div>

                  {trainee.mobile && (
                    <span className="text-[11px] font-mono text-slate-600">
                      Mob: {trainee.mobile}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="text-slate-800 font-medium truncate">{trainee.address}</div>
                  <div className="text-slate-500 text-[10px]">
                    {tText('મુ.', 'मु.', 'Vill.')} {trainee.village}, {tText('તા.', 'ता.', 'Tal.')} {trainee.taluka}, {tText('જિ.', 'जि.', 'Dist.')} {trainee.district} - {trainee.pincode}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit & Remove with touch sizing */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(trainee)}
                  title={t('edit')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold min-h-[40px] transition-colors bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t('edit')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTrainee(trainee.id)}
                  className="flex items-center justify-center p-2 rounded-lg text-xs font-semibold min-w-[40px] min-h-[40px] transition-colors bg-rose-50 hover:bg-rose-100 text-rose-700"
                  title={t('delete')}
                  aria-label={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trainees Grid Table (Visible on desktop or when mobileViewMode is 'table') */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
        mobileViewMode === 'table' ? 'block' : 'hidden md:block'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">{t('rollNo')}</th>
                <th className="py-3 px-4">{tText('નામ (પ્રાદેશિક લિપિ)', 'नाम (प्रादेशिक लिपि)', 'Name (Regional Script)')}</th>
                <th className="py-3 px-4">{tText('નામ (અંગ્રેજી)', 'नाम (अंग्रेजी)', 'Name (English)')}</th>
                <th className="py-3 px-4">{t('enrollmentNo')}</th>
                <th className="py-3 px-4">{t('unit')} & {t('batch')}</th>
                <th className="py-3 px-4">{t('studentMobile')} & {t('address')}</th>
                <th className="py-3 px-4 text-right w-24">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrainees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {tText('કોઈ તાલીમાર્થી મળ્યા નથી.', 'कोई प्रशिक्षु नहीं मिला।', 'No trainees found.')}
                  </td>
                </tr>
              ) : (
                filteredTrainees.map((trainee) => (
                  <tr key={trainee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {trainee.roll_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                      {trainee.surname} {trainee.student_name} {trainee.father_name}
                      {trainee.grandfather_name && ` ${trainee.grandfather_name}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {trainee.surname_en} {trainee.student_name_en} {trainee.father_name_en}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {trainee.enrollment_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          trainee.unit.includes('A') || trainee.unit.includes('૧')
                            ? 'bg-blue-100 text-blue-800'
                            : trainee.unit.includes('B') || trainee.unit.includes('૨')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {trainee.unit}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {trainee.batch || '—'}
                        </span>
                        {(!trainee.trade?.trim() || !trainee.batch?.trim() || !trainee.unit?.trim()) && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            ⚠️ {tText('અપૂર્ણ', 'अपूर्ण', 'Incomplete')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {trainee.mobile && (
                        <div className="font-mono text-slate-700 flex items-center gap-1 text-[11px] font-semibold mb-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{trainee.mobile}</span>
                        </div>
                      )}
                      <div className="truncate text-slate-700">{trainee.address}</div>
                      <div className="text-[11px] text-slate-400">
                        {tText('મુ.', 'मु.', 'Vill.')} {trainee.village}, {tText('તા.', 'ता.', 'Tal.')} {trainee.taluka}, {tText('જિ.', 'जि.', 'Dist.')} {trainee.district} - {trainee.pincode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(trainee)}
                          className="p-1.5 rounded-md transition-colors hover:bg-slate-200 text-slate-600"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTrainee(trainee.id)}
                          className="p-1.5 rounded-md transition-colors hover:bg-rose-100 text-rose-600"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Trainee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-800 text-base">
                  {editingTrainee
                    ? tText('વિગતો સુધારો', 'विवरण संपादित करें', 'Edit Trainee Details')
                    : tText('નવા તાલીમાર્થી રજીસ્ટ્રેશન', 'नया प्रशिक्षु पंजीकरण', 'Enroll New Trainee')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Dynamic IME Auto-Transliteration Switcher */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-semibold text-blue-900">
                    {tText('ફોનેટિક સહાયક', 'ध्वन्यात्मक सहायक', 'Phonetic Transliteration Assistant')} ({imeLanguage}):
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-blue-800 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={useImeInForm}
                    onChange={(e) => setUseImeInForm(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{tText('અંગ્રેજી માંથી આપમેળે પ્રાદેશિક લિપિ', 'अंग्रेजी से स्वचालित क्षेत्रीय लिपि', 'Auto-transliterate English → Regional')}</span>
                </label>
              </div>

              {/* Identification Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t('rollNo')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_no || ''}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t('enrollmentNo')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.enrollment_no || ''}
                    onChange={(e) => setFormData({ ...formData, enrollment_no: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Academic Hierarchy Cascading Selectors (Trade -> Batch -> Unit) */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#346739]" />
                    {t('academicHierarchy')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">Trade &rarr; Batch &rarr; Unit</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      1. {t('trade')} *
                    </label>
                    <select
                      value={formData.trade || availableTrades[0]}
                      onChange={(e) => handleTradeChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-medium bg-white focus:ring-2 focus:ring-[#346739] focus:outline-none"
                    >
                      {availableTrades.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      2. {t('batch')} *
                    </label>
                    <select
                      value={formData.batch || formBatches[0]}
                      onChange={(e) => handleBatchChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-[#346739] focus:outline-none"
                    >
                      {formBatches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      3. {t('unit')} *
                    </label>
                    <select
                      value={formData.unit || formUnits[0]}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-[#346739] bg-white focus:ring-2 focus:ring-[#346739] focus:outline-none"
                    >
                      {formUnits.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t('studentMobile')}
                  </label>
                  <input
                    type="text"
                    placeholder="98250 12345"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t('parentMobile')}
                  </label>
                  <input
                    type="text"
                    placeholder="98250 54321"
                    value={formData.parent_mobile || ''}
                    onChange={(e) => setFormData({ ...formData, parent_mobile: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Demographics Dropdowns: Gender & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#346739] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'General'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#346739] focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="SEBC/OBC">SEBC / OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>

              {/* English Names */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  1. Trainee Name in English (Phonetic Input)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Surname (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel"
                      value={formData.surname_en || ''}
                      onChange={(e) => handleEnglishFieldChange('surname_en', 'surname', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Student Name (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={formData.student_name_en || ''}
                      onChange={(e) =>
                        handleEnglishFieldChange('student_name_en', 'student_name', e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Father's Name (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Bharatbhai"
                      value={formData.father_name_en || ''}
                      onChange={(e) =>
                        handleEnglishFieldChange('father_name_en', 'father_name', e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Grandfather's Name (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Keshavlal"
                      value={formData.grandfather_name_en || ''}
                      onChange={(e) =>
                        handleEnglishFieldChange(
                          'grandfather_name_en',
                          'grandfather_name',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Gujarati Names */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  2. Trainee Name in Gujarati (પ્રાદેશિક લિપિ)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">અટક (Surname Gu)</label>
                    <input
                      type="text"
                      placeholder="દા.ત. પટેલ"
                      value={formData.surname || ''}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">નામ (Name Gu) *</label>
                    <input
                      type="text"
                      required
                      placeholder="દા.ત. રમેશ"
                      value={formData.student_name || ''}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">પિતાનું નામ (Father Gu)</label>
                    <input
                      type="text"
                      placeholder="દા.ત. ભરતભાઈ"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">દાદાનું નામ (Grandfather Gu)</label>
                    <input
                      type="text"
                      placeholder="દા.ત. કેશવલાલ"
                      value={formData.grandfather_name || ''}
                      onChange={(e) => setFormData({ ...formData, grandfather_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Smart Concatenation Live Preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Merge Tag Preview:
                </div>
                <div className="text-xs text-slate-800 font-semibold flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-slate-500">&#123;&#123;Trainee_Name&#125;&#125; &rarr;</span>
                  <span className="text-blue-700 font-bold">
                    {formData.student_name_en || formData.student_name
                      ? `${formData.student_name_en || formData.student_name} ${formData.father_name_en || formData.father_name || ''}`.trim()
                      : '(No name entered yet)'}
                  </span>
                  {formData.student_name && (
                    <span className="text-slate-500 text-xs">
                      ({formData.student_name} {formData.father_name})
                    </span>
                  )}
                </div>
              </div>

              {/* Address Details (Dual Language: English and Gujarati) */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  3. Address &amp; Location Details (English &amp; Gujarati)
                </span>

                {/* Street Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address (English)</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Plot No. 45, Shiv Shakti Society"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">સરનામું (Address Gujarati)</label>
                    <input
                      type="text"
                      value={formData.address_gu || ''}
                      onChange={(e) => setFormData({ ...formData, address_gu: e.target.value })}
                      placeholder="દા.ત. પ્લોટ નં. ૪૫, શિવ શક્તિ સોસાયટી"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* District, Taluka, Village, Pincode */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District (English)</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Patan"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Taluka (English)</label>
                    <input
                      type="text"
                      value={formData.taluka || ''}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                      placeholder="e.g. Shankheshwar"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Village / City (English)</label>
                    <input
                      type="text"
                      value={formData.village || ''}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="e.g. Shankheshwar"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="384242"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Gujarati Location Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">જિલ્લો (District Gujarati)</label>
                    <input
                      type="text"
                      value={formData.district_gu || ''}
                      onChange={(e) => setFormData({ ...formData, district_gu: e.target.value })}
                      placeholder="દા.ત. પાટણ"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">તાલુકો (Taluka Gujarati)</label>
                    <input
                      type="text"
                      value={formData.taluka_gu || ''}
                      onChange={(e) => setFormData({ ...formData, taluka_gu: e.target.value })}
                      placeholder="દા.ત. શંખેશ્વર"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ગામ / શહેર (Village Gujarati)</label>
                    <input
                      type="text"
                      value={formData.village_gu || ''}
                      onChange={(e) => setFormData({ ...formData, village_gu: e.target.value })}
                      placeholder="દા.ત. શંખેશ્વર"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg min-h-[42px] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-xs min-h-[42px] transition-colors"
                >
                  {editingTrainee ? t('save') : tText('તાલીમાર્થી દાખલ કરો', 'प्रशिक्षु दर्ज करें', 'Enroll Trainee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainee Import Modal */}
      {isImportModalOpen && onImportTrainees && (
        <TraineeImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          instructor={instructor}
          existingTrainees={trainees}
          onImportTrainees={onImportTrainees}
        />
      )}
    </div>
  );
}
