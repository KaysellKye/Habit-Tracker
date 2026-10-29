import { AlarmItem, BuiltinAlarmTone } from '../types';

// IndexedDB configuration for persistent storage of audio and video files
const DB_NAME = 'HabitTrackerMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'alarm_media';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores custom audio/video Blob into IndexedDB and returns an Object URL
 */
export async function saveMediaBlob(alarmId: string, file: Blob): Promise<string> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, alarmId);
      req.onsuccess = () => {
        resolve(URL.createObjectURL(file));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save media in IndexedDB, using temporary ObjectURL:', err);
    return URL.createObjectURL(file);
  }
}

/**
 * Loads Blob from IndexedDB and returns Object URL
 */
export async function getMediaBlobUrl(alarmId: string): Promise<string | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(alarmId);
      req.onsuccess = () => {
        if (req.result instanceof Blob) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Deletes media from IndexedDB
 */
export async function deleteMediaBlob(alarmId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(alarmId);
  } catch {}
}

/* ====================================================================
   WEB AUDIO API SYNTHESIZER (100% Offline, Zero Missing Asset Issues)
   ==================================================================== */

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioContextClass();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

export function playSynthesizedTone(
  tone: BuiltinAlarmTone,
  volume = 0.8
): { stop: () => void } {
  const ctx = getAudioContext();
  let isRunning = true;
  let intervalId: any = null;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  const playBurst = () => {
    if (!isRunning) return;
    const now = ctx.currentTime;

    switch (tone) {
      case 'digital': {
        // Fast dual beeps: 1400Hz - pause - 1400Hz
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1400, now + i * 0.15);

          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.01);
          gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.1);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.1);
        }
        break;
      }

      case 'bell': {
        // Traditional bell chime with rich harmonics
        const freqs = [880, 1760, 2640];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.4 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 1.6);
        });
        break;
      }

      case 'gentle': {
        // Relaxing pentatonic morning melody
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.2);

          gain.gain.setValueAtTime(0, now + idx * 0.2);
          gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.2 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.2 + 0.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.2);
          osc.stop(now + idx * 0.2 + 0.8);
        });
        break;
      }

      case 'radar': {
        // Pulsing sonar radar ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      case 'chime':
      default: {
        // Warm marimba triad
        const chord = [659.25, 830.61, 987.77]; // E5, G#5, B5
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.35, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.7);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.7);
        });
        break;
      }
    }
  };

  // Play immediately
  playBurst();

  // Loop every 1.8 seconds
  intervalId = setInterval(playBurst, 1800);

  return {
    stop: () => {
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    },
  };
}

/* ====================================================================
   CUSTOM AUDIO / VIDEO PLAYBACK (Seamless audio extraction from video)
   ==================================================================== */

export function playCustomMedia(
  url: string,
  volume = 0.8,
  isVideo = false
): { stop: () => void } {
  // If video or audio, HTMLMediaElement plays the audio track natively
  const element: HTMLAudioElement | HTMLVideoElement = isVideo
    ? document.createElement('video')
    : new Audio();

  element.src = url;
  element.volume = Math.max(0.01, Math.min(volume, 1));
  element.loop = true;

  // Make sure it doesn't show or block screen
  if (isVideo) {
    element.style.display = 'none';
    document.body.appendChild(element);
  }

  const playPromise = element.play();
  if (playPromise) {
    playPromise.catch((err) => {
      console.warn('Autoplay restricted or invalid audio/video format:', err);
    });
  }

  return {
    stop: () => {
      try {
        element.pause();
        element.currentTime = 0;
        if (isVideo && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch {}
    },
  };
}

/* ====================================================================
   GLOBAL ACTIVE ALARM & PREVIEW CONTROLLER
   ==================================================================== */

let activeRingingController: { stop: () => void } | null = null;
let activePreviewController: { stop: () => void } | null = null;

export function stopCurrentRingingAlarm() {
  if (activeRingingController) {
    activeRingingController.stop();
    activeRingingController = null;
  }
}

export function stopCurrentPreview() {
  if (activePreviewController) {
    activePreviewController.stop();
    activePreviewController = null;
  }
}

export function startAlarmSound(alarm: AlarmItem) {
  stopCurrentRingingAlarm();
  stopCurrentPreview();

  if (alarm.soundType === 'custom' && alarm.customMediaUrl) {
    activeRingingController = playCustomMedia(
      alarm.customMediaUrl,
      alarm.volume ?? 0.8,
      alarm.customMediaType === 'video'
    );
  } else {
    activeRingingController = playSynthesizedTone(
      alarm.builtinTone || 'bell',
      alarm.volume ?? 0.8
    );
  }
}

export function previewAlarmSound(alarm: Partial<AlarmItem>) {
  stopCurrentPreview();

  if (alarm.soundType === 'custom' && alarm.customMediaUrl) {
    activePreviewController = playCustomMedia(
      alarm.customMediaUrl,
      alarm.volume ?? 0.8,
      alarm.customMediaType === 'video'
    );
  } else {
    activePreviewController = playSynthesizedTone(
      alarm.builtinTone || 'bell',
      alarm.volume ?? 0.8
    );
  }

  // Auto stop preview after 5 seconds
  setTimeout(() => {
    stopCurrentPreview();
  }, 5000);
}

/* ====================================================================
   LOCAL STORAGE & DEFAULT ALARMS
   ==================================================================== */

const ALARMS_STORAGE_KEY = 'habit_tracker_alarms';

export const DEFAULT_BUILTIN_TONES: {
  id: BuiltinAlarmTone;
  name: string;
  description: string;
}[] = [
  { id: 'bell', name: 'Bel Klasik', description: 'Dentang lonceng alami dan jernih' },
  { id: 'digital', name: 'Digital Watch', description: 'Beep elektronik khas jam alarm' },
  { id: 'gentle', name: 'Melodi Pagi', description: 'Alunan lembut ramah di telinga' },
  { id: 'radar', name: 'Radar Sonar', description: 'Pulsing modern untuk fokus tinggi' },
  { id: 'chime', name: 'Triad Chime', description: 'Kombinasi melodi marimba ceria' },
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-morning',
    time: '06:30',
    title: 'Bangun Pagi & Minum Air',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5], // Senin - Jumat
    soundType: 'builtin',
    builtinTone: 'gentle',
    volume: 0.8,
    snoozeMinutes: 5,
  },
  {
    id: 'alarm-focus',
    time: '09:00',
    title: 'Mulai Time-Block Produktif',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    soundType: 'builtin',
    builtinTone: 'bell',
    volume: 0.85,
    snoozeMinutes: 5,
  },
];

export function loadUserAlarms(): AlarmItem[] {
  try {
    const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load alarms:', err);
  }
  return INITIAL_ALARMS;
}

export function saveUserAlarms(alarms: AlarmItem[]): void {
  try {
    // Clean up transient object URLs when saving to JSON
    const sanitized = alarms.map((a) => ({
      ...a,
      customMediaUrl: a.customMediaUrl?.startsWith('data:') ? a.customMediaUrl : undefined,
    }));
    localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Failed to save alarms to localStorage:', err);
  }
}

/**
 * Hydrates Object URLs from IndexedDB for custom audio/video alarms
 */
export async function hydrateAlarmMedia(alarms: AlarmItem[]): Promise<AlarmItem[]> {
  const updated = await Promise.all(
    alarms.map(async (alarm) => {
      if (alarm.soundType === 'custom') {
        const storedUrl = await getMediaBlobUrl(alarm.id);
        if (storedUrl) {
          return { ...alarm, customMediaUrl: storedUrl };
        }
      }
      return alarm;
    })
  );
  return updated;
}
