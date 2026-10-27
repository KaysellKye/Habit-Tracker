import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readDatabase, writeDatabase, User, StoredTask } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'timeblock_jwt_super_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 profile pictures

// Seed default demo user if DB empty
function initSeed() {
  const db = readDatabase();
  if (db.users.length === 0) {
    const demoUserId = 'user-demo-andi';
    const salt = bcrypt.genSaltSync(10);
    const demoUser: User = {
      id: demoUserId,
      name: 'Andi',
      username: 'andi',
      email: 'andi@example.com',
      passwordHash: bcrypt.hashSync('password123', salt),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&auto=format&q=80',
      createdAt: new Date().toISOString(),
      streakCount: 5,
    };

    const initialTasks: StoredTask[] = [
      {
        id: 'task-overdue-1',
        userId: demoUserId,
        title: 'Kirim Laporan Keuangan Q3 ke Klien',
        completed: false,
        priority: 'Urgent',
        category: 'Kerja',
        dueDate: 'Kemarin',
        dueTime: '17:00',
        dateStr: '2023-10-23',
        isOverdue: true,
        isGoogleSync: true,
        subtasks: [
          { id: 'sub-1', title: 'Export neraca laba rugi', completed: true },
          { id: 'sub-2', title: 'Review catatan audit', completed: true },
          { id: 'sub-3', title: 'Kirim email ke CFO', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-today-1',
        userId: demoUserId,
        title: 'Review Desain UI Pitch Deck',
        completed: false,
        priority: 'High',
        category: 'Kerja',
        timeRange: '09:00 - 10:30',
        dateStr: '2023-10-24',
        isGoogleSync: true,
        subtasks: [
          { id: 'sub-101', title: 'Periksa typography & contrast', completed: true },
          { id: 'sub-102', title: 'Sinkronkan slide financial plan', completed: true },
          { id: 'sub-103', title: 'Ekspor PDF high-res', completed: true },
          { id: 'sub-104', title: 'Kirim link Figma ke tim', completed: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-today-2',
        userId: demoUserId,
        title: 'Mengerjakan Tugas Machine Learning Bab 4',
        completed: false,
        priority: 'Medium',
        category: 'Produktif',
        timeRange: '13:00 - 14:30',
        dateStr: '2023-10-24',
        isGoogleSync: false,
        subtasks: [
          { id: 'sub-201', title: 'Implementasi Gradient Descent di Python', completed: true },
          { id: 'sub-202', title: 'Tulis ringkasan evaluasi akurasi', completed: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-today-3',
        userId: demoUserId,
        title: 'Olahraga Pagi & Jogging 30 Menit',
        completed: true,
        priority: 'Low',
        category: 'Hiburan',
        timeRange: '06:30 - 07:15',
        dateStr: '2023-10-24',
        isGoogleSync: false,
        subtasks: [
          { id: 'sub-301', title: 'Pemanasan 5 menit', completed: true },
          { id: 'sub-302', title: 'Jogging 3 km', completed: true },
          { id: 'sub-303', title: 'Pendinginan & hidrasi', completed: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-past-1',
        userId: demoUserId,
        title: 'Setup Environment & Repository GitHub',
        completed: true,
        priority: 'High',
        category: 'Kerja',
        timeRange: '09:00 - 11:00',
        dateStr: '2023-10-23',
        isGoogleSync: true,
        subtasks: [
          { id: 'sub-p1', title: 'Init Vite monorepo', completed: true },
          { id: 'sub-p2', title: 'Configure ESLint & Prettier', completed: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    db.users.push(demoUser);
    db.tasks.push(...initialTasks);
    writeDatabase(db);
    console.log('✅ Demo account seeded: username "andi", password "password123"');
  }
}

initSeed();

// Authenticated Request interface
interface AuthRequest extends Request {
  userId?: string;
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Sesi login telah kedaluwarsa atau tidak valid.' });
      return;
    }
    req.userId = decoded.userId;
    next();
  });
};

function formatUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    streakCount: user.streakCount,
    createdAt: user.createdAt,
  };
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, username, email, password, avatarUrl } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ error: 'Semua kolom wajib diisi (Nama, Username, Email, Password).' });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'Username minimal 3 karakter.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password minimal 6 karakter.' });
      return;
    }

    const db = readDatabase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      res.status(400).json({ error: 'Username atau Email sudah terdaftar.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const defaultAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}`;

    const newUser: User = {
      id: `user-${uuidv4()}`,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      avatarUrl: defaultAvatar,
      createdAt: new Date().toISOString(),
      streakCount: 1,
    };

    db.users.push(newUser);

    // Seed starter tasks for newly registered user
    const starterTasks: StoredTask[] = [
      {
        id: `task-${uuidv4()}`,
        userId: newUser.id,
        title: 'Eksplorasi Fitur TimeBlock To-Do',
        completed: false,
        priority: 'High',
        category: 'Kerja',
        timeRange: '09:00 - 10:00',
        dateStr: '2023-10-24',
        isGoogleSync: true,
        subtasks: [
          { id: `sub-${uuidv4()}`, title: 'Atur nama & foto profil di Pengaturan', completed: false },
          { id: `sub-${uuidv4()}`, title: 'Coba buat tugas baru dengan tombol +', completed: false },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    db.tasks.push(...starterTasks);
    writeDatabase(db);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat registrasi.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ error: 'Username/Email dan Password wajib diisi.' });
      return;
    }

    const db = readDatabase();
    const query = emailOrUsername.trim().toLowerCase();

    const user = db.users.find(
      (u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );

    if (!user) {
      res.status(401).json({ error: 'Akun tidak ditemukan. Periksa kembali username/email Anda.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Password salah. Silakan coba lagi.' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login berhasil!',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// Google OAuth Login / Register
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential, accessToken, userInfo } = req.body;

    let googleEmail = '';
    let googleName = '';
    let googleAvatar = '';
    let googleId = '';

    // 1. If accessToken provided, verify with Google UserInfo endpoint
    if (accessToken) {
      try {
        const verifyRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (verifyRes.ok) {
          const profile: any = await verifyRes.json();
          googleEmail = profile.email || '';
          googleName = profile.name || '';
          googleAvatar = profile.picture || '';
          googleId = profile.sub || '';
        }
      } catch (err) {
        console.warn('Google userinfo fetch failed:', err);
      }
    }

    // 2. If credential (ID Token JWT) provided
    if (!googleEmail && credential) {
      try {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (tokenRes.ok) {
          const profile: any = await tokenRes.json();
          googleEmail = profile.email || '';
          googleName = profile.name || '';
          googleAvatar = profile.picture || '';
          googleId = profile.sub || '';
        } else {
          // Fallback: decode base64 JWT payload
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            googleEmail = payload.email || '';
            googleName = payload.name || '';
            googleAvatar = payload.picture || '';
            googleId = payload.sub || '';
          }
        }
      } catch (err) {
        console.warn('Google credential tokeninfo failed:', err);
      }
    }

    // 3. Fallback to userInfo if provided by client
    if (!googleEmail && userInfo && userInfo.email) {
      googleEmail = userInfo.email;
      googleName = userInfo.name || '';
      googleAvatar = userInfo.picture || '';
      googleId = userInfo.sub || '';
    }

    if (!googleEmail) {
      res.status(400).json({ error: 'Data akun Google tidak valid atau gagal diverifikasi.' });
      return;
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    const db = readDatabase();

    // Check if user already exists
    let user = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail || (googleId && u.googleId === googleId)
    );

    if (user) {
      // User exists, update avatar or googleId if missing
      if (googleAvatar && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) {
        user.avatarUrl = googleAvatar;
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      writeDatabase(db);
    } else {
      // Create new user from Google
      let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
      let candidateUsername = baseUsername;
      let counter = 1;
      while (db.users.some((u) => u.username.toLowerCase() === candidateUsername)) {
        candidateUsername = `${baseUsername}${counter++}`;
      }

      const randomPassword = uuidv4();
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(randomPassword, salt);

      user = {
        id: `user-${uuidv4()}`,
        name: googleName || baseUsername,
        username: candidateUsername,
        email: cleanEmail,
        googleId,
        passwordHash,
        avatarUrl: googleAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${candidateUsername}`,
        createdAt: new Date().toISOString(),
        streakCount: 1,
      };

      db.users.push(user);

      // Add starter tasks for new Google user
      const starterTasks: StoredTask[] = [
        {
          id: `task-${uuidv4()}`,
          userId: user.id,
          title: 'Selamat datang di TimeBlock To-Do!',
          completed: false,
          priority: 'High',
          category: 'Kerja',
          timeRange: '09:00 - 10:00',
          dateStr: '2023-10-24',
          isGoogleSync: true,
          subtasks: [
            { id: `sub-${uuidv4()}`, title: 'Akun Google berhasil terhubung', completed: true },
            { id: `sub-${uuidv4()}`, title: 'Eksplorasi pembuatan tugas dan time-blocking', completed: false },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      db.tasks.push(...starterTasks);
      writeDatabase(db);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login Google berhasil!',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat autentikasi Google.' });
  }
});

// Get Current User Profile (Me)
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDatabase();
  const user = db.users.find((u) => u.id === req.userId);

  if (!user) {
    res.status(404).json({ error: 'User tidak ditemukan.' });
    return;
  }

  res.json({ user: formatUserResponse(user) });
});

// Update Profile (Name, Username, Avatar)
app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, username, avatarUrl } = req.body;
    const db = readDatabase();
    const userIndex = db.users.findIndex((u) => u.id === req.userId);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User tidak ditemukan.' });
      return;
    }

    const user = db.users[userIndex];

    // Check if new username is already taken by someone else
    if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3) {
        res.status(400).json({ error: 'Username minimal 3 karakter.' });
        return;
      }

      const duplicate = db.users.find(
        (u) => u.id !== req.userId && u.username.toLowerCase() === cleanUsername
      );
      if (duplicate) {
        res.status(400).json({ error: 'Username ini sudah dipakai oleh pengguna lain.' });
        return;
      }
      user.username = cleanUsername;
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    db.users[userIndex] = user;
    writeDatabase(db);

    res.json({
      message: 'Profil berhasil diperbarui!',
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Gagal memperbarui profil.' });
  }
});

// ==================== TASKS API (SYNCED TO USER) ====================

// Get all tasks for authenticated user
app.get('/api/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDatabase();
  const userTasks = db.tasks.filter((t) => t.userId === req.userId);
  res.json({ tasks: userTasks });
});

// Create task
app.post('/api/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, category, priority, timeRange, dueDate, dueTime, dateStr, isOverdue, isGoogleSync, subtasks, notes } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Judul tugas wajib diisi.' });
      return;
    }

    const newTask: StoredTask = {
      id: `task-${uuidv4()}`,
      userId: req.userId!,
      title: title.trim(),
      completed: false,
      priority: priority || 'Medium',
      category: category || 'Kerja',
      timeRange,
      dueDate,
      dueTime,
      dateStr: dateStr || '2023-10-24',
      isOverdue: isOverdue || false,
      isGoogleSync: isGoogleSync ?? true,
      subtasks: subtasks || [],
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = readDatabase();
    db.tasks.unshift(newTask);
    writeDatabase(db);

    res.status(201).json({ task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Gagal menyimpan tugas baru.' });
  }
});

// Update task (toggle complete, edit, subtasks)
app.put('/api/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const db = readDatabase();
    const taskIndex = db.tasks.findIndex((t) => t.id === taskId && t.userId === req.userId);

    if (taskIndex === -1) {
      res.status(404).json({ error: 'Tugas tidak ditemukan.' });
      return;
    }

    const current = db.tasks[taskIndex];
    const updated: StoredTask = {
      ...current,
      ...req.body,
      id: current.id,
      userId: current.userId,
      updatedAt: new Date().toISOString(),
    };

    db.tasks[taskIndex] = updated;
    writeDatabase(db);

    res.json({ task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Gagal memperbarui tugas.' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const db = readDatabase();
    const initialLength = db.tasks.length;

    db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === req.userId));

    if (db.tasks.length === initialLength) {
      res.status(404).json({ error: 'Tugas tidak ditemukan.' });
      return;
    }

    writeDatabase(db);
    res.json({ success: true, message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Gagal menghapus tugas.' });
  }
});

// Bulk sync tasks (useful on first login/migration)
app.post('/api/tasks/bulk-sync', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: 'Data tasks harus berupa array.' });
      return;
    }

    const db = readDatabase();
    // Keep user's existing tasks, or replace/merge
    const userTasks = tasks.map((t: any) => ({
      ...t,
      id: t.id || `task-${uuidv4()}`,
      userId: req.userId!,
      updatedAt: new Date().toISOString(),
    }));

    // Replace user's tasks with synced tasks
    db.tasks = db.tasks.filter((t) => t.userId !== req.userId).concat(userTasks);
    writeDatabase(db);

    res.json({ success: true, tasks: userTasks });
  } catch (error) {
    console.error('Bulk sync error:', error);
    res.status(500).json({ error: 'Gagal sinkronisasi tugas.' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TimeBlock Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeBlock server running on http://localhost:${PORT}`);
});
