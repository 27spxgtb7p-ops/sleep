export enum HabitType {
  GOOD = 'GOOD',
  BAD = 'BAD'
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
}

export interface HabitStatus {
  habitId: string;
  completed: boolean;
}

export interface SleepRecord {
  date: string;
  sleepTime: string; // HH:mm
  wakeTime: string;  // HH:mm
  condition: number; // 1-10
  sleepQuality: number; // 1-10
  habits: HabitStatus[];
  notes?: string;
}