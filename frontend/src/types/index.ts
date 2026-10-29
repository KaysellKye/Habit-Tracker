export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type Category = string;

export type CategoryColor =
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'rose'
  | 'cyan'
  | 'pink'
  | 'slate';

export interface CategoryItem {
  id: string;
  name: string;
  color: CategoryColor;
  isDefault?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string;
  dueTime?: string;
  timeRange?: string;
  isOverdue?: boolean;
  isGoogleSync?: boolean;
  subtasks: Subtask[];
  notes?: string;
  dateStr?: string;
}

export type TimelineType = 'focus' | 'gmeet' | 'break' | 'conflict';

export interface TimelineItem {
  id: string;
  startTime: string;
  endTime: string;
  type: TimelineType;
  badgeText: string;
  title: string;
  subtitle: string;
  conflictDetails?: string;
  isActionable?: boolean;
  color?: 'blue' | 'amber' | 'emerald' | 'purple' | 'red' | 'slate';
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  category: Category;
  timeStr: string;
  iconType: 'school' | 'shopping' | 'work';
}

export interface WeekDay {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  hasTasks?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  streakCount: number;
  createdAt?: string;
}

export type BuiltinAlarmTone = 'bell' | 'chime' | 'digital' | 'gentle' | 'radar';

export interface AlarmItem {
  id: string;
  time: string; // "07:30" (24h)
  title: string;
  enabled: boolean;
  repeatDays: number[]; // [0,1,2,3,4,5,6] (0 = Sunday, 1 = Monday), empty = one-time
  soundType: 'builtin' | 'custom';
  builtinTone: BuiltinAlarmTone;
  customMediaUrl?: string; // Data URL or object URL
  customMediaName?: string; // filename e.g. "my_song.mp3" or "alarm.mp4"
  customMediaType?: 'audio' | 'video';
  volume: number; // 0.1 to 1.0
  snoozeMinutes?: number; // default 5
}
