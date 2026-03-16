import type { Employee } from './employee';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export type PayslipMonth = (typeof MONTHS)[number];

export interface GeneratePayslipInput {
  employeeId: string;
  month: PayslipMonth;
  year: string;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
}

export interface PayslipRecord {
  id: string;
  employeeId: string;
  month: PayslipMonth;
  year: string;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  pdfPath: string;
  createdAt: string;
}

export interface GeneratePayslipResult {
  payslip: PayslipRecord;
  employee: Employee;
}

