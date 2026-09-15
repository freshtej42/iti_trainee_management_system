import { useState, FormEvent } from 'react';
import { Instructor } from '../types';
import { Building2, Plus, Check, X, ShieldCheck } from 'lucide-react';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructors: Instructor[];
  currentInstructorId: string;
  onSelectInstructor: (id: string) => void;
  onAddInstructor: (instructor: Omit<Instructor, 'id' | 'created_at'>) => void;
}

export default function TenantModal({
  isOpen,
  onClose,
  instructors,
  currentInstructorId,
  onSelectInstructor,
  onAddInstructor,
}: TenantModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    email: '',
    password: '',
    iti_name: 'Government ITI ',
    trade: 'Fitter',
    batch: '2025–2026',
    unit: 'Unit 1',
    designation: 'Supervisor Instructor',
    phone: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.iti_name) return;
    const finalUserId = formData.user_id.trim() || formData.email.split('@')[0] || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    onAddInstructor({
      ...formData,
      user_id: finalUserId,
      username: finalUserId,
      password: formData.password || 'iti123',
      email_verified: true,
    });
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Multi-Tenant Instructor Selection</h3>
              <p className="text-xs text-slate-500">Each instructor's trainees and notices are strictly isolated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!showAddForm ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered ITI Instructors (Tenants)
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Instructor</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {instructors.map((inst) => {
                  const isSelected = inst.id === currentInstructorId;
                  return (
                    <div
                      key={inst.id}
                      onClick={() => {
                        onSelectInstructor(inst.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{inst.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                            {inst.trade} - {inst.unit}
                          </span>
                          {inst.email_verified ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              Verification Pending
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-700">{inst.iti_name}</div>
                        <div className="text-[11px] text-slate-500">
                          Login ID: <span className="font-mono font-semibold text-blue-700">{inst.email}</span> • Batch: {inst.batch} • {inst.designation}
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-full border border-blue-200 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-md">
                          Switch
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Tenant Data Isolation Enforced:</strong> All trainee demographics, monthly attendance marks, letterhead customizations, and dispatch outward logs belong exclusively to the selected instructor.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="text-sm font-bold text-slate-800 mb-2">Register Instructor Profile & Scope</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Instructor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="r.patel@gujarat.iti.gov.in"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">User ID / Username</label>
                  <input
                    type="text"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="e.g. ramesh.patel"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Default: iti123"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ITI Institute Name *</label>
                <input
                  type="text"
                  required
                  value={formData.iti_name}
                  onChange={(e) => setFormData({ ...formData, iti_name: e.target.value })}
                  placeholder="Government ITI Rajkot"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Trade *</label>
                  <select
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Fitter">Fitter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="COPA">COPA</option>
                    <option value="Welder">Welder</option>
                    <option value="Turner">Turner</option>
                    <option value="Diesel Mechanic">Diesel Mechanic</option>
                    <option value="Machinist">Machinist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Unit 1"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Batch Year *</label>
                  <input
                    type="text"
                    required
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="2025–2026"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Supervisor Instructor"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98250 12345"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  Create Instructor Tenant
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
