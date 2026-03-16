import { useCallback, useEffect, useState } from 'react';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { EmployeesTable } from './components/EmployeesTable';
import { PayslipGenerator } from '../pages/PayslipGenerator';
import type { CreateEmployeeInput, Employee } from '@shared/types/employee';
import type { GeneratePayslipInput } from '@shared/types/payslip';

type TabKey = 'employees' | 'payslip';

const getPayrollApi = () => {
  if (!window.payrollApi) {
    throw new Error('Electron preload API is unavailable. Restart the desktop app.');
  }
  return window.payrollApi;
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPayrollApi().getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  const handleSaveEmployee = async (payload: CreateEmployeeInput) => {
    await getPayrollApi().createEmployee(payload);
    await fetchEmployees();
  };

  const handleGeneratePayslip = async (payload: GeneratePayslipInput) => {
    await getPayrollApi().generatePayslipPDF(payload);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-sidebar px-5 py-6 text-slate-100 shadow-lg">
        <div className="mb-10 rounded-lg border border-slate-600/60 bg-slate-700/40 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-300">Company</p>
          <p className="mt-1 text-sm font-semibold">Logo Placeholder</p>
        </div>

        <nav className="space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
              activeTab === 'employees'
                ? 'bg-slate-100/10 text-white ring-1 ring-blue-400'
                : 'text-slate-300 hover:bg-slate-100/5 hover:text-white'
            }`}
          >
            Employees
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payslip')}
            className={`flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
              activeTab === 'payslip'
                ? 'bg-slate-100/10 text-white ring-1 ring-blue-400'
                : 'text-slate-300 hover:bg-slate-100/5 hover:text-white'
            }`}
          >
            Payslip Generator
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-7">
        {activeTab === 'employees' ? (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Employee Overview</h1>
              <p className="mt-1 text-sm text-slate-500">Manage your workforce records</p>
            </header>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Add Employee
                </button>
              </div>

              {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
              {loading ? (
                <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
                  Loading employees...
                </div>
              ) : (
                <EmployeesTable employees={employees} />
              )}
            </section>
          </>
        ) : (
          <PayslipGenerator
            employees={employees}
            loading={loading}
            error={error}
            onGeneratePayslip={handleGeneratePayslip}
          />
        )}
      </main>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};

export default App;

