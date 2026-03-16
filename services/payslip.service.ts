import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getDatabase } from '../database';
import type { Employee } from '../shared/types/employee';
import { MONTHS, type GeneratePayslipInput, type GeneratePayslipResult, type PayslipRecord } from '../shared/types/payslip';
import { emailService } from './email.service';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const drawLabelValue = (
  page: import('pdf-lib').PDFPage,
  font: import('pdf-lib').PDFFont,
  label: string,
  value: string,
  x: number,
  y: number
) => {
  page.drawText(`${label}: ${value}`, {
    x,
    y,
    size: 10.5,
    font,
    color: rgb(0.1, 0.12, 0.16)
  });
};

const resolveLetterheadPdfPath = async (): Promise<string> => {
  const candidates = [
    path.resolve(process.cwd(), 'assests', 'letterhead.pdf'),
    path.resolve(process.cwd(), 'assets', 'letterhead.pdf')
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue searching.
    }
  }

  throw new Error(
    `Letterhead PDF not found. Expected one of: ${candidates.join(', ')}`
  );
};

export class PayslipService {
  async generatePayslipPDF(input: GeneratePayslipInput): Promise<GeneratePayslipResult> {
    const db = getDatabase();

    const employeeStmt = db.prepare(`
      SELECT
        id,
        employeeCode,
        fullName,
        email,
        phone,
        department,
        designation,
        joinDate,
        basicSalary,
        status,
        createdAt
      FROM employees
      WHERE id = ?
    `);

    const employee = employeeStmt.get(input.employeeId) as Employee | undefined;
    if (!employee) {
      throw new Error('Employee not found.');
    }
    if (employee.basicSalary === null || !Number.isFinite(employee.basicSalary)) {
      throw new Error('Employee basic salary is missing or invalid.');
    }

    const now = new Date();
    const month = MONTHS[now.getMonth()];
    const year = String(now.getFullYear());
    const generatedDate = now.toLocaleDateString('en-US');

    const allowances = Number(input.allowances) || 0;
    const bonus = Number(input.bonus) || 0;
    const deductions = Number(input.deductions) || 0;
    const tax = Number(input.tax) || 0;
    const basicSalary = employee.basicSalary;
    const netSalary = basicSalary + allowances + bonus - deductions - tax;

    const payslipId = randomUUID();
    const createdAt = now.toISOString();

    const generatedDir = path.resolve(process.cwd(), 'generated-payslips');
    await fs.mkdir(generatedDir, { recursive: true });

    const safeCode = employee.employeeCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeCode}-${month}-${year}.pdf`;
    const pdfPath = path.join(generatedDir, fileName);

    const letterheadPdfPath = await resolveLetterheadPdfPath();

    // TODO:
    // Where should company letterhead be stored?
    // Suggested: assets/letterhead.png
    // Confirm path in Settings page later if dynamic.
    const basePdfBytes = await fs.readFile(letterheadPdfPath);
    const pdfDoc = await PDFDocument.load(basePdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.getPage(0);
    const { height } = page.getSize();

    page.drawText('Payslip', {
      x: 56,
      y: height - 130,
      size: 24,
      font: fontBold,
      color: rgb(0.1, 0.12, 0.16)
    });

    drawLabelValue(page, font, 'Employee Name', employee.fullName, 56, height - 165);
    drawLabelValue(page, font, 'Employee Code', employee.employeeCode, 320, height - 165);
    drawLabelValue(page, font, 'Designation', employee.designation || '-', 56, height - 185);
    drawLabelValue(page, font, 'Department', employee.department || '-', 320, height - 185);
    drawLabelValue(page, font, 'Month / Year', `${month} ${year}`, 56, height - 205);
    drawLabelValue(page, font, 'Generated Date', generatedDate, 320, height - 205);

    page.drawText('Salary Breakdown', {
      x: 56,
      y: height - 245,
      size: 13,
      font: fontBold,
      color: rgb(0.2, 0.24, 0.3)
    });

    const rows = [
      ['Basic Salary', CURRENCY_FORMATTER.format(basicSalary)],
      ['Allowances', CURRENCY_FORMATTER.format(allowances)],
      ['Bonus', CURRENCY_FORMATTER.format(bonus)],
      ['Deductions', CURRENCY_FORMATTER.format(deductions)],
      ['Tax', CURRENCY_FORMATTER.format(tax)]
    ];

    let y = height - 270;
    for (const [label, value] of rows) {
      page.drawText(label, {
        x: 56,
        y,
        size: 11,
        font,
        color: rgb(0.24, 0.29, 0.35)
      });
      page.drawText(value, {
        x: 430,
        y,
        size: 11,
        font,
        color: rgb(0.24, 0.29, 0.35)
      });
      y -= 20;
    }

    page.drawRectangle({
      x: 56,
      y: y - 8,
      width: 500,
      height: 28,
      color: rgb(0.86, 0.96, 0.9)
    });
    page.drawText(`Net Salary: ${CURRENCY_FORMATTER.format(netSalary)}`, {
      x: 64,
      y: y,
      size: 12,
      font: fontBold,
      color: rgb(0.06, 0.45, 0.2)
    });

    drawLabelValue(page, font, 'Payment Mode', 'Bank Transfer', 56, y - 40);
    drawLabelValue(page, font, 'Payslip ID', payslipId, 56, y - 58);
    page.drawText('Authorized Signature: _____________________', {
      x: 320,
      y: y - 58,
      size: 10.5,
      font,
      color: rgb(0.24, 0.29, 0.35)
    });

    const generatedBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, generatedBytes);

    try {
      await emailService.sendPayslipEmail({
        toEmail: employee.email,
        employeeName: employee.fullName,
        month,
        year,
        pdfPath
      });
    } catch (error) {
      throw new Error(
        `Payslip PDF generated but email failed: ${error instanceof Error ? error.message : 'Unknown SMTP error'}`
      );
    }

    const payslip: PayslipRecord = {
      id: payslipId,
      employeeId: employee.id,
      month,
      year,
      basicSalary,
      allowances,
      bonus,
      deductions,
      tax,
      netSalary,
      pdfPath,
      createdAt
    };

    const insertStmt = db.prepare(`
      INSERT INTO payslips (
        id,
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        bonus,
        deductions,
        tax,
        netSalary,
        pdfPath,
        createdAt
      ) VALUES (
        @id,
        @employeeId,
        @month,
        @year,
        @basicSalary,
        @allowances,
        @bonus,
        @deductions,
        @tax,
        @netSalary,
        @pdfPath,
        @createdAt
      )
    `);
    insertStmt.run(payslip);
    return { payslip, employee };
  }
}

export const payslipService = new PayslipService();
