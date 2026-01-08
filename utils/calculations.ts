import { Habit, HabitType } from '../types';

export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const calculateDuration = (start: string, end: string): number => {
  if (!start || !end) return 0;
  let s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (e <= s) e += 24 * 60;
  return e - s;
};

export const getSleepEvaluation = (mins: number) => {
  if (mins === 0) return { text: 'NO DATA', color: 'text-slate-500', bgColor: 'bg-slate-500/10', progress: 0 };
  const hours = mins / 60;
  const progress = Math.min(100, (hours / 10) * 100);
  
  if (hours < 6) return { text: 'POOR', color: 'text-rose-400/70', bgColor: 'bg-rose-400/5', progress };
  if (hours < 7) return { text: 'SHORT', color: 'text-amber-400/70', bgColor: 'bg-amber-400/5', progress };
  if (hours <= 9) return { text: 'IDEAL', color: 'text-emerald-400/70', bgColor: 'bg-emerald-400/5', progress };
  return { text: 'LONG', color: 'text-sky-400/70', bgColor: 'bg-sky-400/5', progress };
};

export const calculateHabitScore = (statuses: { habitId: string; completed: boolean }[], habits: Habit[]): number => {
  if (!habits.length) return 10;
  let score = 0;
  statuses.forEach(status => {
    const habit = habits.find(h => h.id === status.habitId);
    if (!habit) return;
    if (habit.type === HabitType.GOOD && status.completed) score += 1;
    else if (habit.type === HabitType.BAD && !status.completed) score += 1;
  });
  // 0개 달성시 1점, 전체 달성시 10점 (1 + (달성수/전체수) * 9)
  return Math.round(1 + (score / habits.length) * 9);
};

export const calculateOverallQuality = (condition: number, quality: number, habitScore: number): number => {
  return Math.round((condition + quality + habitScore) / 3);
};