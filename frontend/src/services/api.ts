import { Task, UserProfile } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const TOKEN_KEY = 'timeblock_token';
const USER_KEY = 'timeblock_user';
const LOCAL_TASKS_KEY = 'timeblock_offline_tasks';
const ACCOUNTS_KEY = 'timeblock_local_accounts';

export class ApiError extends Error {
  isServerDown: boolean;
  status: number;
  field?: string;

  constructor(message: string, status = 500, isServerDown = false, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isServerDown = isServerDown;
    this.field = field;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getLocalUser(): UserProfile | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setLocalUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getLocalTasks(): Task[] | null {
  const data = localStorage.getItem(LOCAL_TASKS_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setLocalTasks(tasks: Task[]): void {
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
}

// Local accounts storage for offline/fallback mode
interface LocalAccount {
  user: UserProfile;
  password?: string;
}

function getLocalAccounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalAccount(account: LocalAccount): void {
  const accounts = getLocalAccounts().filter(
    (a) =>
      a.user.username.toLowerCase() !== account.user.username.toLowerCase() &&
      a.user.email.toLowerCase() !== account.user.email.toLowerCase()
  );
  accounts.push(account);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set timeout to 3 seconds so we don't hang if backend is not started
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // If response has no JSON data or has status >= 500 without custom data.error:
      // It's a proxy gateway timeout / backend connection refusal!
      const isGatewayFailure = response.status >= 500 && (!data || !data.error);
      const errorMessage =
        data?.error ||
        (isGatewayFailure
          ? 'Server backend tidak dapat dihubungi.'
          : 'Terjadi kesalahan saat memproses permintaan.');

      throw new ApiError(errorMessage, response.status, isGatewayFailure, data?.field);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    // Network error (Failed to fetch, AbortError, etc.)
    throw new ApiError('Server backend tidak dapat dihubungi.', 0, true);
  }
}

// Auth API with seamless offline fallback
export async function apiRegister(body: {
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}): Promise<{ token: string; user: UserProfile }> {
  const cleanUsername = body.username.trim().toLowerCase();
  const cleanEmail = body.email.trim().toLowerCase();
  const defaultAvatar =
    body.avatarUrl ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}`;

  try {
    // 1. Try backend server
    const data = await request<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        avatarUrl: defaultAvatar,
      }),
    });
    setToken(data.token);
    setLocalUser(data.user);
    saveLocalAccount({ user: data.user, password: body.password });
    return data;
  } catch (err: any) {
    // If it's a specific user validation error from a live backend (e.g. 400 Bad Request duplicate), rethrow
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    console.info('Backend server unreachable or proxy error. Using local accounts fallback.');

    // 2. Fallback to local accounts
    const existingEmail = getLocalAccounts().find(
      (a) => a.user.email.toLowerCase() === cleanEmail
    );
    if (existingEmail) {
      throw new ApiError('Email sudah terdaftar', 400, false, 'email');
    }

    const existingUsername = getLocalAccounts().find(
      (a) => a.user.username.toLowerCase() === cleanUsername
    );
    if (existingUsername) {
      throw new ApiError('Username sudah digunakan. Silakan pilih username lain', 400, false, 'username');
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: body.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      avatarUrl: defaultAvatar,
      streakCount: 1,
      createdAt: new Date().toISOString(),
    };

    const token = `local-token-${Date.now()}`;
    setToken(token);
    setLocalUser(newUser);
    saveLocalAccount({ user: newUser, password: body.password });

    return { token, user: newUser };
  }
}

export async function apiLogin(body: {
  emailOrUsername: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  const query = body.emailOrUsername.trim().toLowerCase();

  try {
    // 1. Try backend server
    const data = await request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(data.token);
    setLocalUser(data.user);
    saveLocalAccount({ user: data.user, password: body.password });
    return data;
  } catch (err: any) {
    // If backend replied with wrong password or not found from live server (400 / 401), rethrow
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    console.info('Backend server unreachable. Checking local accounts.');

    // 2. Check local accounts
    const accounts = getLocalAccounts();
    const found = accounts.find(
      (a) =>
        a.user.username.toLowerCase() === query ||
        a.user.email.toLowerCase() === query
    );

    if (found) {
      if (found.password !== body.password) {
        throw new Error('Password salah. Silakan coba lagi.');
      }
      const token = `local-token-${Date.now()}`;
      setToken(token);
      setLocalUser(found.user);
      return { token, user: found.user };
    }

    // Check demo account fallback
    if ((query === 'andi' || query === 'andi@example.com') && body.password === 'password123') {
      const demoUser: UserProfile = {
        id: 'user-demo-andi',
        name: 'Andi',
        username: 'andi',
        email: 'andi@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&auto=format&q=80',
        streakCount: 5,
        createdAt: new Date().toISOString(),
      };
      const token = `local-token-${Date.now()}`;
      setToken(token);
      setLocalUser(demoUser);
      return { token, user: demoUser };
    }

    throw new Error('Akun tidak ditemukan. Periksa kembali username/email atau daftar akun baru.');
  }
}

// Forgot Password - Step 1: Request OTP
export async function apiForgotPasswordRequest(email: string): Promise<{
  message: string;
  email: string;
  simulatedOtp?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const data = await request<{ message: string; email: string; simulatedOtp?: string }>(
      '/auth/forgot-password/request',
      {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      }
    );
    return data;
  } catch (err: any) {
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    // Local fallback
    const accounts = getLocalAccounts();
    const found = accounts.find((a) => a.user.email.toLowerCase() === cleanEmail);
    const isDemo = cleanEmail === 'andi@example.com';

    if (!found && !isDemo) {
      throw new Error('Alamat email tidak terdaftar di Habit Tracker.');
    }

    const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    sessionStorage.setItem(`timeblock_otp_${cleanEmail}`, JSON.stringify({ otp: localOtp, expiry }));

    return {
      message: `Kode OTP 6-digit telah dikirim ke ${cleanEmail}.`,
      email: cleanEmail,
      simulatedOtp: localOtp,
    };
  }
}

// Forgot Password - Step 2: Verify OTP
export async function apiForgotPasswordVerify(
  email: string,
  otp: string
): Promise<{ message: string; success: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const data = await request<{ message: string; success: boolean }>(
      '/auth/forgot-password/verify',
      {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim() }),
      }
    );
    return data;
  } catch (err: any) {
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    // Local fallback
    const raw = sessionStorage.getItem(`timeblock_otp_${cleanEmail}`);
    if (!raw) {
      throw new Error('Kode OTP belum diminta atau telah kedaluwarsa.');
    }
    const record = JSON.parse(raw);
    if (Date.now() > record.expiry) {
      sessionStorage.removeItem(`timeblock_otp_${cleanEmail}`);
      throw new Error('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
    }
    if (record.otp !== otp.trim()) {
      throw new Error('Kode OTP yang Anda masukkan salah.');
    }

    return { message: 'Kode OTP valid.', success: true };
  }
}

// Forgot Password - Step 3: Reset Password
export async function apiForgotPasswordReset(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string; success: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const data = await request<{ message: string; success: boolean }>(
      '/auth/forgot-password/reset',
      {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim(), newPassword }),
      }
    );
    return data;
  } catch (err: any) {
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    // Local fallback
    const accounts = getLocalAccounts();
    const accountIndex = accounts.findIndex((a) => a.user.email.toLowerCase() === cleanEmail);
    if (accountIndex >= 0) {
      accounts[accountIndex].password = newPassword;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    sessionStorage.removeItem(`timeblock_otp_${cleanEmail}`);

    return {
      message: 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.',
      success: true,
    };
  }
}

export async function apiGoogleLogin(body: {
  credential?: string;
  accessToken?: string;
  userInfo?: any;
}): Promise<{ token: string; user: UserProfile }> {
  try {
    const data = await request<{ token: string; user: UserProfile }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setToken(data.token);
    setLocalUser(data.user);
    return data;
  } catch (err: any) {
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }

    console.info('Backend server unreachable during Google Login. Using local session fallback.');

    // Local fallback if backend is offline
    const info = body.userInfo || {};
    const email = info.email || 'user@gmail.com';
    const name = info.name || email.split('@')[0];
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
    const avatarUrl = info.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`;

    const localUser: UserProfile = {
      id: `google-user-${Date.now()}`,
      name,
      username,
      email,
      avatarUrl,
      streakCount: 1,
      createdAt: new Date().toISOString(),
    };

    const token = `local-token-google-${Date.now()}`;
    setToken(token);
    setLocalUser(localUser);
    saveLocalAccount({ user: localUser });
    return { token, user: localUser };
  }
}

export async function apiGetMe(): Promise<UserProfile> {
  try {
    const data = await request<{ user: UserProfile }>('/auth/me');
    setLocalUser(data.user);
    return data.user;
  } catch (err) {
    const local = getLocalUser();
    if (local) return local;
    throw err;
  }
}

export async function apiUpdateProfile(body: {
  name?: string;
  username?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  const current = getLocalUser();
  const updatedUser: UserProfile = {
    ...(current || {
      id: 'local-user',
      email: 'user@example.com',
      streakCount: 1,
    }),
    name: body.name || current?.name || 'User',
    username: body.username || current?.username || 'user',
    avatarUrl: body.avatarUrl || current?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&auto=format&q=80',
  };

  try {
    const data = await request<{ message: string; user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    setLocalUser(data.user);
    return data.user;
  } catch (err: any) {
    if (err instanceof ApiError && !err.isServerDown && err.status < 500) {
      throw err;
    }
    // If backend offline, persist locally
    setLocalUser(updatedUser);
    const accounts = getLocalAccounts().map((a) =>
      a.user.id === updatedUser.id ? { ...a, user: updatedUser } : a
    );
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return updatedUser;
  }
}

// Tasks API with seamless local caching
export async function apiGetTasks(): Promise<Task[]> {
  try {
    const data = await request<{ tasks: Task[] }>('/tasks');
    setLocalTasks(data.tasks);
    return data.tasks;
  } catch {
    const local = getLocalTasks();
    return local || [];
  }
}

export async function apiCreateTask(task: Partial<Task>): Promise<Task> {
  try {
    const data = await request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return data.task;
  } catch {
    return task as Task;
  }
}

export async function apiUpdateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const data = await request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.task;
  } catch {
    return { id, ...updates } as Task;
  }
}

export async function apiDeleteTask(id: string): Promise<void> {
  try {
    await request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  } catch {
    // Fallback handled locally in React state & localStorage
  }
}

export async function apiBulkSyncTasks(tasks: Task[]): Promise<Task[]> {
  try {
    const data = await request<{ success: boolean; tasks: Task[] }>('/tasks/bulk-sync', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
    setLocalTasks(data.tasks);
    return data.tasks;
  } catch {
    setLocalTasks(tasks);
    return tasks;
  }
}
