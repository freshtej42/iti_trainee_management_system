import React, { useState } from 'react';
import {
  Layers,
  X,
  Plus,
  Trash2,
  Check,
  Save,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Instructor } from '../types';

export interface BatchUnitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  onUpdateHierarchy?: (updatedInstructor: Partial<Instructor>) => void;
  onUpdateInstructor?: (updatedInstructor: Instructor) => void;
}

const DEFAULT_UNITS = ['Unit A', 'Unit B', 'Unit C'];

export default function BatchUnitManagerModal({
  isOpen,
  onClose,
  instructor,
  onUpdateHierarchy,
  onUpdateInstructor,
}: BatchUnitManagerModalProps) {
  if (!isOpen) return null;

  const isGuest = Boolean(
    instructor.role === 'guest' ||
    instructor.is_guest ||
    instructor.id === 'guest-demo-instructor'
  );

  // Batches list state
  const [batches, setBatches] = useState<string[]>(() => {
    return instructor.batches && instructor.batches.length > 0
      ? [...instructor.batches]
      : [instructor.batch || '84'];
  });
  const [activeBatch, setActiveBatch] = useState<string>(
    instructor.batch || (batches[0] ?? '84')
  );
  const [newBatchInput, setNewBatchInput] = useState('');

  // Units list state
  const [units, setUnits] = useState<string[]>(() => {
    return instructor.units && instructor.units.length > 0
      ? [...instructor.units]
      : DEFAULT_UNITS;
  });
  const [activeUnit, setActiveUnit] = useState<string>(
    instructor.unit || (units[0] ?? 'Unit A')
  );
  const [newUnitInput, setNewUnitInput] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Batch
  const handleAddBatch = (rawBatch: string) => {
    if (isGuest) return;
    const trimmed = rawBatch.trim();
    if (!trimmed) return;
    if (batches.includes(trimmed)) {
      setToastMessage(`Batch "${trimmed}" already exists.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const updated = [...batches, trimmed];
    setBatches(updated);
    setActiveBatch(trimmed);
    setNewBatchInput('');
  };

  // Remove Batch
  const handleRemoveBatch = (bToRemove: string) => {
    if (isGuest) return;
    if (batches.length <= 1) {
      alert('At least one batch must remain.');
      return;
    }
    const updated = batches.filter((b) => b !== bToRemove);
    setBatches(updated);
    if (activeBatch === bToRemove) {
      setActiveBatch(updated[0]);
    }
  };

  // Toggle Standard Unit
  const handleToggleDefaultUnit = (uName: string) => {
    if (isGuest) return;
    if (units.includes(uName)) {
      if (units.length <= 1) {
        alert('At least one unit must remain.');
        return;
      }
      const updated = units.filter((u) => u !== uName);
      setUnits(updated);
      if (activeUnit === uName) {
        setActiveUnit(updated[0]);
      }
    } else {
      const updated = [...units, uName];
      setUnits(updated);
      setActiveUnit(uName);
    }
  };

  // Add Custom Unit
  const handleAddCustomUnit = () => {
    if (isGuest) return;
    const trimmed = newUnitInput.trim();
    if (!trimmed) return;
    if (units.includes(trimmed)) {
      setToastMessage(`Unit "${trimmed}" already exists.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const updated = [...units, trimmed];
    setUnits(updated);
    setActiveUnit(trimmed);
    setNewUnitInput('');
  };

  // Remove Unit
  const handleRemoveUnit = (uToRemove: string) => {
    if (isGuest) return;
    if (units.length <= 1) {
      alert('At least one unit must remain.');
      return;
    }
    const updated = units.filter((u) => u !== uToRemove);
    setUnits(updated);
    if (activeUnit === uToRemove) {
      setActiveUnit(updated[0]);
    }
  };

  // Save changes
  const handleSave = () => {
    if (isGuest) {
      onClose();
      return;
    }
    const changes = {
      batch: activeBatch,
      batches: batches,
      unit: activeUnit,
      units: units,
    };
    if (onUpdateInstructor) {
      onUpdateInstructor({
        ...instructor,
        ...changes,
      });
    } else if (onUpdateHierarchy) {
      onUpdateHierarchy(changes);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Batch &amp; Unit Management
              </h3>
              <p className="text-xs text-slate-500">
                {instructor.name} • {instructor.trade}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Guest Mode View-Only Banner */}
          {isGuest && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 bg-amber-200 text-amber-900 rounded-md font-bold text-[11px] shrink-0">
                  👁️ View-Only
                </span>
                <span className="font-medium">
                  Guest Demo Mode: Batches and units configuration is protected. Modifications are disabled.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                Locked
              </span>
            </div>
          )}
          {/* Section 1: Batches Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Configured Batches</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Click to select active primary batch
              </span>
            </div>

            {/* List of batches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {batches.map((b) => {
                const isActive = activeBatch === b;
                return (
                  <div
                    key={b}
                    onClick={() => setActiveBatch(b)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          isActive ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isActive && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{b}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    {batches.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBatch(b);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new batch input */}
            <div className="pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBatchInput}
                  onChange={(e) => setNewBatchInput(e.target.value)}
                  placeholder="Enter new batch (e.g. 84, 85, 86)..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBatch(newBatchInput);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddBatch(newBatchInput)}
                  className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
                <span className="font-semibold">Quick batch presets:</span>
                {['84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleAddBatch(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-3">
            {/* Section 2: Units Management (Unit A / B / C) */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Unit Management (Unit A / B / C)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Click to select active primary unit
              </span>
            </div>

            {/* Standard Units Quick Toggle */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700">Standard Units:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {DEFAULT_UNITS.map((uName) => {
                  const isConfigured = units.includes(uName);
                  const isPrimary = activeUnit === uName;
                  return (
                    <button
                      type="button"
                      key={uName}
                      onClick={() => {
                        if (!isConfigured) {
                          handleToggleDefaultUnit(uName);
                        } else {
                          setActiveUnit(uName);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isPrimary
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : isConfigured
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isPrimary ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isConfigured ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{uName}</span>
                      {isPrimary && (
                        <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.2 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Units list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {units.map((u) => {
                const isActive = activeUnit === u;
                return (
                  <div
                    key={u}
                    onClick={() => setActiveUnit(u)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          isActive ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isActive && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{u}</span>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-full font-semibold">
                          Primary
                        </span>
                      )}
                    </div>
                    {units.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUnit(u);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add custom unit input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newUnitInput}
                onChange={(e) => setNewUnitInput(e.target.value)}
                placeholder="Enter custom unit (e.g. Unit D, Shift 1)..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomUnit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomUnit}
                className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            Active: <strong className="text-blue-800">{activeBatch}</strong> • <strong className="text-emerald-800">{activeUnit}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isGuest}
              title={isGuest ? 'Modifications disabled in Demo Mode' : undefined}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 ${
                isGuest
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
