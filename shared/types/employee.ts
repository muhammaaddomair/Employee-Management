export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  joinDate: string | null;
  basicSalary: number | null;
  status: EmployeeStatus;
  createdAt: string;
}

export interface CreateEmployeeInput {
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  basicSalary?: number;
  status: EmployeeStatus;
}
