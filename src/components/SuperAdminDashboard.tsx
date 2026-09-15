import { useState } from 'react';
import { Instructor, Trainee, AttendanceRecord, DispatchLog } from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  Send,
  Server,
  Sparkles,
  CheckCircle2,
  Check,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  instructors: Instructor[];
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  dispatchLogs: DispatchLog[];
  onSelectTenant: (id: string) => void;
}

export default function SuperAdminDashboard({
  instructors,
  trainees,
  attendanceRecords,
  dispatchLogs,
  onSelectTenant,
}: SuperAdminDashboardProps) {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Global Platform Metrics
  const totalTenants = instructors.length;
  const totalTrainees = trainees.length;
  const flaggedAttendanceCount = attendanceRecords.filter((r) => r.attendance_percentage < 80.0).length;
  const totalDispatches = dispatchLogs.length;

  const testGeminiConnection = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const resp = await fetch('/api/gemini/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: 'ટેસ્ટ વિદ્યાર્થી',
          presentDays: 10,
          absentDays: 14,
          totalWorkingDays: 24,
          attendancePercentage: 41.67,
          language: 'Gujarati',
        }),
      });
      const data = await resp.json();
      setTestResult(`Success: Generated advisory from ${data.source}: "${data.commentary.substring(0, 70)}..."`);
    } catch (e: any) {
      setTestResult(`Error: ${e.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold tracking-tight">
              Super Admin & System Oversight Console
            </h2>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Tenant Orchestration
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Multi-Tenant Isolation Verification • Indic Text Shaping (HarfBuzz) • Gemini AI Server Engine
          </p>
        </div>

        <button
          onClick={testGeminiConnection}
          disabled={isTestingAi}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isTestingAi ? 'Pinging Gemini API...' : 'Ping Gemini 3.8 Flash'}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Global System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Registered Instructors</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTenants}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active Tenant Environments</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Enrolled Trainees</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTrainees}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all ITI trades</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium mb-1">
            <span>Flagged Irregular (&lt;80%)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700">{flaggedAttendanceCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Require irregularity letters</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1">
            <span>Total Dispatches Recorded</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{totalDispatches}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Official Outward Entries</div>
        </div>
      </div>

      {/* Tenant Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900">
            Tenant Directory & Data Isolation Status
          </div>
          <span className="text-xs text-slate-500">
            Enforces strict <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">WHERE instructor_id = ?</code> isolation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Instructor (Tenant)</th>
                <th className="py-3 px-4">ITI Institute</th>
                <th className="py-3 px-4">Trade & Unit</th>
                <th className="py-3 px-4 text-center">Trainees</th>
                <th className="py-3 px-4 text-center">Low Attendance (&lt;80%)</th>
                <th className="py-3 px-4 text-center">Outwards</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instructors.map((inst) => {
                const instTrainees = trainees.filter((t) => t.instructor_id === inst.id);
                const traineeIds = new Set(instTrainees.map((t) => t.id));
                const instFlagged = attendanceRecords.filter(
                  (r) => traineeIds.has(r.trainee_id) && r.attendance_percentage < 80.0
                ).length;
                const instDispatches = dispatchLogs.filter((l) => l.instructor_id === inst.id).length;

                return (
                  <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{inst.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{inst.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{inst.iti_name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {inst.trade} • {inst.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {instTrainees.length}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">
                      {instFlagged}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {instDispatches}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectTenant(inst.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                      >
                        <span>Impersonate Tenant</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Engine Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Server className="w-4 h-4 text-blue-700" />
            <span>Indic Font Rendering & Shaping Status</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The application embeds <strong>Noto Sans Gujarati</strong> and <strong>Noto Sans Devanagari</strong> to guarantee Indic glyph and conjunct rendering without broken matras or question-mark boxes.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-serif text-slate-800 space-y-1">
            <div>
              <strong>Gujarati Conjunct Test:</strong> શ્રી સરકારી ઔદ્યોગિક તાલીમ સંસ્થા - વિદ્યાનગર
            </div>
            <div>
              <strong>Hindi Conjunct Test:</strong> राजकीय औद्योगिक प्रशिक्षण संस्थान - प्रपत्र
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Multi-Tenant Architecture Specification</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>
              <strong>Tenant Partitioning:</strong> All SQL queries and storage operations strictly filter on <code className="bg-slate-100 px-1 rounded text-slate-800">instructor_id</code>.
            </li>
            <li>
              <strong>A4 Page-Break Engine:</strong> In batch export, each letter has CSS <code className="bg-slate-100 px-1 rounded text-slate-800">break-after: page;</code> ensuring multi-page PDF output.
            </li>
            <li>
              <strong>Audit Trail:</strong> Outward references use <code className="bg-slate-100 px-1 rounded text-slate-800">ITI/{'{TRADE}'}/{'{YEAR}'}/IRR/{'{MONTH}'}-{'{ROLL}'}</code> pattern.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
