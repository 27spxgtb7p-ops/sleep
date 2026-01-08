import React, { useState, useEffect, useRef } from 'react';
import { SleepRecord, Habit, HabitType } from '../types';
import { Moon, Sun, Clock, Zap, Target, ShieldCheck, X } from 'lucide-react';
import { calculateDuration, calculateHabitScore, getSleepEvaluation } from '../utils/calculations';

interface DailyEntryProps {
  date: string;
  habits: Habit[];
  record: SleepRecord | null;
  onSave: (record: SleepRecord) => void;
}

const NumberSelector = ({ value, onChange, label, icon: Icon, colorClass, isInputted }: any) => (
  <div className="space-y-4">
    <div className={`flex items-center gap-2.5 px-1 transition-all duration-500 ${isInputted ? 'opacity-100' : 'opacity-30'}`}>
      <Icon size={14} className={`${colorClass} brightness-110`} />
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</label>
    </div>
    <div className="flex justify-center items-center gap-1.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`relative w-9 h-9 flex items-center justify-center text-[15px] font-black transition-all duration-300 rounded-full ${
            value === num 
              ? `${colorClass} scale-110` 
              : 'text-slate-700 hover:text-slate-500'
          }`}
        >
          {num}
          {value === num && (
            <div className={`absolute -bottom-1 w-4 h-[2px] rounded-full transition-all duration-300 ${colorClass.replace('text', 'bg').split('/')[0]}`} />
          )}
        </button>
      ))}
    </div>
  </div>
);

const DailyEntry: React.FC<DailyEntryProps> = ({ date, habits, record, onSave }) => {
  const [sleepTime, setSleepTime] = useState(record?.sleepTime || '');
  const [wakeTime, setWakeTime] = useState(record?.wakeTime || '');
  const [condition, setCondition] = useState<number>(record?.condition || 5);
  const [sleepQuality, setSleepQuality] = useState<number>(record?.sleepQuality || 5);
  const [habitStatus, setHabitStatus] = useState<Record<string, boolean>>({});
  
  const isFirstRender = useRef(true);
  const sleepInputRef = useRef<HTMLInputElement>(null);
  const wakeInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;

  const colors = {
    indigo: 'text-indigo-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400/80',
    purple: 'text-purple-400' // Midpoint between indigo and violet
  };

  useEffect(() => {
    setSleepTime(record?.sleepTime || '');
    setWakeTime(record?.wakeTime || '');
    setCondition(record?.condition || 5);
    setSleepQuality(record?.sleepQuality || 5);
    setHabitStatus(record?.habits?.reduce((acc, h) => ({ ...acc, [h.habitId]: h.completed }), {}) || {});
  }, [record, date]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSave({
        date,
        sleepTime,
        wakeTime,
        condition,
        sleepQuality,
        habits: habits.map(h => ({ habitId: h.id, completed: !!habitStatus[h.id] }))
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [sleepTime, wakeTime, condition, sleepQuality, habitStatus, habits, date, onSave]);

  const setNow = (type: 'sleep' | 'wake') => {
    const timeStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (type === 'sleep') setSleepTime(timeStr);
    else setWakeTime(timeStr);
  };

  const handleManualEdit = (type: 'sleep' | 'wake') => {
    const ref = type === 'sleep' ? sleepInputRef : wakeInputRef;
    if (ref.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        ref.current.showPicker();
      } else {
        ref.current.click();
      }
    }
  };

  const handleTimeClick = (type: 'sleep' | 'wake') => {
    const currentVal = type === 'sleep' ? sleepTime : wakeTime;
    if (isToday && !currentVal) {
      setNow(type);
    } else {
      handleManualEdit(type);
    }
  };

  const clearTime = (e: React.MouseEvent, type: 'sleep' | 'wake') => {
    e.stopPropagation();
    if (type === 'sleep') setSleepTime('');
    else setWakeTime('');
  };

  const durationMins = calculateDuration(sleepTime, wakeTime);
  const durationStr = durationMins > 0 ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m` : '--';
  const evalData = getSleepEvaluation(durationMins);
  
  const habitScore = calculateHabitScore(
    habits.map(h => ({ habitId: h.id, completed: !!habitStatus[h.id] })),
    habits
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Time Display Section */}
      <div className="glass-panel p-6 rounded-[32px] border-white/5 flex flex-col items-center gap-8 overflow-hidden relative">
        <div className="flex items-center justify-between w-full px-2">
          {/* Sleep Time */}
          <div 
            onClick={() => handleTimeClick('sleep')}
            className="flex-1 flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition-all relative group/item"
          >
            <Moon size={18} className={`transition-all duration-500 ${sleepTime ? 'text-indigo-400 scale-110 brightness-125' : 'text-slate-800'}`} />
            <span className="text-4xl font-black text-slate-100 tracking-tighter tabular-nums leading-none">
              {sleepTime || '--:--'}
            </span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Onset</span>
            <input 
              ref={sleepInputRef}
              type="time" 
              className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
              onChange={(e) => setSleepTime(e.target.value)}
              value={sleepTime}
            />
            {sleepTime && (
              <button 
                onClick={(e) => clearTime(e, 'sleep')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 text-rose-500/60 opacity-0 group-hover/item:opacity-100 transition-opacity z-20"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="w-px h-12 bg-white/5 mx-4" />

          {/* Wake Time */}
          <div 
            onClick={() => handleTimeClick('wake')}
            className="flex-1 flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition-all relative group/item"
          >
            <Sun size={18} className={`transition-all duration-500 ${wakeTime ? 'text-amber-400 scale-110 brightness-125' : 'text-slate-800'}`} />
            <span className="text-4xl font-black text-slate-100 tracking-tighter tabular-nums leading-none">
              {wakeTime || '--:--'}
            </span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Wake</span>
            <input 
              ref={wakeInputRef}
              type="time" 
              className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
              onChange={(e) => setWakeTime(e.target.value)}
              value={wakeTime}
            />
            {wakeTime && (
              <button 
                onClick={(e) => clearTime(e, 'wake')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 text-rose-500/60 opacity-0 group-hover/item:opacity-100 transition-opacity z-20"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={13} className="text-slate-700" />
              <span className="text-[14px] font-black text-slate-400 tracking-tight">{durationStr}</span>
            </div>
            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full ${evalData.bgColor} ${evalData.color} tracking-[0.15em] border border-white/5 shadow-sm`}>
              {evalData.text}
            </span>
          </div>
          <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${evalData.color.replace('text', 'bg').split('/')[0]}`}
              style={{ width: `${evalData.progress}%`, opacity: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="px-5 py-4 space-y-12">
        <NumberSelector 
          label="Morning Energy" 
          icon={Zap} 
          value={sleepQuality} 
          onChange={setSleepQuality} 
          colorClass={colors.indigo}
          isInputted={!!record}
        />
        <NumberSelector 
          label="Daily Focus" 
          icon={Target} 
          value={condition} 
          onChange={setCondition} 
          colorClass={colors.purple}
          isInputted={!!record}
        />
      </div>

      {/* Bio-Protocol Section */}
      <div className="px-5 py-2 space-y-5">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className={`transition-all duration-500 ${Object.values(habitStatus).some(v => v) ? 'text-violet-400/80 brightness-110' : 'text-slate-800'}`} />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bio-Protocol</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5 text-violet-400/80 font-black text-[11px] tracking-widest uppercase">
            <span>{habitScore}</span>
            <span>PTS</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2.5">
          {habits.map(h => {
            const isCompleted = habitStatus[h.id];
            const isGood = h.type === HabitType.GOOD;
            let theme = isCompleted 
              ? (isGood ? 'bg-emerald-500/[0.04] border-emerald-500/10 text-emerald-400/80' : 'bg-rose-500/[0.04] border-rose-500/10 text-rose-400/80')
              : 'bg-slate-900/10 border-white/5 text-slate-600';

            return (
              <button 
                key={h.id} 
                onClick={() => setHabitStatus(prev => ({ ...prev, [h.id]: !prev[h.id] }))} 
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all active:scale-[0.98] ${theme}`}
              >
                <span className="text-[14px] font-bold uppercase tracking-wider">{h.name}</span>
                <div className={`w-3 h-3 rounded-full transition-all ${
                  isCompleted 
                    ? (isGood ? 'bg-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.2)]' : 'bg-rose-400/60 shadow-[0_0_10px_rgba(251,113,133,0.2)]') 
                    : 'bg-slate-800'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default DailyEntry;