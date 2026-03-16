import path from 'node:path';
import nodemailer from 'nodemailer';

interface SendPayslipEmailInput {
  toEmail: string;
  employeeName: string;
  month: string;
  year: string;
  pdfPath: string;
}

const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM'
] as const;

const getMissingEnvVars = (): string[] =>
  requiredEnvVars.filter((key) => !process.env[key] || !process.env[key]?.trim());

const parseSmtpPort = (): number => {
  const raw = process.env.SMTP_PORT?.trim() || '';
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Invalid SMTP_PORT value.');
  }
  return port;
};

const createTransporter = () => {
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    throw new Error(`Missing SMTP configuration: ${missing.join(', ')}`);
  }

  const port = parseSmtpPort();
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!
    }
  });
};

export class EmailService {
  async sendPayslipEmail(input: SendPayslipEmailInput): Promise<void> {
    if (!input.toEmail?.trim()) {
      throw new Error('Employee email is missing.');
    }

    const transporter = createTransporter();
    const monthYear = `${input.month} ${input.year}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM!,
      to: input.toEmail.trim(),
      subject: `Payslip - ${monthYear}`,
      text: `Dear ${input.employeeName},\n\nPlease find attached your payslip for ${monthYear}.\n\nRegards,\nPayroll Team`,
      html: `
        <p>Dear ${input.employeeName},</p>
        <p>Please find attached your payslip for <strong>${monthYear}</strong>.</p>
        <p>Regards,<br/>Payroll Team</p>
      `,
      attachments: [
        {
          filename: path.basename(input.pdfPath),
          path: input.pdfPath,
          contentType: 'application/pdf'
        }
      ]
    });
  }
}

export const emailService = new EmailService();

