import { useState, FormEvent } from 'react';
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
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';
import { formatFullName, formatFullAddress } from '../utils/mergeTags';
import TraineeImportModal from './TraineeImportModal';

interface TraineeManagerProps {
  trainees: Trainee[];
  instructor: Instructor;
  imeLanguage: 'Gujarati' | 'Hindi' | 'English';
  onAddTrainee: (trainee: Omit<Trainee, 'id' | 'created_at'>) => void;
  onUpdateTrainee: (trainee: Trainee) => void;
  onDeleteTrainee: (traineeId: string) => void;
  onImportTrainees?: (newTrainees: Trainee[], initialAttendance: AttendanceRecord[]) => Promise<void> | void;
  onOpenBatchUnitModal?: () => void;
}

export default function TraineeManager({
  trainees,
  instructor,
  imeLanguage,
  onAddTrainee,
  onUpdateTrainee,
  onDeleteTrainee,
  onImportTrainees,
  onOpenBatchUnitModal,
}: TraineeManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);
  const [useImeInForm, setUseImeInForm] = useState(true);

  // Unit and Batch Filters
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');

  const availableBatches = instructor.batches && instructor.batches.length > 0
    ? instructor.batches
    : [instructor.batch || '૨૦૨૫–૨૦૨૬'];

  const availableUnits = instructor.units && instructor.units.length > 0
    ? instructor.units
    : ['Unit A', 'Unit B', 'Unit C'];

  // Form State
  const initialFormState = {
    roll_no: '',
    enrollment_no: '',
    trade: instructor.trade,
    batch: instructor.batch || '૨૦૨૫–૨૦૨૬',
    unit: instructor.unit || 'Unit A',
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
    address: '',
    village: '',
    taluka: '',
    district: 'પાટણ',
    pincode: '૩૮૪૨૪૨',
  };

  const [formData, setFormData] = useState(initialFormState);

  const openAddModal = () => {
    setEditingTrainee(null);
    const nextRoll = (trainees.length + 101).toString();
    setFormData({
      ...initialFormState,
      roll_no: nextRoll,
      enrollment_no: `ITI/${instructor.trade.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${nextRoll}`,
      trade: instructor.trade,
      batch: instructor.batch || availableBatches[0],
      unit: instructor.unit || availableUnits[0],
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
      address: trainee.address || '',
      village: trainee.village || '',
      taluka: trainee.taluka || '',
      district: trainee.district || '',
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

  // Filtered trainees by search, unit, and batch
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

    const matchesUnit =
      selectedUnitFilter === 'ALL' ||
      t.unit.toLowerCase() === selectedUnitFilter.toLowerCase() ||
      (selectedUnitFilter === 'Unit A' && (t.unit === 'Unit 1' || t.unit === 'યુનિટ ૧')) ||
      (selectedUnitFilter === 'Unit B' && (t.unit === 'Unit 2' || t.unit === 'યુનિટ ૨'));

    const matchesBatch =
      selectedBatchFilter === 'ALL' || t.batch === selectedBatchFilter;

    return matchesSearch && matchesUnit && matchesBatch;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar with Quick Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Trainee Records & Demographic Management (તાલીમાર્થી ડેટાબેઝ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {instructor.iti_name} • {instructor.trade} • {instructor.batch} ({trainees.length} Registered Trainees)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Import Trainees Button */}
          {onImportTrainees && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>આયાત કરો (Import Excel/CSV)</span>
            </button>
          )}

          {/* Enroll Single Trainee */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>નવો તાલીમાર્થી ઉમેરો (Enroll Trainee)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Unit Tabs (All, Unit A, Unit B, Unit C) & Batch Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Unit Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>યુનિટ (Unit):</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedUnitFilter('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedUnitFilter === 'ALL'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            બધા (All)
          </button>
          {availableUnits.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setSelectedUnitFilter(u)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedUnitFilter === u
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Batch Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500">બેચ (Batch):</span>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            <option value="ALL">બધી બેચ (All Batches)</option>
            {availableBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700">
            {filteredTrainees.length} Records
          </span>
        </div>
      </div>

      {/* Search & Info Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Roll No, Name, Mobile, Village..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            ફોનેટિક ટાઈપિંગ: અંગ્રેજીમાં લખતા જ (દા.ત. <strong>Ramesh Patel</strong>) આપમેળે{' '}
            <strong className="text-amber-900 font-sans">રમેશ પટેલ</strong> બની જશે.
          </span>
        </div>
      </div>

      {/* Trainees Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">Roll</th>
                <th className="py-3 px-4">Regional Script Name (ગુજરાતી / हिन्दी)</th>
                <th className="py-3 px-4">English Name</th>
                <th className="py-3 px-4">Enrollment No</th>
                <th className="py-3 px-4">Unit & Batch</th>
                <th className="py-3 px-4">Mobile & Address</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrainees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No trainees found matching your filter or search query.
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
                          {trainee.batch}
                        </span>
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
                        મુ. {trainee.village}, તા. {trainee.taluka}, જિ. {trainee.district} - {trainee.pincode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(trainee)}
                          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Edit Trainee Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTrainee(trainee.id)}
                          className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Remove Trainee"
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
                  {editingTrainee ? 'Edit Trainee Details (વિગતો સુધારો)' : 'Enroll New Trainee (નવા તાલીમાર્થી રજીસ્ટ્રેશન)'}
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
                    Phonetic Transliteration Assistant ({imeLanguage}):
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-blue-800 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={useImeInForm}
                    onChange={(e) => setUseImeInForm(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Auto-transliterate English &rarr; Regional</span>
                </label>
              </div>

              {/* Identification Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">રોલ નંબર (Roll No) *</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_no || ''}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">નોંધણી નંબર (Enrollment No) *</label>
                  <input
                    type="text"
                    required
                    value={formData.enrollment_no || ''}
                    onChange={(e) => setFormData({ ...formData, enrollment_no: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Trade, Batch, Unit (A/B/C) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ટ્રેડ (Trade)</label>
                  <input
                    type="text"
                    value={formData.trade || ''}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">બેચ (Batch)</label>
                  <select
                    value={formData.batch || ''}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  >
                    {availableBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">યુનિટ (Unit A / B / C) *</label>
                  <select
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-blue-800"
                  >
                    {availableUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    તાલીમાર્થી મોબાઈલ નંબર (Student Mobile)
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
                    વાલીનો મોબાઈલ નંબર (Parent Mobile)
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

              {/* English Demographics (Type here to auto-convert to regional script) */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  1. English Names (Phonetic Input)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Surname (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel"
                      value={formData.surname_en || ''}
                      onChange={(e) => handleEnglishFieldChange('surname_en', 'surname', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Grandfather's Name</label>
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Script Demographics (Gujarati / Hindi) */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  2. Regional Script Names (અટક, વિદ્યાર્થી, પિતાનું નામ)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">અટક / સરનેમ</label>
                    <input
                      type="text"
                      value={formData.surname || ''}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">વિદ્યાર્થીનું નામ *</label>
                    <input
                      type="text"
                      required
                      value={formData.student_name || ''}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">પિતાનું નામ</label>
                    <input
                      type="text"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">દાદાનું નામ</label>
                    <input
                      type="text"
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
                  Smart Dynamic Merge Tag Live Evaluation:
                </div>
                <div className="text-xs text-slate-800 font-semibold">
                  &#123;&#123;Full_Name&#125;&#125; &rarr;{' '}
                  <span className="text-blue-700">
                    {formData.surname || formData.student_name
                      ? `${formData.surname} ${formData.student_name} ${formData.father_name}`.trim()
                      : '(No name yet)'}
                  </span>
                </div>
              </div>

              {/* Address Details */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  3. Address & Postal Information (સરનામું અને પિનકોડ)
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">House / Street Address</label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="પ્લોટ નં. ૪૫, શિવ શક્તિ સોસાયટી, બક્ષીપંચ વાસ"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Village (ગામ)</label>
                      <input
                        type="text"
                        value={formData.village || ''}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        placeholder="શંખેશ્વર"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Taluka (તાલુકો)</label>
                      <input
                        type="text"
                        value={formData.taluka || ''}
                        onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                        placeholder="શંખેશ્વર"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">District (જિલ્લો)</label>
                      <input
                        type="text"
                        value={formData.district || ''}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="પાટણ"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Pincode (પિનકોડ)</label>
                      <input
                        type="text"
                        value={formData.pincode || ''}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="384242"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  {editingTrainee ? 'Save Changes' : 'Enroll Trainee'}
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
