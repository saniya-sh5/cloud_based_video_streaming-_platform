import { VideoSegment, SemaphoreState, LogEntry } from '../types';

export const RESOLUTIONS: Array<VideoSegment['resolution']> = ['720p', '1080p', '4K HDR', '8K Ultra'];
export const CODECS: Array<VideoSegment['codec']> = ['H.264', 'HEVC', 'AV1', 'VP9'];
export const TITLES = [
  'Inception - Scene 4 (Action Burst)',
  'Cyberpunk Night - Live Stream',
  'Interstellar - Wormhole Transcode',
  'Avatar 3D - Audio & Video Mux',
  'Nature 4K HDR - Forest Stream',
  'Formula 1 - Onboard Camera Cam #2',
  'Gaming Esports Final - Segment #88',
];

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#6366f1', // indigo
];

/**
 * Generate a new random or sequential streaming segment
 */
export function generateNewSegment(counter: number): VideoSegment {
  const resolution = RESOLUTIONS[Math.floor(Math.random() * RESOLUTIONS.length)];
  const codec = CODECS[Math.floor(Math.random() * CODECS.length)];
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const color = COLORS[counter % COLORS.length];

  const bitrateMb = resolution === '8K Ultra' ? 45 : resolution === '4K HDR' ? 25 : resolution === '1080p' ? 8 : 4;
  const sizeMb = Math.round(bitrateMb * (1.5 + Math.random()));

  return {
    id: `SEG-${counter.toString().padStart(3, '0')}`,
    title,
    resolution,
    bitrateMb,
    codec,
    sizeMb,
    producedAt: Date.now(),
    color,
  };
}

/**
 * Initialize Bounded Buffer State
 */
export function createInitialBufferState(capacity: number = 6): {
  buffer: VideoSegment[];
  semaphores: SemaphoreState;
  logs: LogEntry[];
} {
  return {
    buffer: [],
    semaphores: {
      mutex: 1,
      empty: capacity,
      full: 0,
      capacity,
    },
    logs: [
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        message: `Initialized Bounded Video Buffer with Capacity = ${capacity} slots. Semaphores: [mutex=1, empty=${capacity}, full=0].`,
      },
    ],
  };
}

/**
 * Producer operation: Adds segment if empty > 0 and mutex === 1
 */
export function produceSegmentToBuffer(
  buffer: VideoSegment[],
  semaphores: SemaphoreState,
  segmentCounter: number
): {
  success: boolean;
  newBuffer: VideoSegment[];
  newSemaphores: SemaphoreState;
  log: LogEntry;
  newSegment?: VideoSegment;
} {
  const timestamp = new Date().toLocaleTimeString();

  if (semaphores.empty <= 0) {
    return {
      success: false,
      newBuffer: buffer,
      newSemaphores: semaphores,
      log: {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp,
        type: 'blocked',
        message: `[PRODUCER BLOCKED] Buffer is FULL (capacity ${semaphores.capacity}). Producer waiting on semaphore empty (empty=0).`,
        badge: 'BUFFER FULL',
      },
    };
  }

  if (semaphores.mutex === 0) {
    return {
      success: false,
      newBuffer: buffer,
      newSemaphores: semaphores,
      log: {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp,
        type: 'blocked',
        message: `[MUTEX BLOCKED] Critical section locked by another process (mutex=0). Producer waiting...`,
        badge: 'MUTEX LOCKED',
      },
    };
  }

  const segment = generateNewSegment(segmentCounter);
  const newBuffer = [...buffer, segment];
  const newSemaphores: SemaphoreState = {
    ...semaphores,
    mutex: 1, // Mutex locked and unlocked during atomic operation
    empty: semaphores.empty - 1,
    full: semaphores.full + 1,
  };

  return {
    success: true,
    newBuffer,
    newSemaphores,
    newSegment: segment,
    log: {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp,
      type: 'producer',
      message: `[PRODUCER] Created & Pushed segment ${segment.id} (${segment.resolution}, ${segment.codec}). Semaphores -> mutex: 1, empty: ${newSemaphores.empty}, full: ${newSemaphores.full}`,
      badge: segment.id,
    },
  };
}

/**
 * Consumer operation: Removes segment if full > 0 and mutex === 1
 */
export function consumeSegmentFromBuffer(
  buffer: VideoSegment[],
  semaphores: SemaphoreState
): {
  success: boolean;
  newBuffer: VideoSegment[];
  newSemaphores: SemaphoreState;
  log: LogEntry;
  consumedSegment?: VideoSegment;
} {
  const timestamp = new Date().toLocaleTimeString();

  if (semaphores.full <= 0 || buffer.length === 0) {
    return {
      success: false,
      newBuffer: buffer,
      newSemaphores: semaphores,
      log: {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp,
        type: 'blocked',
        message: `[CONSUMER BLOCKED] Buffer is EMPTY (full=0). Video player waiting on producer segment...`,
        badge: 'BUFFER EMPTY',
      },
    };
  }

  if (semaphores.mutex === 0) {
    return {
      success: false,
      newBuffer: buffer,
      newSemaphores: semaphores,
      log: {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp,
        type: 'blocked',
        message: `[MUTEX BLOCKED] Critical section locked by another process (mutex=0). Consumer waiting...`,
        badge: 'MUTEX LOCKED',
      },
    };
  }

  const consumedSegment = buffer[0];
  consumedSegment.consumedAt = Date.now();
  const newBuffer = buffer.slice(1);

  const newSemaphores: SemaphoreState = {
    ...semaphores,
    mutex: 1,
    empty: semaphores.empty + 1,
    full: semaphores.full - 1,
  };

  return {
    success: true,
    newBuffer,
    newSemaphores,
    consumedSegment,
    log: {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp,
      type: 'consumer',
      message: `[CONSUMER] Fetched & Streamed segment ${consumedSegment.id} (${consumedSegment.resolution}). Semaphores -> mutex: 1, empty: ${newSemaphores.empty}, full: ${newSemaphores.full}`,
      badge: consumedSegment.id,
    },
  };
}
