import { Task, TimelineItem, UpcomingTaskItem, WeekDay } from '../types';

export const initialTasks: Task[] = [
  // Overdue Task
  {
    id: 'overdue-1',
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
    ]
  },
  // Today Tasks
  {
    id: 'today-1',
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
    ]
  },
  {
    id: 'today-2',
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
    ]
  },
  {
    id: 'today-3',
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
    ]
  },
  // Previous Day Completed Tasks
  {
    id: 'past-1',
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
    ]
  },
  {
    id: 'past-2',
    title: 'Review Modul Statistika Probabilitas',
    completed: true,
    priority: 'Medium',
    category: 'Produktif',
    timeRange: '14:00 - 15:30',
    dateStr: '2023-10-23',
    isGoogleSync: false,
    subtasks: [
      { id: 'sub-p3', title: 'Latihan soal distribusi normal', completed: true }
    ]
  }
];

export const initialTimeline: TimelineItem[] = [
  {
    id: 'time-1',
    startTime: '09:00',
    endTime: '10:30',
    type: 'focus',
    badgeText: 'FOKUS KERJA',
    title: 'Review Desain UI Pitch Deck',
    subtitle: 'Durasi: 1j 30m'
  },
  {
    id: 'time-2',
    startTime: '11:00',
    endTime: '12:00',
    type: 'gmeet',
    badgeText: 'Google Meet',
    title: 'Weekly Sync Tim Engineering',
    subtitle: 'Host: Kevin • 8 Peserta'
  },
  {
    id: 'time-3',
    startTime: '12:00',
    endTime: '13:00',
    type: 'break',
    badgeText: 'Istirahat',
    title: 'Istirahat & Makan Siang',
    subtitle: 'Bebas Layar • Recharging'
  },
  {
    id: 'time-4',
    startTime: '14:00',
    endTime: '14:45',
    type: 'conflict',
    badgeText: 'BENTROK JADWAL',
    title: 'Rapat Bimbingan vs Sesi Fokus ML',
    subtitle: 'Tumpang tindih selama 45 menit pada 14:00',
    conflictDetails: 'Jadwal Google Calendar bertabrakan dengan rencana pengerjaan tugas ML.',
    isActionable: true
  }
];

export const initialWeekDays: WeekDay[] = [
  { dayName: 'Sen', dayNumber: 23, dateStr: '2023-10-23', isToday: false },
  { dayName: 'Sel', dayNumber: 24, dateStr: '2023-10-24', isToday: true, hasTasks: true },
  { dayName: 'Rab', dayNumber: 25, dateStr: '2023-10-25', isToday: false, hasTasks: true },
  { dayName: 'Kam', dayNumber: 26, dateStr: '2023-10-26', isToday: false },
  { dayName: 'Jum', dayNumber: 27, dateStr: '2023-10-27', isToday: false },
  { dayName: 'Sab', dayNumber: 28, dateStr: '2023-10-28', isToday: false },
  { dayName: 'Min', dayNumber: 29, dateStr: '2023-10-29', isToday: false },
];

export const initialUpcomingTasks: UpcomingTaskItem[] = [
  {
    id: 'up-1',
    title: 'Presentasi Proyek Akhir',
    category: 'Produktif',
    timeStr: '10:00 WIB',
    iconType: 'school'
  },
  {
    id: 'up-2',
    title: 'Beli Kebutuhan Bulanan',
    category: 'Hiburan',
    timeStr: '19:00 WIB',
    iconType: 'shopping'
  }
];
