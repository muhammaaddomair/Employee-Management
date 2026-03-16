import type { CreateEmployeeInput, Employee } from '@shared/types/employee';
import type { GeneratePayslipInput, GeneratePayslipResult } from '@shared/types/payslip';

export interface PayrollApi {
  getAllEmployees: () => Promise<Employee[]>;
  createEmployee: (payload: CreateEmployeeInput) => Promise<Employee>;
  generatePayslipPDF: (payload: GeneratePayslipInput) => Promise<GeneratePayslipResult>;
}

declare global {
  interface Window {
    payrollApi: PayrollApi;
  }
}

export {};

