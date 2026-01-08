import React from 'react';
import { SleepRecord, Habit } from '../types';
import { X, Calendar, Clock, BarChart2 } from 'lucide-react';
import { calculateHabitScore, calculateOverallQuality, calculateDuration } from '../utils/calculations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SleepRecord[];
  habits: Habit[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, records, habits }) => {
  if (!isOpen) return null;

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-[80vh] bg-[#020617] glass-panel rounded-[32px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <header className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-indigo-400/50" />
            <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-300">Chronicles</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {sortedRecords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
              <BarChart2 size={40} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-widest">No traces found</p>
            </div>
          ) : (
            sortedRecords.map((r) => {
              const durMins = calculateDuration(r.sleepTime, r.wakeTime);
              const habitScore = calculateHabitScore(r.habits, habits);
              const score = calculateOverallQuality(r.condition, r.sleepQuality, habitScore);
              
              return (
                <div key={r.date} className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-200">{r.date}</p>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {Math.floor(durMins/60)}h {durMins%60}m
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">Habit: {habitScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-indigo-400/80 leading-none">{score}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mt-1">PTS</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;