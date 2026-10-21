import React, { useState, useEffect } from 'react';
import {
  CustomTableTemplate,
  CustomTableColumn,
  Trainee,
  AttendanceRecord,
  Instructor,
} from '../types';
import {
  ROW_CELL_MERGE_TAGS,
  generateCustomTableHtml,
  DEFAULT_CUSTOM_TABLE_TEMPLATES,
} from '../utils/mergeTags';
import {
  Table2,
  Plus,
  Trash2,
  X,
  Check,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  PenTool,
  Eye,
  Save,
} from 'lucide-react';

interface CustomTableBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTables: CustomTableTemplate[];
  onSaveCustomTables: (updated: CustomTableTemplate[]) => void;
  onInsertTag?: (tagKey: string) => void;
  sampleTrainees?: Trainee[];
  attendanceRecords?: AttendanceRecord[];
  instructor: Instructor;
}

function slugifyTagName(input: string): string {
  const cleaned = input
    .trim()
    .replace(/[^a-zA-Z0-9_\u0A80-\u0AFF\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 32);
  return cleaned || `Table_${Date.now().toString().slice(-4)}`;
}

export default function CustomTableBuilderModal({
  isOpen,
  onClose,
  customTables,
  onSaveCustomTables,
  onInsertTag,
  sampleTrainees = [],
  attendanceRecords = [],
  instructor,
}: CustomTableBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [tagSlug, setTagSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [rowMinHeight, setRowMinHeight] = useState<number>(36);
  const [columns, setColumns] = useState<CustomTableColumn[]>([]);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('list');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startNewTable = () => {
    const newCols: CustomTableColumn[] = [
      {
        id: `col-${Date.now()}-1`,
        header: 'ક્રમ',
        cell_template: '{{Sr_No_Gu}}',
        align: 'center',
        width: '7%',
        bold: true,
      },
      {
        id: `col-${Date.now()}-2`,
        header: 'તાલીમાર્થીનું નામ',
        cell_template: '{{Full_Name}}',
        align: 'left',
        width: '26%',
        bold: true,
      },
      {
        id: `col-${Date.now()}-3`,
        header: 'સરનામું',
        cell_template: '{{Full_Address}}',
        align: 'left',
        width: '42%',
        bold: false,
      },
      {
        id: `col-${Date.now()}-4`,
        header: 'નોંધ / સહી',
        cell_template: '',
        is_blank_for_handwriting: true,
        align: 'left',
        width: '25%',
        bold: false,
      },
    ];
    setEditingId(null);
    setTableName('મારું કસ્ટમ વિદ્યાર્થી પત્રક');
    setTagSlug(`Student_Table_${customTables.length + 1}`);
    setDescription('તાલીમાર્થીનું નામ, સરનામું અને પ્રિન્ટ બાદ હાથથી લખવા માટે ખાલી નોંધ કોલમ');
    setRowMinHeight(36);
    setColumns(newCols);
    setActiveColumnId(newCols[1].id);
    setActiveTab('editor');
  };

  const startEditTable = (tbl: CustomTableTemplate) => {
    setEditingId(tbl.id);
    setTableName(tbl.name);
    const extractedSlug = tbl.tag_key
      .replace(/^\{\{Custom_Table:/i, '')
      .replace(/\}\}$/, '');
    setTagSlug(extractedSlug || 'Custom_Table_1');
    setDescription(tbl.description || '');
    setRowMinHeight(tbl.row_min_height_px || 34);
    const clonedCols = tbl.columns.map((c) => ({ ...c }));
    setColumns(clonedCols);
    setActiveColumnId(clonedCols[0]?.id || null);
    setActiveTab('editor');
  };

  const handleDeleteTable = (id: string) => {
    const updated = customTables.filter((t) => t.id !== id);
    onSaveCustomTables(updated);
  };

  const addColumn = () => {
    const newCol: CustomTableColumn = {
      id: `col-${Date.now()}-${columns.length + 1}`,
      header: `કોલમ ${columns.length + 1}`,
      cell_template: '',
      is_blank_for_handwriting: true,
      align: 'left',
      width: 'auto',
      bold: false,
    };
    setColumns([...columns, newCol]);
    setActiveColumnId(newCol.id);
  };

  const updateColumn = (id: string, patch: Partial<CustomTableColumn>) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...patch } : col))
    );
  };

  const removeColumn = (id: string) => {
    if (columns.length <= 1) return;
    const filtered = columns.filter((c) => c.id !== id);
    setColumns(filtered);
    if (activeColumnId === id) {
      setActiveColumnId(filtered[0]?.id || null);
    }
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    const copy = [...columns];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setColumns(copy);
  };

  const appendTagToActiveColumn = (tag: string) => {
    const targetId = activeColumnId || columns[0]?.id;
    if (!targetId) return;
    const targetCol = columns.find((c) => c.id === targetId);
    if (!targetCol) return;

    const currentVal = targetCol.is_blank_for_handwriting ? '' : targetCol.cell_template;
    const nextVal = currentVal ? `${currentVal} ${tag}` : tag;
    updateColumn(targetId, {
      is_blank_for_handwriting: false,
      cell_template: nextVal,
    });
  };

  const fullGeneratedTagKey = `{{Custom_Table:${slugifyTagName(tagSlug || tableName)}}}`;

  const buildCurrentTemplateObject = (): CustomTableTemplate => {
    return {
      id: editingId || `ctbl-user-${Date.now()}`,
      name: tableName.trim() || 'કસ્ટમ વિદ્યાર્થી પત્રક',
      tag_key: fullGeneratedTagKey,
      description: description.trim(),
      row_min_height_px: rowMinHeight,
      columns: columns.map((c) => ({
        ...c,
        header: c.header.trim() || 'કોલમ',
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSaveTable = (insertAfterSave = false) => {
    const newObj = buildCurrentTemplateObject();
    let updatedList: CustomTableTemplate[];
    if (editingId) {
      updatedList = customTables.map((t) => (t.id === editingId ? newObj : t));
    } else {
      updatedList = [newObj, ...customTables];
    }
    onSaveCustomTables(updatedList);

    if (insertAfterSave && onInsertTag) {
      onInsertTag(newObj.tag_key);
      onClose();
    } else {
      setActiveTab('list');
    }
  };

  // Sample trainees for live preview inside builder
  const previewTraineesList = (
    sampleTrainees.length > 0
      ? sampleTrainees.slice(0, 3)
      : [
          {
            id: 'sample-1',
            instructor_id: instructor.id,
            roll_no: '૧૦૧',
            enrollment_no: '250101',
            trade: instructor.trade || 'કોપા (COPA)',
            batch: instructor.batch || '૨૦૨૫–૨૦૨૬',
            unit: instructor.unit || 'Unit A',
            surname: 'પટેલ',
            student_name: 'આરવકુમાર',
            father_name: 'રમેશભાઈ',
            grandfather_name: 'મોહનભાઈ',
            surname_en: 'Patel',
            student_name_en: 'Aaravkumar',
            father_name_en: 'Rameshbhai',
            grandfather_name_en: 'Mohanbhai',
            mobile: '9876543210',
            parent_mobile: '9825011223',
            address: 'મેઈન બજાર, પટેલ વાસ',
            village: 'શંખેશ્વર',
            taluka: 'શંખેશ્વર',
            district: 'પાટણ',
            pincode: '384246',
            created_at: new Date().toISOString(),
          },
          {
            id: 'sample-2',
            instructor_id: instructor.id,
            roll_no: '૧૦૨',
            enrollment_no: '250102',
            trade: instructor.trade || 'કોપા (COPA)',
            batch: instructor.batch || '૨૦૨૫–૨૦૨૬',
            unit: instructor.unit || 'Unit A',
            surname: 'ઠાકોર',
            student_name: 'કિરણબેન',
            father_name: 'ભરતજી',
            grandfather_name: 'સંજુજી',
            surname_en: 'Thakor',
            student_name_en: 'Kiranben',
            father_name_en: 'Bharatji',
            grandfather_name_en: 'Sanjuji',
            mobile: '9876500011',
            parent_mobile: '9898012345',
            address: 'હનુમાન મંદિર પાસે',
            village: 'સમી',
            taluka: 'સમી',
            district: 'પાટણ',
            pincode: '384245',
            created_at: new Date().toISOString(),
          },
        ]
  ).map((tr) => ({
    trainee: tr,
    attendance: attendanceRecords.find((a) => a.trainee_id === tr.id),
  }));

  const livePreviewHtml =
    activeTab === 'editor'
      ? generateCustomTableHtml(buildCurrentTemplateObject(), previewTraineesList, {
          trainee: previewTraineesList[0].trainee,
          attendance: previewTraineesList[0].attendance,
          instructor,
          language: 'Gujarati',
        })
      : '';

  const activeColObj = columns.find((c) => c.id === activeColumnId) || columns[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#346739] text-[#f2edc2] rounded-xl">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                કસ્ટમ ટેબલ મર્જ ટેગ સ્ટુડિયો (Custom Table Merge Tag Builder)
              </h2>
              <p className="text-xs text-slate-300">
                તમારી પસંદગીના કોલમ નામ, મર્જ ફિલ્ડ્સ (`{'{{Full_Name}}'}`, `{'{{Full_Address}}'}`) અને પ્રિન્ટ બાદ હાથથી લખવા માટે ખાલી કોલમ સાથેનું ટેબલ બનાવો
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'list'
                  ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              તૈયાર કસ્ટમ ટેબલ ટેગ્સ ({customTables.length})
            </button>
            <button
              type="button"
              onClick={startNewTable}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'editor' && !editingId
                  ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                  : 'bg-emerald-50 text-[#346739] border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>નવું કસ્ટમ ટેબલ બનાવો (Create New Table Tag)</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <button
              type="button"
              onClick={() => {
                onSaveCustomTables(DEFAULT_CUSTOM_TABLE_TEMPLATES);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              title="ડિફોલ્ટ ટેબલ પાછા લાવો"
            >
              ડિફોલ્ટ ટેબલ્સ રીસેટ કરો
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#346739]" />
                    <span>કસ્ટમ ટેબલ મર્જ ટેગ કેવી રીતે કામ કરે છે?</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    ૧. તમારી જરૂરિયાત મુજબના કોલમ (દા.ત. ક્રમ, તાલીમાર્થીનું નામ, સરનામું, સહી/નોંધ) સાથે ટેબલ ફોર્મેટ બનાવો.<br />
                    ૨. દરેક કોલમમાં મર્જ ટેગ (જેમ કે <code>{'{{Full_Name}}'}</code>, <code>{'{{Full_Address}}'}</code>) મૂકો અથવા કાગળ પર પ્રિન્ટ પછી પેનથી લખવા માટે ખાલી રાખો.<br />
                    ૩. તૈયાર થયેલ ટેગ (દા.ત. <code>{'{{Custom_Table:...}}'}</code>) કોઈપણ પત્રમાં મૂકવાથી પસંદ કરેલ તમામ વિદ્યાર્થીઓનું ટેબલ આપોઆપ બની જશે!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNewTable}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>નવું ટેબલ ફોર્મેટ બનાવો</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {customTables.map((tbl) => {
                  const isJustCopied = copiedTag === tbl.tag_key;
                  const sampleHtml = generateCustomTableHtml(
                    tbl,
                    previewTraineesList.slice(0, 2),
                    {
                      trainee: previewTraineesList[0].trainee,
                      attendance: previewTraineesList[0].attendance,
                      instructor,
                      language: 'Gujarati',
                    }
                  );

                  return (
                    <div
                      key={tbl.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 shadow-2xs space-y-3 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-slate-900">
                              {tbl.name}
                            </h3>
                            <code className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-[#346739]">
                              {tbl.tag_key}
                            </code>
                          </div>
                          {tbl.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {tbl.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onInsertTag && (
                            <button
                              type="button"
                              onClick={() => {
                                onInsertTag(tbl.tag_key);
                                onClose();
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>પત્રમાં ઉમેરો (Insert in Letter)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(tbl.tag_key);
                              setCopiedTag(tbl.tag_key);
                              setTimeout(() => setCopiedTag(null), 1800);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isJustCopied ? 'કોપી થયું!' : 'ટેગ કોપી'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditTable(tbl)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>ફેરફાર (Edit)</span>
                          </button>

                          {customTables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTable(tbl.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="આ કસ્ટમ ટેબલ દૂર કરો"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Column Summary Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="font-bold text-slate-500">કોલમ્સ ({tbl.columns.length}):</span>
                        {tbl.columns.map((c, idx) => (
                          <span
                            key={c.id || idx}
                            className={`px-2 py-0.5 rounded border font-medium ${
                              c.is_blank_for_handwriting || !c.cell_template.trim()
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <strong>{c.header}:</strong>{' '}
                            {c.is_blank_for_handwriting || !c.cell_template.trim()
                              ? '[ખાલી - હાથથી લખવા]'
                              : c.cell_template}
                          </span>
                        ))}
                      </div>

                      {/* Mini Preview */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          નમૂના પ્રિવ્યુ (૨ વિદ્યાર્થી રો):
                        </div>
                        <div
                          className="font-gujarati text-slate-900"
                          dangerouslySetInnerHTML={{ __html: sampleHtml }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TABLE EDITOR VIEW */
            <div className="space-y-6">
              {/* Step 1: Table Name & Tag Slug */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ૧. કસ્ટમ ટેબલનું નામ (Table Format Name)
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="દા.ત. વિદ્યાર્થી સરનામા અને સહી પત્રક"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#346739]"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ૨. મર્જ ટેગ કોડ (Merge Tag ID)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-xl text-[11px] font-mono text-slate-600">
                      {'{{Custom_Table:'}
                    </span>
                    <input
                      type="text"
                      value={tagSlug}
                      onChange={(e) => setTagSlug(e.target.value)}
                      placeholder="My_Table"
                      className="w-full px-2 py-2 text-xs bg-white border-y border-slate-300 font-mono font-bold text-[#346739] focus:outline-none"
                    />
                    <span className="px-2 py-2 bg-slate-200 border border-l-0 border-slate-300 rounded-r-xl text-[11px] font-mono text-slate-600">
                      {'}}'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ૩. રો ઊંચાઈ (હાથથી લખવા જગ્યા)
                  </label>
                  <select
                    value={rowMinHeight}
                    onChange={(e) => setRowMinHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    <option value={28}>સામાન્ય (28px - Compact)</option>
                    <option value={36}>મધ્યમ જગ્યા (36px - Standard)</option>
                    <option value={46}>વધુ જગ્યા - સહી/નોંધ માટે (46px)</option>
                    <option value={58}>મોટી જગ્યા (58px - Extra Large)</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Columns Designer & Merge Field Picker */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 Cols: Columns List */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      ટેબલ કોલમ્સ અને રો ડેટા ગોઠવણી ({columns.length} કોલમ્સ)
                    </h3>
                    <button
                      type="button"
                      onClick={addColumn}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>નવી કોલમ ઉમેરો (Add Column)</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {columns.map((col, idx) => {
                      const isSelected = activeColObj?.id === col.id;
                      const isBlank = Boolean(col.is_blank_for_handwriting);

                      return (
                        <div
                          key={col.id}
                          onClick={() => setActiveColumnId(col.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#346739] bg-emerald-50/40 ring-1 ring-[#346739]'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={col.header}
                                onChange={(e) =>
                                  updateColumn(col.id, { header: e.target.value })
                                }
                                placeholder="કોલમનું નામ (દા.ત. તાલીમાર્થીનું નામ, સરનામું, નોંધ)"
                                className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900 w-48 sm:w-56 focus:outline-none focus:border-[#346739]"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveColumn(idx, -1);
                                }}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="ઉપર ખસેડો"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveColumn(idx, 1);
                                }}
                                disabled={idx === columns.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="નીચે ખસેડો"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {columns.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeColumn(col.id);
                                  }}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                  title="કોલમ દૂર કરો"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Row Cell Value OR Blank for Handwriting toggle */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isBlank}
                                  onChange={(e) =>
                                    updateColumn(col.id, {
                                      is_blank_for_handwriting: e.target.checked,
                                      cell_template: e.target.checked ? '' : col.cell_template,
                                    })
                                  }
                                  className="rounded text-[#346739] focus:ring-[#346739]"
                                />
                                <PenTool className="w-3 h-3 text-amber-700" />
                                <span>પ્રિન્ટ બાદ કાગળ પર હાથથી લખવા ખાલી રાખો (Leave Blank)</span>
                              </label>

                              <div className="flex items-center gap-2 text-[11px]">
                                <select
                                  value={col.align || 'left'}
                                  onChange={(e) =>
                                    updateColumn(col.id, {
                                      align: e.target.value as 'left' | 'center' | 'right',
                                    })
                                  }
                                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium"
                                >
                                  <option value="left">ડાબે (Left)</option>
                                  <option value="center">વચ્ચે (Center)</option>
                                  <option value="right">જમણે (Right)</option>
                                </select>

                                <label className="inline-flex items-center gap-1 font-bold text-slate-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(col.bold)}
                                    onChange={(e) =>
                                      updateColumn(col.id, { bold: e.target.checked })
                                    }
                                    className="rounded text-[#346739]"
                                  />
                                  <span>Bold</span>
                                </label>
                              </div>
                            </div>

                            {!isBlank ? (
                              <div>
                                <input
                                  type="text"
                                  value={col.cell_template}
                                  onFocus={() => setActiveColumnId(col.id)}
                                  onChange={(e) =>
                                    updateColumn(col.id, {
                                      cell_template: e.target.value,
                                      is_blank_for_handwriting: false,
                                    })
                                  }
                                  placeholder="જમણી બાજુથી મર્જ ફિલ્ડ ક્લિક કરો દા.ત. {{Full_Name}} અથવા {{Full_Address}}"
                                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#346739]"
                                />
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 bg-amber-50/60 border border-dashed border-amber-300 rounded-lg text-[11px] text-amber-800 italic">
                                ✍️ આ કોલમ પ્રિન્ટમાં ખાલી રહેશે જેથી પ્રિન્ટ કાઢ્યા બાદ પેનથી સહી કે નોંધ લખી શકાય.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 5 Cols: Click-to-Insert Merge Fields for Selected Column */}
                <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>રો ડેટા મર્જ ફિલ્ડ્સ (Click to Add to Column)</span>
                      {activeColObj && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-[#346739] rounded text-[10px] font-bold">
                          કોલમ: {activeColObj.header}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      નીચેનામાંથી કોઈપણ મર્જ ફિલ્ડ પર ક્લિક કરશો એટલે પસંદ કરેલ કોલમ (<strong>{activeColObj?.header}</strong>) માં તે ઉમેરાઈ જશે:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-1 pt-1">
                      {ROW_CELL_MERGE_TAGS.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => appendTagToActiveColumn(item.tag)}
                          className="flex flex-col items-start p-2 rounded-lg bg-white border border-slate-200 hover:border-[#346739] hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#346739] line-clamp-1">
                            {item.label}
                          </span>
                          <code className="text-[10px] font-mono text-slate-500 group-hover:text-emerald-700">
                            {item.tag}
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    💡 <strong>ટિપ:</strong> તમે એક જ કોલમમાં બે ફિલ્ડ પણ ભેગા રાખી શકો છો, દા.ત. નામ અને રોલ નંબર માટે <code>{'{{Full_Name}} ({{Trainee_Roll_No}})'}</code>.
                  </div>
                </div>
              </div>

              {/* Step 3: Live Real-Time Preview */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <Eye className="w-4 h-4 text-[#346739]" />
                    <span>લાઈવ ટેબલ પ્રિવ્યુ (Live Sample Table Format Preview)</span>
                  </div>
                  <code className="text-xs font-mono font-bold text-[#346739] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    મર્જ ટેગ: {fullGeneratedTagKey}
                  </code>
                </div>
                <div
                  className="bg-white p-4 rounded-xl border border-slate-300 overflow-x-auto font-gujarati text-slate-900"
                  dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {activeTab === 'editor' ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl cursor-pointer"
              >
                ← પાછા જાઓ (Back to List)
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveTable(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ફક્ત સેવ કરો (Save Table Tag)</span>
                </button>
                {onInsertTag && (
                  <button
                    type="button"
                    onClick={() => handleSaveTable(true)}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>સેવ કરો અને પત્રમાં ઉમેરો (Save & Insert in Letter)</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500">
                કુલ {customTables.length} કસ્ટમ ટેબલ મર્જ ટેગ્સ ઉપલબ્ધ છે.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
              >
                બંધ કરો (Close)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
