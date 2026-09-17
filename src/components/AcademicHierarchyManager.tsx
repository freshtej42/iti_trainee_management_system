import React, { useState } from 'react';
import { Instructor, Trainee, AcademicTrade, AcademicBatch, AcademicUnit } from '../types';
import {
  Layers,
  FolderPlus,
  PlusCircle,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AcademicHierarchyManagerProps {
  instructor: Instructor;
  trainees: Trainee[];
  onUpdateInstructor: (instructor: Instructor) => void;
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

export default function AcademicHierarchyManager({
  instructor,
  trainees,
  onUpdateInstructor,
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

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper to persist hierarchy
  const persistHierarchy = (updated: AcademicTrade[], msg: string) => {
    setHierarchy(updated);

    // Also derive flat list of trades, batches, units for backward compatibility
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

    // Check if trainees exist in this trade
    const traineeCount = trainees.filter((tr) => tr.trade === tradeToDelete.name).length;
    if (traineeCount > 0) {
      alert(`આ ટ્રેડમાં ${traineeCount} તાલીમાર્થીઓ નોંધાયેલા છે. પ્રથમ તેમને અન્ય ટ્રેડમાં ખસેડો અથવા ડિલીટ કરો.`);
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
    if (!trade) return;
    if (trade.batches.length <= 1) {
      alert('ઓછામાં ઓછી એક બેચ હોવી ફરજિયાત છે.');
      return;
    }
    const batchToDelete = trade.batches.find((b) => b.id === batchId);
    if (!batchToDelete) return;

    // Check trainees
    const traineeCount = trainees.filter(
      (tr) => tr.trade === trade.name && tr.batch === batchToDelete.name
    ).length;
    if (traineeCount > 0) {
      alert(`આ બેચમાં ${traineeCount} તાલીમાર્થીઓ નોંધાયેલા છે.`);
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

    const traineeCount = trainees.filter(
      (tr) =>
        tr.trade === trade.name &&
        tr.batch === batch.name &&
        tr.unit === unitToDelete.name
    ).length;

    if (traineeCount > 0) {
      alert(`આ યુનિટમાં ${traineeCount} તાલીમાર્થીઓ નોંધાયેલા છે. પ્રથમ તેમને ખસેડો.`);
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

  const currentTrade = hierarchy.find((t) => t.id === activeTradeId) || hierarchy[0];
  const currentBatch = currentTrade?.batches.find((b) => b.id === activeBatchId) || currentTrade?.batches[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#346739] to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-6 h-6 text-[#f2edc2]" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              શૈક્ષણિક માળખું વ્યવસ્થાપન (Trade → Batch → Unit)
            </h2>
          </div>
          <p className="text-xs text-emerald-100">
            વિદ્યાર્થીઓ ઉમેરતા પહેલાં ટ્રેડ (Trade), ત્યારબાદ બેચ (Batch) અને છેલ્લે યુનિટ (Unit) રચવું અનિવાર્ય છે.
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

      {/* Status Notice */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
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
              const tradeTraineesCount = trainees.filter((tr) => tr.trade === trade.name).length;

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
                  <div>
                    <div className="font-bold text-xs text-slate-900">{trade.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {trade.batches.length} બેચ | {tradeTraineesCount} તાલીમાર્થી
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
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
                <div className="text-[10px] text-slate-500">{currentTrade?.name} હેઠળ</div>
              </div>
            </div>

            <button
              onClick={() => setIsAddingBatch(true)}
              className="p-1.5 text-[#346739] hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ઉમેરો</span>
            </button>
          </div>

          {/* Add Batch Box */}
          {isAddingBatch && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">નવી બેચનું નામ:</label>
              <input
                type="text"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                placeholder="દા.ત. ૨૦૨૫–૨૦૨૬"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {PRESET_BATCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setNewBatchName(b)}
                    className="px-1.5 py-0.5 text-[9px] bg-white border rounded text-slate-700"
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
              const batchTraineesCount = trainees.filter(
                (tr) => tr.trade === currentTrade.name && tr.batch === batch.name
              ).length;

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
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {batch.units.length} યુનિટ્સ | {batchTraineesCount} તાલીમાર્થીઓ
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
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

        {/* Step 3: Units Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#346739] font-black text-xs flex items-center justify-center">
                ૩
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">યુનિટ્સ (Units)</h3>
                <div className="text-[10px] text-slate-500">
                  {currentTrade?.name} &gt; {currentBatch?.name}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddingUnit(true)}
              className="p-1.5 text-[#346739] hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ઉમેરો</span>
            </button>
          </div>

          {/* Add Unit Box */}
          {isAddingUnit && currentBatch && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">નવા યુનિટનું નામ:</label>
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="દા.ત. Unit B અથવા યુનિટ ૨"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {PRESET_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setNewUnitName(u)}
                    className="px-1.5 py-0.5 text-[9px] bg-white border rounded text-slate-700"
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

          <div className="space-y-2">
            {currentBatch?.units.map((unit) => {
              const unitTrainees = trainees.filter(
                (tr) =>
                  tr.trade === currentTrade.name &&
                  tr.batch === currentBatch.name &&
                  tr.unit === unit.name
              );

              return (
                <div
                  key={unit.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#346739] transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{unit.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {unitTrainees.length} તાલીમાર્થીઓ નોંધાયેલા છે
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

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      વિદ્યાર્થી મેનેજમેન્ટ
                    </span>

                    <button
                      onClick={() =>
                        onNavigateToTrainees(
                          currentTrade.name,
                          currentBatch.name,
                          unit.name
                        )
                      }
                      className="flex items-center gap-1 text-xs font-bold text-[#346739] hover:text-[#264e2b]"
                    >
                      <span>આ યુનિટમાં વિદ્યાર્થીઓ ઉમેરો</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
