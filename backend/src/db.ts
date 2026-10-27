import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  createdAt: string;
  streakCount: number;
  googleId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface StoredTask {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  category: 'Kerja' | 'Produktif' | 'Hiburan';
  dueDate?: string;
  dueTime?: string;
  timeRange?: string;
  dateStr?: string;
  isOverdue?: boolean;
  isGoogleSync?: boolean;
  subtasks: Subtask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  tasks: StoredTask[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDatabase(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: [],
      tasks: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database, creating new one', err);
    const initialDb: DatabaseSchema = { users: [], tasks: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}
