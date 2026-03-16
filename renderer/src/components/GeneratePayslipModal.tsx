import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type { Employee } from '@shared/types/employee';
import { MONTHS, type GeneratePayslipInput, type PayslipMonth } from '@shared/types/payslip';

interface GeneratePayslipModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: GeneratePayslipInput) => Promise<void>;
}

interface FormState {
  month: PayslipMonth;
  year: string;
  allowances: string;
  bonus: string;
  deductions: string;
  tax: string;
}

const initialState: FormState = {
  month: MONTHS[new Date().getMonth()],
  year: String(new Date().getFullYear()),
  allowances: '0',
  bonus: '0',
  deductions: '0',
  tax: '0'
};

const parseAmount = (value: string): number => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const GeneratePayslipModal = ({
  employee,
  isOpen,
  onClose,
  onGenerate
}: GeneratePayslipModalProps) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const basicSalary = employee?.basicSalary ?? 0;
  const netSalary = useMemo(() => {
    return (
      basicSalary +
      parseAmount(form.allowances) +
      parseAmount(form.bonus) -
      parseAmount(form.deductions) -
      parseAmount(form.tax)
    );
  }, [basicSalary, form.allowances, form.bonus, form.deductions, form.tax]);

  const close = () => {
    if (submitting) return;
    setError('');
    setForm(initialState);
    onClose();
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employee) {
      setError('Employee is required.');
      return;
    }
    if (!/^\d{4}$/.test(form.year)) {
      setError('Year must be 4 digits.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onGenerate({
        employeeId: employee.id,
        month: form.month,
        year: form.year,
        allowances: parseAmount(form.allowances),
        bonus: parseAmount(form.bonus),
        deductions: parseAmount(form.deductions),
        tax: parseAmount(form.tax)
      });
      setForm(initialState);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payslip.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !employee) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Generate Payslip</h2>
          <p className="mt-1 text-sm text-slate-500">{employee.fullName} ({employee.employeeCode})</p>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Basic Salary:</span>{' '}
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(basicSalary)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {employee.designation || '-'} | {employee.department || '-'}
              </p>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Month
              <select
                value={form.month}
                onChange={(e) => update('month', e.target.value as PayslipMonth)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Year
              <input
                type="number"
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Allowances
              <input
                type="number"
                step="0.01"
                value={form.allowances}
                onChange={(e) => update('allowances', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Bonus
              <input
                type="number"
                step="0.01"
                value={form.bonus}
                onChange={(e) => update('bonus', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Deductions
              <input
                type="number"
                step="0.01"
                value={form.deductions}
                onChange={(e) => update('deductions', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Tax
              <input
                type="number"
                step="0.01"
                value={form.tax}
                onChange={(e) => update('tax', e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 md:col-span-2">
              <p className="text-sm font-semibold text-emerald-700">
                Net Salary:{' '}
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netSalary)}
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={close}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
