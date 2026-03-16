import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type { CreateEmployeeInput, EmployeeStatus } from '@shared/types/employee';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateEmployeeInput) => Promise<void>;
}

interface FormState {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinDate: string;
  basicSalary: string;
  status: EmployeeStatus;
}

const initialState: FormState = {
  employeeCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joinDate: '',
  basicSalary: '',
  status: 'Active'
};

export const AddEmployeeModal = ({ isOpen, onClose, onSave }: AddEmployeeModalProps) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(
    () => form.employeeCode.trim() && form.fullName.trim() && form.email.trim(),
    [form.employeeCode, form.fullName, form.email]
  );

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeModal = () => {
    if (saving) return;
    setForm(initialState);
    setError('');
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setError('Employee Code, Full Name, and Email are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        employeeCode: form.employeeCode,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        joinDate: form.joinDate,
        basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
        status: form.status
      });

      setForm(initialState);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Add Employee</h2>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Employee Code *
              <input
                value={form.employeeCode}
                onChange={(e) => update('employeeCode', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Full Name *
              <input
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email *
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Department
              <input
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Designation
              <input
                value={form.designation}
                onChange={(e) => update('designation', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Join Date
              <input
                type="date"
                value={form.joinDate}
                onChange={(e) => update('joinDate', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Basic Salary
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.basicSalary}
                onChange={(e) => update('basicSalary', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Status
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as EmployeeStatus)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

