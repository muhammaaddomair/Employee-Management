import { contextBridge, ipcRenderer } from 'electron';
import type { CreateEmployeeInput, Employee } from '../shared/types/employee';
import type { GeneratePayslipInput, GeneratePayslipResult } from '../shared/types/payslip';

const api = {
  getAllEmployees: async (): Promise<Employee[]> => ipcRenderer.invoke('employees:getAllEmployees'),
  createEmployee: async (payload: CreateEmployeeInput): Promise<Employee> =>
    ipcRenderer.invoke('employees:createEmployee', payload),
  generatePayslipPDF: async (payload: GeneratePayslipInput): Promise<GeneratePayslipResult> =>
    ipcRenderer.invoke('payslip:generatePayslipPDF', payload)
};

contextBridge.exposeInMainWorld('payrollApi', api);

