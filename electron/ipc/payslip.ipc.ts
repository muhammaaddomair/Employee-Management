import { ipcMain } from 'electron';
import { payslipService } from '../../services/payslip.service';
import type { GeneratePayslipInput } from '../../shared/types/payslip';

const CHANNELS = {
  GENERATE_PDF: 'payslip:generatePayslipPDF'
} as const;

export const registerPayslipIpcHandlers = (): void => {
  ipcMain.handle(CHANNELS.GENERATE_PDF, async (_event, payload: GeneratePayslipInput) => {
    if (!payload?.employeeId?.trim()) {
      throw new Error('Employee is required.');
    }

    return payslipService.generatePayslipPDF(payload);
  });
};

export { CHANNELS as PayslipIpcChannels };
