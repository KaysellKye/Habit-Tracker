import { useState, useEffect } from 'react';
import { WeekDay } from '../types';

/**
 * Returns local YYYY-MM-DD string for a given Date
 */
export const getTodayDateStr = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const INDO_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const INDO_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format full Indonesian date string: "Rabu, 28 Oktober 2026"
 */
export const formatFullDateIndonesian = (dateInput: Date | string): string => {
  let date: Date;
  if (typeof dateInput === 'string') {
    // If format is YYYY-MM-DD
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return String(dateInput);

  const dayName = INDO_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

/**
 * Format time string: "17:48:30 WIB"
 */
export const formatTimeIndonesian = (date: Date = new Date(), withSeconds = true): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  if (withSeconds) {
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s} WIB`;
  }
  return `${h}:${m} WIB`;
};

/**
 * Dynamic greeting based on current hour
 */
export const getGreetingByHour = (hour: number): string => {
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};

/**
 * Month Year label: "Oktober 2026"
 */
export const getMonthYearLabel = (date: Date = new Date()): string => {
  return `${INDO_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Tomorrow label: "Kamis, 29 Okt"
 */
export const getTomorrowDateLabel = (date: Date = new Date()): string => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const dayName = INDO_DAYS[tomorrow.getDay()];
  const dayNum = tomorrow.getDate();
  const monthShort = INDO_MONTHS_SHORT[tomorrow.getMonth()];
  return `${dayName}, ${dayNum} ${monthShort}`;
};

/**
 * Returns local YYYY-MM-DD string for tomorrow
 */
export const getTomorrowDateStr = (date: Date = new Date()): string => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return getTodayDateStr(tomorrow);
};

/**
 * Generates the 7 days of the current week (Senin to Minggu)
 */
export const getCurrentWeekDays = (referenceDate: Date = new Date()): WeekDay[] => {
  const dayOfWeek = referenceDate.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const todayStr = getTodayDateStr(referenceDate);

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getTodayDateStr(d);
    days.push({
      dayName: dayLabels[i],
      dayNumber: d.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
      hasTasks: false,
    });
  }

  return days;
};

/**
 * Custom hook providing realtime ticking clock every second
 */
export const useRealtimeClock = () => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Update every second (1000ms)
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    now,
    timeStr: formatTimeIndonesian(now, true),
    timeShortStr: formatTimeIndonesian(now, false),
    fullDateStr: formatFullDateIndonesian(now),
    todayDateStr: getTodayDateStr(now),
    greeting: getGreetingByHour(now.getHours()),
    monthYearStr: getMonthYearLabel(now),
  };
};
