import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Trainee, Instructor, AttendanceRecord } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  Loader2,
  Table,
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';

interface TraineeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  existingTrainees: Trainee[];
  onImportTrainees: (newTrainees: Trainee[], initialAttendance: AttendanceRecord[]) => Promise<void> | void;
}

interface ParsedTraineeRow {
  roll_no: string;
  enrollment_no: string;
  // English name fields in sequence: Surname, Student, Father, Grandfather
  surname_en: string;
  student_name_en: string;
  father_name_en: string;
  grandfather_name_en: string;
  // Gujarati name fields in sequence: Surname, Student, Father, Grandfather
  surname: string;
  student_name: string;
  father_name: string;
  grandfather_name: string;
  // Gujarati address fields
  address_gu: string;
  village_gu: string;
  taluka_gu: string;
  district_gu: string;
  pincode: string;
  // Contact & Academic metadata
  mobile: string;
  parent_mobile: string;
  unit: string;
  batch: string;
  // Fallback compatibility
  address?: string;
  village?: string;
  taluka?: string;
  district?: string;
  isValid: boolean;
  error?: string;
}

export default function TraineeImportModal({
  isOpen,
  onClose,
  instructor,
  existingTrainees,
  onImportTrainees,
}: TraineeImportModalProps) {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importTab, setImportTab] = useState<'upload' | 'paste'>('upload');
  const [targetBatch, setTargetBatch] = useState<string>(instructor.batch || '૨૦૨૫–૨૦૨૬');
  const [targetUnit, setTargetUnit] = useState<string>(instructor.unit || 'Unit A');
  const [autoTransliterate, setAutoTransliterate] = useState<boolean>(true);
  const [rawPastedText, setRawPastedText] = useState<string>('');

  const [parsedRows, setParsedRows] = useState<ParsedTraineeRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableBatches = instructor.batches && instructor.batches.length > 0
    ? instructor.batches
    : [instructor.batch || '૨૦૨૫–૨૦૨૬'];

  const availableUnits = instructor.units && instructor.units.length > 0
    ? instructor.units
    : ['Unit A', 'Unit B', 'Unit C'];

  // Normalize column key for flexible mapping
  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[\s_\-.]+/g, '');
  };

  // Process raw data rows into structured Trainee rows
  const processRawData = (rows: Record<string, any>[]) => {
    const existingRolls = new Set(existingTrainees.map((t) => t.roll_no.trim()));
    const seenImportRolls = new Set<string>();

    const processed: ParsedTraineeRow[] = rows.map((raw, idx) => {
      // Find values using multiple possible Gujarati and English column header synonyms
      const getVal = (synonyms: string[]): string => {
        for (const syn of synonyms) {
          const normSyn = normalizeKey(syn);
          for (const rawKey of Object.keys(raw)) {
            if (normalizeKey(rawKey) === normSyn) {
              const v = raw[rawKey];
              return v !== undefined && v !== null ? String(v).trim() : '';
            }
          }
        }
        return '';
      };

      let roll_no = getVal(['roll', 'roll_no', 'rollno', 'રોલ', 'રોલ નં', 'રોલ નંબર', 'sr', 'srno']);
      if (!roll_no) {
        roll_no = String(existingTrainees.length + idx + 1);
      }

      let enrollment_no = getVal(['enrollment', 'enrollment_no', 'enrol', 'reg_no', 'રજીસ્ટ્રેશન', 'નોંધણી']);
      if (!enrollment_no) {
        enrollment_no = `ITI/${instructor.trade.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${roll_no}`;
      }

      // 1. English Names in sequence: Surname, Student Name, Father's Name, Grandfather's Name
      let surname_en = getVal(['surname_en', 'surname_english', 'last_name_en', 'lastname_en', 'surnameen', 'surname(en)', 'english_surname']);
      let student_name_en = getVal(['student_name_en', 'name_en', 'student_en', 'trainee_name_en', 'english_name', 'student(en)', 'firstname_en', 'nameen', 'english_student_name']);
      let father_name_en = getVal(['father_name_en', 'father_en', 'fathers_name_en', 'father_english', 'fathername_en', 'father(en)', 'english_father_name']);
      let grandfather_name_en = getVal(['grandfather_name_en', 'grandfather_en', 'grandfathers_name_en', 'grandfather_english', 'grandfather(en)', 'english_grandfather_name']);

      // 2. Gujarati Names in sequence: Surname, Student Name, Father's Name, Grandfather's Name
      let surname = getVal(['surname', 'surname_gu', 'અટક', 'last_name']);
      let student_name = getVal(['student_name', 'student_name_gu', 'નામ', 'તાલીમાર્થીનું નામ', 'વિદ્યાર્થીનું નામ', 'તાલીમાર્થી', 'નામ (ગુજરાતી)', 'name']);
      let father_name = getVal(['father_name', 'father_name_gu', 'પિતાનું નામ', 'પિતા', 'father']);
      let grandfather_name = getVal(['grandfather_name', 'grandfather_name_gu', 'દાદાનું નામ', 'દાદા', 'grandfather']);

      // Auto-transliterate if only English is present or vice-versa
      if (autoTransliterate) {
        if (!surname && surname_en) {
          surname = transliterateText(surname_en, 'Gujarati');
        }
        if (!student_name && student_name_en) {
          student_name = transliterateText(student_name_en, 'Gujarati');
        }
        if (!father_name && father_name_en) {
          father_name = transliterateText(father_name_en, 'Gujarati');
        }
        if (!grandfather_name && grandfather_name_en) {
          grandfather_name = transliterateText(grandfather_name_en, 'Gujarati');
        }

        if (!surname_en && surname) {
          surname_en = surname;
        }
        if (!student_name_en && student_name) {
          student_name_en = student_name;
        }
        if (!father_name_en && father_name) {
          father_name_en = father_name;
        }
        if (!grandfather_name_en && grandfather_name) {
          grandfather_name_en = grandfather_name;
        }
      }

      // 3. Gujarati Address fields
      let address_gu = getVal(['address_gu', 'address', 'સરનામું', 'સરનામુ', 'ગુજરાતી સરનામું', 'address(gu)', 'addr']) || 'મુ. પો. તાલુકા કેન્દ્ર';
      let village_gu = getVal(['village_gu', 'village', 'ગામ', 'શહેર', 'ગામ/શહેર', 'ગામ (ગુજરાતી)', 'city']) || 'શંખેશ્વર';
      let taluka_gu = getVal(['taluka_gu', 'taluka', 'તાલુકો', 'તાલુકો (ગુજરાતી)']) || 'શંખેશ્વર';
      let district_gu = getVal(['district_gu', 'district', 'જિલ્લો', 'જિલ્લો (ગુજરાતી)']) || 'પાટણ';
      let pincode = getVal(['pincode', 'પીનકોડ', 'pin', 'પીન કોડ', 'zip']) || '384242';

      // 4. Contact Numbers & Academic Hierarchy
      const mobile = getVal(['mobile', 'phone', 'contact', 'મોબાઈલ', 'ફોન', 'મોબાઈલ નંબર', 'mobile_no']);
      const parent_mobile = getVal(['parent_mobile', 'parents_mobile', 'વાલીનો મોબાઈલ', 'વાલી ફોન', 'guardian_mobile', 'father_mobile']);
      const unit = getVal(['unit', 'યુનિટ', 'section']) || targetUnit;
      const batch = getVal(['batch', 'બેચ', 'year', 'session']) || targetBatch;

      // Validation
      let isValid = true;
      let error = '';

      if (!student_name && !student_name_en) {
        isValid = false;
        error = 'વિદ્યાર્થીનું નામ ખૂટે છે (Student Name missing)';
      } else if (existingRolls.has(roll_no)) {
        error = `રોલ નં. ${roll_no} પહેલેથી હાજર છે (Duplicate roll in database)`;
      } else if (seenImportRolls.has(roll_no)) {
        error = `રોલ નં. ${roll_no} ફાઈલમાં ડુપ્લિકેટ છે (Duplicate roll in file)`;
      }

      seenImportRolls.add(roll_no);

      return {
        roll_no,
        enrollment_no,
        surname_en: surname_en || surname,
        student_name_en: student_name_en || student_name,
        father_name_en: father_name_en || father_name,
        grandfather_name_en: grandfather_name_en || grandfather_name,
        surname: surname || surname_en,
        student_name: student_name || student_name_en,
        father_name: father_name || father_name_en,
        grandfather_name: grandfather_name || grandfather_name_en,
        address_gu,
        village_gu,
        taluka_gu,
        district_gu,
        pincode,
        mobile,
        parent_mobile,
        unit,
        batch,
        address: address_gu,
        village: village_gu,
        taluka: taluka_gu,
        district: district_gu,
        isValid,
        error,
      };
    });

    setParsedRows(processed);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setStatusMessage(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          setStatusMessage({ type: 'error', text: 'ફાઈલ ખાલી છે અથવા કોઈ ડેટા મળ્યો નથી (File is empty).' });
          setParsedRows([]);
        } else {
          processRawData(jsonRows);
        }
      } catch (err) {
        console.error('File parsing error:', err);
        setStatusMessage({ type: 'error', text: 'ફાઈલ વાંચવામાં ભૂલ આવી. કૃપા કરીને યોગ્ય Excel અથવા CSV ફાઈલ અપલોડ કરો.' });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle Raw Text Paste
  const handleParsePastedText = () => {
    if (!rawPastedText.trim()) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const lines = rawPastedText.trim().split('\n');
      if (lines.length < 1) return;

      // Determine delimiter (Tab or Comma)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';

      const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] || '';
        });
        rows.push(rowObj);
      }

      if (rows.length === 0) {
        // Fallback: If no headers were pasted, treat each line as "Roll, Name, Mobile, Village"
        setStatusMessage({
          type: 'error',
          text: 'કૃપા કરીને હેડર લાઇન સાથે ડેટા પેસ્ટ કરો (e.g. Roll, Name, Surname, Unit, Batch).',
        });
      } else {
        processRawData(rows);
      }
    } catch (err) {
      console.error('Paste parse error:', err);
      setStatusMessage({ type: 'error', text: 'ડેટા પારસ કરવામાં ક્ષતિ થઈ.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleHeaders = [
    'roll_no',
    'enrollment_no',
    'surname_en',
    'student_name_en',
    'father_name_en',
    'grandfather_name_en',
    'surname',
    'student_name',
    'father_name',
    'grandfather_name',
    'address_gu',
    'village_gu',
    'taluka_gu',
    'district_gu',
    'pincode',
    'mobile',
    'parent_mobile',
    'unit',
    'batch',
  ];

  const sampleRows = [
    [
      '101',
      `ITI/${instructor.trade.substring(0, 3).toUpperCase()}/2026/101`,
      'Patel',
      'Rameshbhai',
      'Kantilal',
      'Nanjibhai',
      'પટેલ',
      'રમેશભાઈ',
      'કાંતિલાલ',
      'નાનજીભાઈ',
      'મુ. રામપુરા, સ્ટેશન રોડ',
      'શંખેશ્વર',
      'શંખેશ્વર',
      'પાટણ',
      '384242',
      '9825012345',
      '9825098761',
      'Unit A',
      targetBatch,
    ],
    [
      '102',
      `ITI/${instructor.trade.substring(0, 3).toUpperCase()}/2026/102`,
      'Thakor',
      'Kiranben',
      'Bhavanji',
      'Rameshji',
      'ઠાકોર',
      'કિરણબેન',
      'ભવાનજી',
      'રમેશજી',
      'મુ. બક્ષીપંચ વાસ',
      'સમી',
      'સમી',
      'પાટણ',
      '384242',
      '9825054321',
      '9825065432',
      'Unit B',
      targetBatch,
    ],
    [
      '103',
      `ITI/${instructor.trade.substring(0, 3).toUpperCase()}/2026/103`,
      'Chaudhary',
      'Vijaybhai',
      'Dineshbhai',
      'Ganeshbhai',
      'ચૌધરી',
      'વિજયભાઈ',
      'દિનેશભાઈ',
      'ગણેશભાઈ',
      'મુ. હાઈવે સર્કલ',
      'શંખેશ્વર',
      'શંખેશ્વર',
      'પાટણ',
      '384242',
      '9825098765',
      '9825087654',
      'Unit C',
      targetBatch,
    ],
  ];

  // Download Excel (.xlsx) Template with Styled Column Widths
  const handleDownloadExcelTemplate = () => {
    try {
      const wsData = [sampleHeaders, ...sampleRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 10 }, // roll_no
        { wch: 22 }, // enrollment_no
        { wch: 16 }, // surname_en
        { wch: 18 }, // student_name_en
        { wch: 18 }, // father_name_en
        { wch: 18 }, // grandfather_name_en
        { wch: 16 }, // surname
        { wch: 18 }, // student_name
        { wch: 18 }, // father_name
        { wch: 18 }, // grandfather_name
        { wch: 28 }, // address_gu
        { wch: 16 }, // village_gu
        { wch: 16 }, // taluka_gu
        { wch: 16 }, // district_gu
        { wch: 12 }, // pincode
        { wch: 15 }, // mobile
        { wch: 15 }, // parent_mobile
        { wch: 12 }, // unit
        { wch: 16 }, // batch
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trainee_Template');
      XLSX.writeFile(wb, `ITI_${instructor.trade.replace(/[\s/]+/g, '_')}_Trainee_Template.xlsx`);
    } catch (err) {
      console.error('Excel template download error, falling back to CSV:', err);
      handleDownloadCsvTemplate();
    }
  };

  // Download CSV (.csv) Template with UTF-8 BOM for Microsoft Excel Compatibility
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      '\uFEFF' +
      [sampleHeaders.join(','), ...sampleRows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ITI_${instructor.trade.replace(/[\s/]+/g, '_')}_Trainee_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Confirm and Import valid rows
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsSubmitting(true);

    try {
      const newTrainees: Trainee[] = validRows.map((r, idx) => ({
        id: `tr-imp-${Date.now()}-${idx}`,
        instructor_id: instructor.id,
        roll_no: r.roll_no,
        enrollment_no: r.enrollment_no,
        trade: instructor.trade,
        batch: r.batch || targetBatch,
        unit: r.unit || targetUnit,
        surname_en: r.surname_en,
        student_name_en: r.student_name_en,
        father_name_en: r.father_name_en,
        grandfather_name_en: r.grandfather_name_en,
        surname: r.surname,
        student_name: r.student_name,
        father_name: r.father_name,
        grandfather_name: r.grandfather_name,
        mobile: r.mobile,
        parent_mobile: r.parent_mobile,
        address: r.address_gu || r.address || '',
        address_gu: r.address_gu,
        village: r.village_gu || r.village || '',
        village_gu: r.village_gu,
        taluka: r.taluka_gu || r.taluka || '',
        taluka_gu: r.taluka_gu,
        district: r.district_gu || r.district || '',
        district_gu: r.district_gu,
        pincode: r.pincode,
        created_at: new Date().toISOString(),
      }));

      // Initial attendance records for each imported trainee
      const currentMonth = 'August 2026';
      const initialAttendance: AttendanceRecord[] = newTrainees.map((t, idx) => ({
        id: `att-imp-${Date.now()}-${idx}`,
        trainee_id: t.id,
        instructor_id: instructor.id,
        month_year: currentMonth,
        total_working_days: 25,
        present_days: 25,
        absent_days: 0,
        attendance_percentage: 100.0,
        flagged_low: false,
        updated_at: new Date().toISOString(),
      }));

      await onImportTrainees(newTrainees, initialAttendance);
      onClose();
    } catch (err) {
      console.error('Import confirmation error:', err);
      setStatusMessage({ type: 'error', text: 'તાલીમાર્થી આયાત કરવામાં ભૂલ થઈ.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>તાલીમાર્થી આયાત પોર્ટલ (Trainee Import Facility)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Excel / CSV / Paste
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {instructor.name} • {instructor.trade} ({instructor.unit})
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Options: Batch & Unit Selection & Template Download */}
          {/* Top Options: Batch & Unit Selection & Dual Template Downloads */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>લક્ષ્ય બેચ (Target Batch)</span>
                </label>
                <select
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ડિફોલ્ટ યુનિટ (Unit A / B / C)</span>
                </label>
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold text-emerald-800"
                >
                  {availableUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="flex-1 py-2 px-2.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Download formatted Excel (.xlsx) template with column headers"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Excel નમૂનો (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="flex-1 py-2 px-2.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Download standard CSV (.csv) template with UTF-8 encoding"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>CSV નમૂનો (.csv)</span>
                </button>
              </div>
            </div>

            {/* Column Sequence Legend */}
            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-slate-800">નમૂના કોલમ ક્રમ:</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">1. Roll</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">2. Enrol</span>
              <span className="text-blue-800 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">3. English (Surname, Name, Father, Grandfather)</span>
              <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">4. ગુજરાતી નામો (અટક, નામ, પિતા, દાદા)</span>
              <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">5. સરનામું (સરનામું, ગામ, તાલુકો, જિલ્લો, પીનકોડ)</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">6. Mobile &amp; Unit/Batch</span>
            </div>
          </div>

          {/* Toggle: File Upload vs Copy-Paste */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setImportTab('upload')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  importTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>એક્સેલ / CSV ફાઈલ અપલોડ</span>
              </button>
              <button
                type="button"
                onClick={() => setImportTab('paste')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  importTab === 'paste'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>કોપી-પેસ્ટ ડેટા (Direct Paste)</span>
              </button>
            </div>

            {/* Auto-transliterate toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={autoTransliterate}
                onChange={(e) => setAutoTransliterate(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>અંગ્રેજી નામોનું ગુજરાતીમાં રૂપાંતર કરો</span>
              </span>
            </label>
          </div>

          {/* Tab 1: Upload Box */}
          {importTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                અહીં Excel (.xlsx, .xls) અથવા CSV ફાઈલ પસંદ કરો અથવા ખેંચી લાવો
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                ITI Trainee Attendance & Admission Registers Supported
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>પસંદ કરેલ ફાઈલ: {fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Copy-Paste Box */}
          {importTab === 'paste' && (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Excel અથવા Google Sheets માંથી રો કોપી કરીને અહીં પેસ્ટ કરો (Ctrl+V)...&#10;ઉદાહરણ (નવી કોલમ સિક્વન્સ):&#10;Roll&#9;Enrollment&#9;Surname(EN)&#9;Name(EN)&#9;Father(EN)&#9;Grandfather(EN)&#9;Surname(GU)&#9;Name(GU)&#9;Father(GU)&#9;Grandfather(GU)&#9;Address(GU)&#9;Village(GU)&#9;Taluka(GU)&#9;District(GU)&#9;Pincode&#9;Mobile&#9;ParentMobile&#9;Unit&#9;Batch&#10;101&#9;ITI/COPA/2026/101&#9;Patel&#9;Rameshbhai&#9;Kantilal&#9;Nanjibhai&#9;પટેલ&#9;રમેશભાઈ&#9;કાંતિલાલ&#9;નાનજીભાઈ&#9;મુ. રામપુરા, સ્ટેશન રોડ&#9;શંખેશ્વર&#9;શંખેશ્વર&#9;પાટણ&#9;384242&#9;9825012345&#9;9825098761&#9;Unit A&#9;૨૦૨૫–૨૦૨૬"
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  disabled={!rawPastedText.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white shadow-xs cursor-pointer"
                >
                  ડેટા તપાસો (Parse Pasted Rows)
                </button>
              </div>
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    તપાસેલ તાલીમાર્થી ડેટા પ્રીવ્યૂ (Parsed Preview):
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {validCount} તૈયાર (Ready)
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      {invalidCount} ક્ષતિગ્રસ્ત (Issues)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  કુલ {parsedRows.length} તાલીમાર્થીઓ
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-slate-700 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">રોલ નં.</th>
                      <th className="py-2.5 px-3">અંગ્રેજી નામ (Surname, Student, Father, Grandfather)</th>
                      <th className="py-2.5 px-3">ગુજરાતી નામ (અટક, વિદ્યાર્થી, પિતા, દાદા)</th>
                      <th className="py-2.5 px-3">ગુજરાતી સરનામું (ગામ / તાલુકો / જિલ્લો)</th>
                      <th className="py-2.5 px-3">યુનિટ / બેચ</th>
                      <th className="py-2.5 px-3">સંપર્ક નંબર</th>
                      <th className="py-2.5 px-3 text-center">સ્થિતિ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60'}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <div className="font-mono font-bold text-slate-900">{r.roll_no}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]" title={r.enrollment_no}>
                            {r.enrollment_no}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-900">
                          <div className="font-semibold text-xs">
                            {r.surname_en} {r.student_name_en} {r.father_name_en} {r.grandfather_name_en}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            EN Sequence: {r.surname_en || '—'} / {r.student_name_en || '—'} / {r.father_name_en || '—'} / {r.grandfather_name_en || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-950 font-gujarati">
                          <div className="font-bold text-xs">
                            {r.surname} {r.student_name} {r.father_name} {r.grandfather_name}
                          </div>
                          <div className="text-[10px] text-emerald-800/70">
                            ગુજરાતી: {r.surname} {r.student_name}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-gujarati">
                          <div className="text-slate-800 text-xs font-medium truncate max-w-[190px]" title={`${r.address_gu}, ${r.village_gu}, તા. ${r.taluka_gu}, જિ. ${r.district_gu} - ${r.pincode}`}>
                            {r.village_gu}, તા. {r.taluka_gu}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            જિ. {r.district_gu} ({r.pincode})
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800 text-[11px]">{r.unit}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{r.batch}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          <div>{r.mobile || '—'}</div>
                          {r.parent_mobile && (
                            <div className="text-[10px] text-slate-400">વાલી: {r.parent_mobile}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {r.isValid ? (
                            <span className="inline-flex items-center text-emerald-600 text-[11px] font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center text-rose-600 text-[11px] font-bold cursor-help"
                              title={r.error}
                            >
                              <AlertCircle className="w-4 h-4 mr-0.5" />
                              <span className="text-[10px]">ક્ષતિ</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {validCount > 0 ? (
              <span>
                આયાત કરવા માટે તૈયાર:{' '}
                <strong className="text-emerald-700">{validCount} તાલીમાર્થીઓ</strong>
              </span>
            ) : (
              <span>કૃપા કરીને ફાઈલ પસંદ કરો અથવા ડેટા પેસ્ટ કરો</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0 || isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>આયાત થઈ રહી છે...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>પોતાના પોર્ટલમાં આયાત કરો ({validCount} Import)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
