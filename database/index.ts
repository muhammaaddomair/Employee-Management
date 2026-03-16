import Database from 'better-sqlite3';
import path from 'node:path';

let db: Database.Database | null = null;

export const initDatabase = (dbPath: string): Database.Database => {
  if (db) {
    return db;
  }

  const resolvedPath = path.resolve(dbPath);
  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employeeCode TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      designation TEXT,
      joinDate TEXT,
      basicSalary REAL,
      status TEXT DEFAULT 'Active',
      createdAt TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS payslips (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      month TEXT,
      year TEXT,
      basicSalary REAL,
      allowances REAL,
      bonus REAL,
      deductions REAL,
      tax REAL,
      netSalary REAL,
      pdfPath TEXT,
      createdAt TEXT
    )
  `);

  return db;
};

export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('Database is not initialized.');
  }
  return db;
};
