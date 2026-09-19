import React, { useState } from 'react';
import { Instructor, Trainee, AcademicTrade, AcademicBatch, AcademicUnit } from '../types';
import {
  Layers,
  FolderPlus,
  PlusCircle,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  UserCheck,
  CheckSquare,
  Square,
  X,
  Phone,
  AlertTriangle,
} from 'lucide-react';

interface AcademicHierarchyManagerProps {
  instructor: Instructor;
  trainees: Trainee[];
  allTrainees?: Trainee[];
  onUpdateInstructor: (instructor: Instructor) => void;
  onAssignTraineesToUnit?: (
    traineeIds: string[],
    trade: string,
    batch: string,
    unit: string
  ) => Promise<void> | void;
  onNavigateToTrainees: (trade: string, batch: string, unit: string) => void;
}

const PRESET_TRADES = [
  'કોપા (COPA)',
  'ફિટર (Fitter)',
  'ઇલેક્ટ્રિશિયન (Electrician)',
  'વાયરમેન (Wireman)',
  'વેલ્ડર (Welder)',
  'ટર્નર (Turner)',
  'મશીનિસ્ટ (Machinist)',
  'મિકેનિક ડીઝલ (Mechanic Diesel)',
  'મોટર મિકેનિક વ્હીકલ (MMV)',
  'સ્ટેનોગ્રાફર (Stenographer Gujarati/English)',
];

const PRESET_BATCHES = ['૨૦૨૫–૨૦૨૬', '૨૦૨૪–૨૦૨૬', '૨૦૨૫–૨૦૨૭', '૨૦૨૬–૨૦૨૭'];
const PRESET_UNITS = ['Unit A', 'Unit B', 'Unit C', 'યુનિટ ૧', 'યુનિટ ૨'];

// Normalize Gujarati numerals to English digits
export function normalizeGujaratiNumerals(str: string): string {
  if (!str) return '';
  const map: Record<string, string> = {
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
  };
  return str.replace(/[૦-૯]/g, (m) => map[m] || m);
}

// Clean alphanumeric key for flexible comparisons
export function getCleanKey(str?: string): string {
  if (!str) return '';
  return normalizeGujaratiNumerals(str)
    .toLowerCase()
    .replace(/[–—_]/g, '-')
    .replace(/[^a-z0-9]/g, '');
}

// Match Trade flexibly
export function doesTradeMatch(traineeTrade?: string, targetTrade?: string): boolean {
  if (!traineeTrade || !targetTrade) return false;
  const t1 = traineeTrade.trim().toLowerCase();
  const t2 = targetTrade.trim().toLowerCase();
  if (t1 === t2) return true;

  const k1 = getCleanKey(traineeTrade);
  const k2 = getCleanKey(targetTrade);
  if (k1 === k2) return true;
  if (k1.includes(k2) || k2.includes(k1)) return true;

  // Check english acronyms (e.g. "copa", "fitter", "welder")
  const acr1: string[] = t1.match(/[a-z0-9]{3,}/g) || [];
  const acr2: string[] = t2.match(/[a-z0-9]{3,}/g) || [];
  for (const a of acr1) {
    if (acr2.includes(a)) return true;
  }

  return false;
}

// Match Batch flexibly
export function doesBatchMatch(traineeBatch?: string, targetBatch?: string): boolean {
  if (!traineeBatch || !targetBatch) return false;
  const b1 = traineeBatch.trim().toLowerCase();
  const b2 = targetBatch.trim().toLowerCase();
  if (b1 === b2) return true;

  const k1 = getCleanKey(traineeBatch);
  const k2 = getCleanKey(targetBatch);
  if (k1 === k2) return true;
  if (k1.includes(k2) || k2.includes(k1)) return true;

  return false;
}

// Canonical unit alias for counting Unit A <-> Unit 1 <-> યુનિટ ૧
export function canonicalUnit(unitStr?: string): string {
  if (!unitStr) return '';
  const key = getCleanKey(unitStr);
  if (key === 'unita' || key === 'unit1' || key === 'unit૧' || key === '1' || key === 'a' || key.includes('યુનિટ1') || key.includes('યુનિટ૧')) {
    return 'unit-1';
  }
  if (key === 'unitb' || key === 'unit2' || key === 'unit૨' || key === '2' || key === 'b' || key.includes('યુનિટ2') || key.includes('યુનિટ૨')) {
    return 'unit-2';
  }
  if (key === 'unitc' || key === 'unit3' || key === 'unit૩' || key === '3' || key === 'c' || key.includes('યુનિટ3') || key.includes('યુનિટ૩')) {
    return 'unit-3';
  }
  if (key === 'unitd' || key === 'unit4' || key === 'unit૪' || key === '4' || key === 'd' || key.includes('યુનિટ4') || key.includes('યુનિટ૪')) {
    return 'unit-4';
  }
  return key;
}

export function doesUnitMatch(traineeUnit?: string, targetUnit?: string): boolean {
  if (!traineeUnit || !targetUnit) return false;
  const u1 = traineeUnit.trim().toLowerCase();
  const u2 = targetUnit.trim().toLowerCase();
  if (u1 === u2) return true;

  const c1 = canonicalUnit(traineeUnit);
  const c2 = canonicalUnit(targetUnit);
  if (c1 && c2 && c1 === c2) return true;

  return getCleanKey(traineeUnit) === getCleanKey(targetUnit);
}

export default function AcademicHierarchyManager({
  instructor,
  trainees,
  allTrainees,
  onUpdateInstructor,
  onAssignTraineesToUnit,
  onNavigateToTrainees,
}: AcademicHierarchyManagerProps) {
  // Ensure hierarchy exists
  const rawHierarchy: AcademicTrade[] =
    instructor.academic_hierarchy && instructor.academic_hierarchy.length > 0
      ? instructor.academic_hierarchy
      : [
          {
            id: `trade-${Date.now()}`,
            name: instructor.trade || 'કોપા (COPA)',
            batches: [
              {
                id: `batch-${Date.now()}`,
                name: instructor.batch || '૨૦૨૫–૨૦૨૬',
                units: (instructor.units || ['Unit A']).map((u, i) => ({
                  id: `unit-${Date.now()}-${i}`,
                  name: u,
                })),
              },
            ],
          },
        ];

  const [hierarchy, setHierarchy] = useState<AcademicTrade[]>(rawHierarchy);
  const [activeTradeId, setActiveTradeId] = useState<string>(rawHierarchy[0]?.id || '');
  const [activeBatchId, setActiveBatchId] = useState<string>(rawHierarchy[0]?.batches[0]?.id || '');

  // Add Trade Modal
  const [newTradeName, setNewTradeName] = useState('');
  const [isAddingTrade, setIsAddingTrade] = useState(false);

  // Add Batch Modal
  const [newBatchName, setNewBatchName] = useState('૨૦૨૫–૨૦૨૬');
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  // Add Unit Modal
  const [newUnitName, setNewUnitName] = useState('Unit A');
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  // Expanded student view per unit
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Quick Assign Modal state
  const [assignModalUnit, setAssignModalUnit] = useState<{
    tradeName: string;
    batchName: string;
    unitName: string;
  } | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [selectedTraineesToAssign, setSelectedTraineesToAssign] = useState<string[]>([]);
  const [assignFilterTab, setAssignFilterTab] = useState<'unassigned' | 'trade' | 'all'>('unassigned');
  const [isAssigning, setIsAssigning] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Use full institute trainees list if provided
  const effectiveTrainees = allTrainees && allTrainees.length > 0 ? allTrainees : trainees;

  // Current active selections
  const currentTrade = hierarchy.find((t) => t.id === activeTradeId) || hierarchy[0];
  const currentBatch = currentTrade?.batches.find((b) => b.id === activeBatchId) || currentTrade?.batches[0];

  // Global counts
  const totalTraineesCount = effectiveTrainees.length;
  const fullyAssignedCount = effectiveTrainees.filter(
    (t) => Boolean(t.trade?.trim() && t.batch?.trim() && t.unit?.trim())
  ).length;
  const unassignedCount = totalTraineesCount - fullyAssignedCount;

  // Selected trade & batch trainee counts
  const currentTradeTrainees = currentTrade
    ? effectiveTrainees.filter((tr) => doesTradeMatch(tr.trade, currentTrade.name))
    : [];

  const currentBatchTrainees = currentTrade && currentBatch
    ? effectiveTrainees.filter(
        (tr) =>
          doesTradeMatch(tr.trade, currentTrade.name) &&
          doesBatchMatch(tr.batch, currentBatch.name)
      )
    : [];

  // Helper to persist hierarchy
  const persistHierarchy = (updated: AcademicTrade[], msg: string) => {
    setHierarchy(updated);

    const allTrades = updated.map((t) => t.name);
    const allBatches = Array.from(new Set(updated.flatMap((t) => t.batches.map((b) => b.name))));
    const allUnits = Array.from(new Set(updated.flatMap((t) => t.batches.flatMap((b) => b.units.map((u) => u.name)))));

    const activeTrade = updated.find((t) => t.id === activeTradeId) || updated[0];
    const activeBatch = activeTrade?.batches.find((b) => b.id === activeBatchId) || activeTrade?.batches[0];
    const activeUnit = activeBatch?.units[0]?.name || allUnits[0] || 'Unit A';

    const updatedInstructor: Instructor = {
      ...instructor,
      academic_hierarchy: updated,
      trades: allTrades,
      trade: activeTrade ? activeTrade.name : instructor.trade,
      batches: allBatches,
      batch: activeBatch ? activeBatch.name : instructor.batch,
      units: allUnits,
      unit: activeUnit,
      updated_at: new Date().toISOString(),
    };

    onUpdateInstructor(updatedInstructor);
    setStatusMsg({ type: 'success', text: msg });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Add Trade
  const handleAddTrade = () => {
    if (!newTradeName.trim()) return;
    const newTrade: AcademicTrade = {
      id: `trade-${Date.now()}`,
      name: newTradeName.trim(),
      batches: [
        {
          id: `batch-${Date.now()}`,
          name: '૨૦૨૫–૨૦૨૬',
          units: [{ id: `unit-${Date.now()}`, name: 'Unit A' }],
        },
      ],
    };
    const next = [...hierarchy, newTrade];
    setActiveTradeId(newTrade.id);
    setActiveBatchId(newTrade.batches[0].id);
    setNewTradeName('');
    setIsAddingTrade(false);
    persistHierarchy(next, `ટ્રેડ "${newTrade.name}" સફળતાપૂર્વક ઉમેરાયો.`);
  };

  // Delete Trade
  const handleDeleteTrade = (tradeId: string) => {
    if (hierarchy.length <= 1) {
      alert('ઓછામાં ઓછો એક ટ્રેડ હોવો ફરજિયાત છે.');
      return;
    }
    const tradeToDelete = hierarchy.find((t) => t.id === tradeId);
    if (!tradeToDelete) return;

    const traineeCount = effectiveTrainees.filter((tr) => doesTradeMatch(tr.trade, tradeToDelete.name)).length;
    if (traineeCount > 0) {
      alert(`આ ટ્રેડમાં ${traineeCount} તાલીમાર્થીઓ જોડાયેલા છે. પ્રથમ તેમને અન્ય ટ્રેડમાં ખસેડો.`);
      return;
    }

    if (window.confirm(`શું આપ ખરેખર ટ્રેડ "${tradeToDelete.name}" ડિલીટ કરવા માંગો છો?`)) {
      const next = hierarchy.filter((t) => t.id !== tradeId);
      setActiveTradeId(next[0].id);
      setActiveBatchId(next[0].batches[0]?.id || '');
      persistHierarchy(next, `ટ્રેડ "${tradeToDelete.name}" ડિલીટ કરવામાં આવ્યો.`);
    }
  };

  // Add Batch under active trade
  const handleAddBatch = (tradeId: string) => {
    if (!newBatchName.trim()) return;
    const updated = hierarchy.map((trade) => {
      if (trade.id !== tradeId) return trade;
      const newBatch: AcademicBatch = {
        id: `batch-${Date.now()}`,
        name: newBatchName.trim(),
        units: [{ id: `unit-${Date.now()}`, name: 'Unit A' }],
      };
      return {
        ...trade,
        batches: [...trade.batches, newBatch],
      };
    });
    setNewBatchName('૨૦૨૫–૨૦૨૬');
    setIsAddingBatch(false);
    persistHierarchy(updated, `નવી બેચ "${newBatchName}" ઉમેરાઈ.`);
  };

  // Delete Batch
  const handleDeleteBatch = (tradeId: string, batchId: string) => {
    const trade = hierarchy.find((t) => t.id === tradeId);
    if (!trade || trade.batches.length <= 1) {
      alert('ઓછામાં ઓછી એક બેચ હોવી જરૂરી છે.');
      return;
    }
    const batchToDelete = trade.batches.find((b) => b.id === batchId);
    if (!batchToDelete) return;

    const traineeCount = effectiveTrainees.filter(
      (tr) => doesTradeMatch(tr.trade, trade.name) && doesBatchMatch(tr.batch, batchToDelete.name)
    ).length;

    if (traineeCount > 0) {
      alert(`આ બેચમાં ${traineeCount} તાલીમાર્થીઓ જોડાયેલા છે. પ્રથમ તેમને અન્ય બેચમાં ખસેડો.`);
      return;
    }

    if (window.confirm(`શું આપ બેચ "${batchToDelete.name}" ડિલીટ કરવા માંગો છો?`)) {
      const updated = hierarchy.map((t) => {
        if (t.id !== tradeId) return t;
        return {
          ...t,
          batches: t.batches.filter((b) => b.id !== batchId),
        };
      });
      persistHierarchy(updated, `બેચ "${batchToDelete.name}" ડિલીટ થઈ.`);
    }
  };

  // Add Unit under active batch
  const handleAddUnit = (tradeId: string, batchId: string) => {
    if (!newUnitName.trim()) return;
    const updated = hierarchy.map((trade) => {
      if (trade.id !== tradeId) return trade;
      return {
        ...trade,
        batches: trade.batches.map((batch) => {
          if (batch.id !== batchId) return batch;
          const newUnit: AcademicUnit = {
            id: `unit-${Date.now()}`,
            name: newUnitName.trim(),
          };
          return {
            ...batch,
            units: [...batch.units, newUnit],
          };
        }),
      };
    });
    setNewUnitName('Unit B');
    setIsAddingUnit(false);
    persistHierarchy(updated, `યુનિટ "${newUnitName}" ઉમેરાયું.`);
  };

  // Delete Unit
  const handleDeleteUnit = (tradeId: string, batchId: string, unitId: string) => {
    const trade = hierarchy.find((t) => t.id === tradeId);
    const batch = trade?.batches.find((b) => b.id === batchId);
    if (!batch || batch.units.length <= 1) {
      alert('ઓછામાં ઓછું એક યુનિટ હોવું જરૂરી છે.');
      return;
    }
    const unitToDelete = batch.units.find((u) => u.id === unitId);
    if (!unitToDelete) return;

    const traineeCount = effectiveTrainees.filter(
      (tr) =>
        doesTradeMatch(tr.trade, trade.name) &&
        doesBatchMatch(tr.batch, batch.name) &&
        doesUnitMatch(tr.unit, unitToDelete.name)
    ).length;

    if (traineeCount > 0) {
      alert(`આ યુનિટમાં ${traineeCount} તાલીમાર્થીઓ નોંધાયેલા છે. પ્રથમ તેમને અન્ય યુનિટમાં ખસેડો.`);
      return;
    }

    if (window.confirm(`શું આપ "${unitToDelete.name}" ડિલીટ કરવા માંગો છો?`)) {
      const updated = hierarchy.map((t) => {
        if (t.id !== tradeId) return t;
        return {
          ...t,
          batches: t.batches.map((b) => {
            if (b.id !== batchId) return b;
            return {
              ...b,
              units: b.units.filter((u) => u.id !== unitId),
            };
          }),
        };
      });
      persistHierarchy(updated, `યુનિટ "${unitToDelete.name}" ડિલીટ થયું.`);
    }
  };

  // Open Quick Assign Modal
  const openAssignModal = (unitName: string) => {
    if (!currentTrade || !currentBatch) return;
    setAssignModalUnit({
      tradeName: currentTrade.name,
      batchName: currentBatch.name,
      unitName,
    });
    setSelectedTraineesToAssign([]);
    setAssignSearchQuery('');
    setAssignFilterTab('unassigned');
  };

  // Submit Quick Assignment
  const handleConfirmAssignment = async () => {
    if (!assignModalUnit || selectedTraineesToAssign.length === 0) return;
    setIsAssigning(true);
    try {
      if (onAssignTraineesToUnit) {
        await onAssignTraineesToUnit(
          selectedTraineesToAssign,
          assignModalUnit.tradeName,
          assignModalUnit.batchName,
          assignModalUnit.unitName
        );
      }
      setStatusMsg({
        type: 'success',
        text: `સફળ! ${selectedTraineesToAssign.length} તાલીમાર્થીઓ "${assignModalUnit.unitName}" માં સોંપાયા છે.`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
      setAssignModalUnit(null);
    } catch (err) {
      console.error(err);
      alert('વિદ્યાર્થીઓ સોંપવામાં ભૂલ આવી.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Candidate trainees for assignment modal
  const getCandidateTrainees = () => {
    return effectiveTrainees.filter((t) => {
      const isUnassigned = !t.trade?.trim() || !t.batch?.trim() || !t.unit?.trim();
      if (assignFilterTab === 'unassigned') {
        if (!isUnassigned) return false;
      } else if (assignFilterTab === 'trade') {
        if (assignModalUnit && !doesTradeMatch(t.trade, assignModalUnit.tradeName)) {
          return false;
        }
      }

      if (!assignSearchQuery.trim()) return true;
      const q = assignSearchQuery.toLowerCase().trim();
      return (
        t.student_name?.toLowerCase().includes(q) ||
        t.surname?.toLowerCase().includes(q) ||
        t.student_name_en?.toLowerCase().includes(q) ||
        t.surname_en?.toLowerCase().includes(q) ||
        t.enrollment_no?.toLowerCase().includes(q) ||
        t.roll_no?.toString().includes(q)
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#264e2b] to-slate-950 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-6 h-6 text-[#f2edc2]" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              શૈક્ષણિક માળખું વ્યવસ્થાપન (Trade → Batch → Unit)
            </h2>
          </div>
          <p className="text-xs text-emerald-100/90">
            ટ્રેડ, બેચ અને યુનિટ મુજબ તાલીમાર્થીઓની સાચી સંખ્યાની ગણતરી અને વિદ્યાર્થીઓનું સીધું વિભાજન.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTrade(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#f2edc2] text-[#264e2b] hover:bg-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>નવો ટ્રેડ ઉમેરો (Add Trade)</span>
        </button>
      </div>

      {/* Global Trainees Count Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Trainees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">કુલ તાલીમાર્થીઓ</div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {totalTraineesCount}
            </div>
            <div className="text-[10px] text-slate-400">સંસ્થાના કુલ રજીસ્ટર્ડ</div>
          </div>
        </div>

        {/* Metric 2: Selected Trade Trainees */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 truncate">
              ટ્રેડ: {currentTrade?.name || '—'}
            </div>
            <div className="text-xl font-black text-emerald-700 leading-tight">
              {currentTradeTrainees.length}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium truncate">
              {currentTrade?.batches.length || 0} બેચ ઉપલબ્ધ
            </div>
          </div>
        </div>

        {/* Metric 3: Selected Batch Trainees */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-500 truncate">
              બેચ: {currentBatch?.name || '—'}
            </div>
            <div className="text-xl font-black text-purple-700 leading-tight">
              {currentBatchTrainees.length}
            </div>
            <div className="text-[10px] text-purple-600 font-medium truncate">
              {currentBatch?.units.length || 0} યુનિટ્સ
            </div>
          </div>
        </div>

        {/* Metric 4: Assigned vs Unassigned Health */}
        <div className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 ${
          unassignedCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            unassignedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {unassignedCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">અપૂર્ણ વિગતો</div>
            <div className="text-xl font-black text-amber-900 leading-tight">
              {unassignedCount} <span className="text-xs font-normal text-slate-500">બાકી</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {fullyAssignedCount} સંપૂર્ણ સોંપાયેલ
            </div>
          </div>
        </div>
      </div>

      {/* Status Notice */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Add Trade Form Modal / Inline Box */}
      {isAddingTrade && (
        <div className="p-4 bg-white rounded-2xl border-2 border-[#346739] shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#346739]" />
              <span>નવો ટ્રેડ (Trade) ઉમેરો</span>
            </h4>
            <button
              onClick={() => setIsAddingTrade(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              રદ કરો
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ટ્રેડનું નામ (Trade Name)
            </label>
            <input
              type="text"
              value={newTradeName}
              onChange={(e) => setNewTradeName(e.target.value)}
              placeholder="દા.ત. કોપા (COPA) અથવા ઇલેક્ટ્રિશિયન (Electrician)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-semibold">ઝડપી પસંદગી:</span>
            {PRESET_TRADES.slice(0, 5).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNewTradeName(preset)}
                className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingTrade(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              રદ કરો
            </button>
            <button
              onClick={handleAddTrade}
              className="px-4 py-1.5 text-xs font-bold bg-[#346739] text-[#f2edc2] rounded-lg shadow-xs"
            >
              સેવ કરો
            </button>
          </div>
        </div>
      )}

      {/* Main Hierarchy Tree Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Trades Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#346739] font-black text-xs flex items-center justify-center">
                ૧
              </span>
              <h3 className="font-bold text-sm text-slate-900">ટ્રેડ પસંદ કરો (Trades)</h3>
            </div>
            <button
              onClick={() => setIsAddingTrade(true)}
              className="p-1.5 text-[#346739] hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ઉમેરો</span>
            </button>
          </div>

          <div className="space-y-2">
            {hierarchy.map((trade) => {
              const isSelected = trade.id === (currentTrade?.id || '');
              const tradeTrainees = effectiveTrainees.filter((tr) => doesTradeMatch(tr.trade, trade.name));

              return (
                <div
                  key={trade.id}
                  onClick={() => {
                    setActiveTradeId(trade.id);
                    setActiveBatchId(trade.batches[0]?.id || '');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-[#346739] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{trade.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{trade.batches.length} બેચ</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded-full text-[10px]">
                        {tradeTrainees.length} તાલીમાર્થીઓ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrade(trade.id);
                      }}
                      title="ટ્રેડ ડિલીટ કરો"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && <ArrowRight className="w-4 h-4 text-[#346739]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Batches Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#346739] font-black text-xs flex items-center justify-center">
                ૨
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">બેચ પસંદ કરો (Batches)</h3>
                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {currentTrade?.name}
                </div>
              </div>
            </div>

            {currentTrade && (
              <button
                onClick={() => setIsAddingBatch(true)}
                className="p-1.5 text-[#346739] hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>બેચ ઉમેરો</span>
              </button>
            )}
          </div>

          {/* Add Batch Form */}
          {isAddingBatch && currentTrade && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">નવી બેચ ઉમેરો</span>
                <button
                  onClick={() => setIsAddingBatch(false)}
                  className="text-[11px] text-slate-500"
                >
                  રદ
                </button>
              </div>
              <input
                type="text"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                placeholder="દા.ત. ૨૦૨૫–૨૦૨૬"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {PRESET_BATCHES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setNewBatchName(b)}
                    className="px-1.5 py-0.5 text-[9px] bg-slate-200 hover:bg-slate-300 rounded"
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setIsAddingBatch(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-600 rounded"
                >
                  રદ
                </button>
                <button
                  onClick={() => handleAddBatch(currentTrade.id)}
                  className="px-3 py-1 text-[11px] font-bold bg-[#346739] text-white rounded"
                >
                  ઉમેરો
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {currentTrade?.batches.map((batch) => {
              const isSelected = batch.id === (currentBatch?.id || '');
              const batchTrainees = effectiveTrainees.filter(
                (tr) =>
                  doesTradeMatch(tr.trade, currentTrade.name) &&
                  doesBatchMatch(tr.batch, batch.name)
              );

              return (
                <div
                  key={batch.id}
                  onClick={() => setActiveBatchId(batch.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-[#346739] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{batch.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{batch.units.length} યુનિટ્સ</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-purple-800 bg-purple-100/80 px-1.5 py-0.2 rounded-full text-[10px]">
                        {batchTrainees.length} તાલીમાર્થીઓ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBatch(currentTrade.id, batch.id);
                      }}
                      title="બેચ ડિલીટ કરો"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && <ArrowRight className="w-4 h-4 text-[#346739]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Units Column with Accurate Trainee Counting & Direct Assignment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#346739] font-black text-xs flex items-center justify-center">
                ૩
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">યુનિટ વ્યવસ્થાપન (Units)</h3>
                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {currentBatch?.name}
                </div>
              </div>
            </div>

            {currentBatch && (
              <button
                onClick={() => setIsAddingUnit(true)}
                className="p-1.5 text-[#346739] hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>યુનિટ ઉમેરો</span>
              </button>
            )}
          </div>

          {/* Add Unit Form */}
          {isAddingUnit && currentTrade && currentBatch && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">નવું યુનિટ ઉમેરો</span>
                <button
                  onClick={() => setIsAddingUnit(false)}
                  className="text-[11px] text-slate-500"
                >
                  રદ
                </button>
              </div>
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="દા.ત. Unit A અથવા યુનિટ ૧"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {PRESET_UNITS.map((u) => (
                  <button
                    key={u}
                    onClick={() => setNewUnitName(u)}
                    className="px-1.5 py-0.5 text-[9px] bg-slate-200 hover:bg-slate-300 rounded"
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setIsAddingUnit(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-600 rounded"
                >
                  રદ
                </button>
                <button
                  onClick={() => handleAddUnit(currentTrade.id, currentBatch.id)}
                  className="px-3 py-1 text-[11px] font-bold bg-[#346739] text-white rounded"
                >
                  ઉમેરો
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {currentBatch?.units.map((unit) => {
              // Accurate trainee counting per unit with smart matching
              const unitTrainees = effectiveTrainees.filter(
                (tr) =>
                  doesTradeMatch(tr.trade, currentTrade.name) &&
                  doesBatchMatch(tr.batch, currentBatch.name) &&
                  doesUnitMatch(tr.unit, unit.name)
              );

              const isExpanded = expandedUnitId === unit.id;

              return (
                <div
                  key={unit.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#346739] transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{unit.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            unitTrainees.length > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {unitTrainees.length} તાલીમાર્થીઓ
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {unitTrainees.length > 0
                          ? `કુલ ${unitTrainees.length} તાલીમાર્થીઓ સફળતાપૂર્વક નોંધાયેલા છે.`
                          : 'કોઈ તાલીમાર્થી સોંપાયેલ નથી.'}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDeleteUnit(currentTrade.id, currentBatch.id, unit.id)
                      }
                      title="યુનિટ ડિલીટ કરો"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions Bar for this Unit */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {unitTrainees.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          {isExpanded ? (
                            <>
                              <span>છુપાવો</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>વિદ્યાર્થીઓ જુઓ ({unitTrainees.length})</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">ખાલી યુનિટ</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct Assign Students Button */}
                      <button
                        type="button"
                        onClick={() => openAssignModal(unit.name)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                        title="વિદ્યાર્થીઓ પસંદ કરીને આ યુનિટમાં સીધા સોંપો"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>+ સોંપો</span>
                      </button>

                      {/* Navigate to Trainee Manager */}
                      <button
                        type="button"
                        onClick={() =>
                          onNavigateToTrainees(
                            currentTrade.name,
                            currentBatch.name,
                            unit.name
                          )
                        }
                        className="flex items-center gap-1 text-[11px] font-bold text-[#346739] hover:text-[#264e2b]"
                        title="આ ફિલ્ટર સાથે તાલીમાર્થી ટેબ ખોલો"
                      >
                        <span>મેનેજ કરો</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Trainees List Drawer */}
                  {isExpanded && unitTrainees.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 max-h-48 overflow-y-auto space-y-1.5 pr-1 animate-in fade-in duration-150">
                      {unitTrainees.map((tr) => (
                        <div
                          key={tr.id}
                          className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {tr.roll_no}. {tr.student_name} {tr.surname}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Enroll: {tr.enrollment_no}
                            </div>
                          </div>
                          {tr.mobile && (
                            <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 shrink-0 ml-2">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{tr.mobile}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Assign Students Modal */}
      {assignModalUnit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#346739]" />
                  <span>યુનિટમાં તાલીમાર્થીઓ સોંપો (Assign Students)</span>
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  ટાર્ગેટ: <span className="font-bold text-[#346739]">{assignModalUnit.tradeName}</span> &gt;{' '}
                  <span className="font-bold text-purple-700">{assignModalUnit.batchName}</span> &gt;{' '}
                  <span className="font-bold text-blue-700">{assignModalUnit.unitName}</span>
                </div>
              </div>
              <button
                onClick={() => setAssignModalUnit(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAssignFilterTab('unassigned')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    assignFilterTab === 'unassigned'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  બાકી/અપૂર્ણ ({unassignedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignFilterTab('trade')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    assignFilterTab === 'trade'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  આ ટ્રેડના ({currentTradeTrainees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignFilterTab('all')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    assignFilterTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  તમામ ({totalTraineesCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assignSearchQuery}
                  onChange={(e) => setAssignSearchQuery(e.target.value)}
                  placeholder="નામ, રોલ નંબર અથવા એનરોલમેન્ટથી શોધો..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#346739]"
                />
              </div>

              {/* Select All / Deselect All */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">
                  પસંદ કરેલ: <strong className="text-slate-900">{selectedTraineesToAssign.length}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const candidates = getCandidateTrainees();
                      setSelectedTraineesToAssign(candidates.map((c) => c.id));
                    }}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    બધા પસંદ
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTraineesToAssign([])}
                    className="text-slate-500 hover:underline"
                  >
                    રદ
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates Checklist */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-72">
              {getCandidateTrainees().length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  કોઈ તાલીમાર્થી મળ્યા નથી.
                </div>
              ) : (
                getCandidateTrainees().map((tr) => {
                  const isChecked = selectedTraineesToAssign.includes(tr.id);
                  const isAlreadyInTargetUnit =
                    doesTradeMatch(tr.trade, assignModalUnit.tradeName) &&
                    doesBatchMatch(tr.batch, assignModalUnit.batchName) &&
                    doesUnitMatch(tr.unit, assignModalUnit.unitName);

                  return (
                    <div
                      key={tr.id}
                      onClick={() => {
                        setSelectedTraineesToAssign((prev) =>
                          prev.includes(tr.id)
                            ? prev.filter((id) => id !== tr.id)
                            : [...prev, tr.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isChecked
                          ? 'bg-emerald-50 border-[#346739]'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#346739] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {tr.roll_no}. {tr.student_name} {tr.surname}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            હાલમાં: {tr.trade || 'કોઈ ટ્રેડ નહિ'} | {tr.unit || 'કોઈ યુનિટ નહિ'}
                          </div>
                        </div>
                      </div>

                      {isAlreadyInTargetUnit ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                          પહેલેથી આ યુનિટમાં
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {tr.enrollment_no}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAssignModalUnit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                રદ કરો
              </button>

              <button
                type="button"
                disabled={selectedTraineesToAssign.length === 0 || isAssigning}
                onClick={handleConfirmAssignment}
                className="px-5 py-2 text-xs font-bold bg-[#346739] text-[#f2edc2] hover:bg-[#264e2b] rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {isAssigning
                    ? 'સોંપાઈ રહ્યું છે...'
                    : `પસંદ કરેલ (${selectedTraineesToAssign.length}) તાલીમાર્થીઓ "${assignModalUnit.unitName}" માં સોંપો`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
