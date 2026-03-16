import { randomUUID } from 'node:crypto';
import { getDatabase } from '../database';
import type { CreateEmployeeInput, Employee } from '../shared/types/employee';

export class EmployeeService {
  async getAllEmployees(): Promise<Employee[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
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
      ORDER BY datetime(createdAt) DESC
    `);

    const rows = stmt.all() as Employee[];
    return rows;
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    const db = getDatabase();

    const employee: Employee = {
      id: randomUUID(),
      employeeCode: input.employeeCode.trim(),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      department: input.department?.trim() || null,
      designation: input.designation?.trim() || null,
      joinDate: input.joinDate?.trim() || null,
      basicSalary: typeof input.basicSalary === 'number' && Number.isFinite(input.basicSalary)
        ? input.basicSalary
        : null,
      status: input.status,
      createdAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO employees (
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
      ) VALUES (
        @id,
        @employeeCode,
        @fullName,
        @email,
        @phone,
        @department,
        @designation,
        @joinDate,
        @basicSalary,
        @status,
        @createdAt
      )
    `);

    stmt.run(employee);
    return employee;
  }
}

export const employeeService = new EmployeeService();
