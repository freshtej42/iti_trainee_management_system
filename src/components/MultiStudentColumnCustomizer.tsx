import React from 'react';
import { MultiStudentTableColumnKey } from '../types';
import { Columns3, Check, RotateCcw, X } from 'lucide-react';
import { DEFAULT_MULTI_STUDENT_COLUMNS } from '../utils/mergeTags';

interface ColumnOption {
  key: MultiStudentTableColumnKey;
  labelGu: string;
  labelEn: string;
  description: string;
}

export const ALL_COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'sr_no', labelGu: 'ક્રમ (Sr. No.)', labelEn: 'Serial Number', description: '૧, ૨, ૩...' },
  { key: 'roll_no', labelGu: 'રોલ નંબર (Roll No)', labelEn: 'Roll Number', description: 'તાલીમાર્થી રોલ નં.' },
  { key: 'enrollment_no', labelGu: 'એનરોલમેન્ટ નંબર (Enrollment)', labelEn: 'Enrollment No', description: 'સત્તાવાર રજીસ્ટ્રેશન નં.' },
  { key: 'full_name', labelGu: 'તાલીમાર્થીનું નામ (Full Name)', labelEn: 'Student Full Name', description: 'અટક + વિદ્યાર્થી + પિતા' },
  { key: 'parent_name', labelGu: 'વાલી / પિતાનું નામ (Parent)', labelEn: 'Parent / Guardian', description: 'પિતા + દાદા + અટક' },
  { key: 'address', labelGu: 'સંપૂર્ણ રહેઠાણ સરનામું (Address)', labelEn: 'Full Residential Address', description: 'શેરી, ગામ, તાલુકો, જિલ્લો, પિનકોડ' },
  { key: 'mobile', labelGu: 'મોબાઈલ / સંપર્ક (Contact)', labelEn: 'Mobile Number', description: 'વાલી અથવા તાલીમાર્થી મોબાઈલ' },
  { key: 'attendance_pct', labelGu: 'હાજરી ટકાવારી (Attendance %)', labelEn: 'Attendance Percentage', description: 'માસિક અથવા સંચિત %' },
  { key: 'absent_since', labelGu: 'ગેરહાજર તારીખ (Absent Since)', labelEn: 'Continuous Absent Since', description: 'કઈ તારીખથી ગેરહાજર' },
  { key: 'remarks', labelGu: 'નોંધ / વિગત (Remarks)', labelEn: 'Notes & Remarks', description: 'કચેરીય નોંધ અથવા સૂચના' },
];

interface MultiStudentColumnCustomizerProps {
  selectedColumns: MultiStudentTableColumnKey[];
  onChangeColumns: (columns: MultiStudentTableColumnKey[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MultiStudentColumnCustomizer({
  selectedColumns,
  onChangeColumns,
  isOpen,
  onClose,
}: MultiStudentColumnCustomizerProps) {
  if (!isOpen) return null;

  const toggleColumn = (key: MultiStudentTableColumnKey) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length <= 1) {
        alert('ઓછામાં ઓછી એક કોલમ પસંદ હોવી જરૂરી છે.');
        return;
      }
      onChangeColumns(selectedColumns.filter((c) => c !== key));
    } else {
      onChangeColumns([...selectedColumns, key]);
    }
  };

  const handleReset = () => {
    onChangeColumns(DEFAULT_MULTI_STUDENT_COLUMNS);
  };

  const handleSelectAll = () => {
    onChangeColumns(ALL_COLUMN_OPTIONS.map((c) => c.key));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#346739] text-[#f2edc2] rounded-lg">
              <Columns3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                સંયુક્ત પત્રક કોલમ ગોઠવણી (Customize Table Columns)
              </h3>
              <p className="text-[11px] text-slate-500">
                એક જ પાનાના સંયુક્ત પત્રકમાં જે કોલમ્સ દર્શાવવી હોય તેને સિલેક્ટ કરો
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column Checkboxes List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-600">
              પસંદ કરેલ કોલમ્સ: <strong className="text-slate-900">{selectedColumns.length}</strong> / {ALL_COLUMN_OPTIONS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-[#346739] hover:underline"
              >
                બધી પસંદ કરો
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>મૂળભૂત</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {ALL_COLUMN_OPTIONS.map((opt) => {
              const isChecked = selectedColumns.includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(opt.key)}
                    className="mt-0.5 w-4 h-4 text-[#346739] rounded border-slate-300 focus:ring-[#346739]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center justify-between">
                      <span>{opt.labelGu}</span>
                      {isChecked && (
                        <span className="text-[10px] font-mono font-bold text-[#346739] bg-emerald-100 px-1.5 py-0.5 rounded">
                          સક્રિય
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {opt.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-xl shadow-xs transition-colors"
          >
            લાગુ કરો (Apply & Close)
          </button>
        </div>
      </div>
    </div>
  );
}
