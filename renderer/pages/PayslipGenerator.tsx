import { useMemo, useState } from 'react';
import { GeneratePayslipModal } from '../src/components/GeneratePayslipModal';
import type { Employee } from '@shared/types/employee';
import type { GeneratePayslipInput } from '@shared/types/payslip';

interface PayslipGeneratorProps {
  employees: Employee[];
  loading: boolean;
  error: string;
  onGeneratePayslip: (payload: GeneratePayslipInput) => Promise<void>;
}

export const PayslipGenerator = ({
  employees,
  loading,
  error,
  onGeneratePayslip
}: PayslipGeneratorProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const openModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActionError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleGenerate = async (payload: GeneratePayslipInput) => {
    setActionError('');
    try {
      await onGeneratePayslip(payload);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to generate payslip.');
      throw err;
    }
  };

  const rows = useMemo(() => employees, [employees]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Payslip Generator</h1>
        <p className="mt-1 text-sm text-slate-500">Generate monthly payslips for employees</p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
        {(error || actionError) && (
          <p className="mb-4 text-sm text-rose-600">{error || actionError}</p>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
            Loading employees...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
            No employees added yet
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-md">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Employee Code</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Basic Salary</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 font-medium">{employee.employeeCode}</td>
                    <td className="px-4 py-3">{employee.fullName}</td>
                    <td className="px-4 py-3">{employee.email}</td>
                    <td className="px-4 py-3">{employee.department || '-'}</td>
                    <td className="px-4 py-3">{employee.designation || '-'}</td>
                    <td className="px-4 py-3">
                      {employee.basicSalary === null
                        ? '-'
                        : new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(employee.basicSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openModal(employee)}
                        className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
                      >
                        Generate Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <GeneratePayslipModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={closeModal}
        onGenerate={handleGenerate}
      />
    </>
  );
};

