import { ipcMain } from 'electron';
import { employeeService } from '../../services/employee.service';
import type { CreateEmployeeInput } from '../../shared/types/employee';

const CHANNELS = {
  GET_ALL: 'employees:getAllEmployees',
  CREATE: 'employees:createEmployee'
} as const;

export const registerEmployeeIpcHandlers = (): void => {
  ipcMain.handle(CHANNELS.GET_ALL, async () => {
    return employeeService.getAllEmployees();
  });

  ipcMain.handle(CHANNELS.CREATE, async (_event, payload: CreateEmployeeInput) => {
    if (!payload?.employeeCode?.trim() || !payload?.fullName?.trim() || !payload?.email?.trim()) {
      throw new Error('Employee Code, Full Name, and Email are required.');
    }

    if (payload.status !== 'Active' && payload.status !== 'Inactive') {
      throw new Error('Invalid status value.');
    }

    return employeeService.createEmployee(payload);
  });
};

export { CHANNELS as EmployeeIpcChannels };
