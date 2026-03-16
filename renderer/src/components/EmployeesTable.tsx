import type { Employee } from '@shared/types/employee';

interface EmployeesTableProps {
  employees: Employee[];
}

const formatCurrency = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);
};

export const EmployeesTable = ({ employees }: EmployeesTableProps) => {
  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-md">
        No employees added yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-md">
      <table className="min-w-[1200px] w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Employee Code</th>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Designation</th>
            <th className="px-4 py-3">Basic Salary</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {employees.map((employee, index) => (
            <tr
              key={employee.id}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50 transition-colors`}
            >
              <td className="px-4 py-3 font-medium">{employee.employeeCode}</td>
              <td className="px-4 py-3">{employee.fullName}</td>
              <td className="px-4 py-3">{employee.email}</td>
              <td className="px-4 py-3">{employee.phone || '-'}</td>
              <td className="px-4 py-3">{employee.department || '-'}</td>
              <td className="px-4 py-3">{employee.designation || '-'}</td>
              <td className="px-4 py-3">{formatCurrency(employee.basicSalary)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    employee.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-4 py-3">{formatDate(employee.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
