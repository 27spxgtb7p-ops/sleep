import React, { useMemo, useState } from 'react';
import { SleepRecord, Habit } from '../types';
import { calculateHabitScore, calculateOverallQuality, timeToMinutes } from '../utils/calculations';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Line } from 'recharts';
import { TrendingUp, Award, Activity, ChevronLeft, ChevronRight, Split } from 'lucide-react';

type Range = 'W' | 'M' | 'Y';

const StatsView = ({ records, habits }: { records: SleepRecord[], habits: Habit[] }) => {
  const [range, setRange] = useState<Range>('W');
  const [offset, setOffset] = useState(0); // 0 for current, -1 for previous period
  const [compare, setCompare] = useState(false);

  const getFilteredData = (range: Range, offsetVal: number) => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const count = range === 'W' ? 7 : range === 'M' ? 30 : 365;
    const end = sorted.length + (offsetVal * count);
    const start = Math.max(0, end - count);
    return sorted.slice(start, end > 0 ? end : 0);
  };

  const currentRecords = useMemo(() => getFilteredData(range, offset), [records, range, offset]);
  const prevRecords = useMemo(() => getFilteredData(range, offset - 1), [records, range, offset]);

  const processRecords = (recs: SleepRecord[]) => {
    return recs.map((r, idx) => {
      let sleepMin = timeToMinutes(r.sleepTime);
      let wakeMin = timeToMinutes(r.wakeTime);
      const adjustedSleep = sleepMin < 600 ? sleepMin + 1440 : sleepMin;
      const adjustedWake = wakeMin < 600 ? wakeMin + 1440 : wakeMin;
      const duration = (adjustedWake - adjustedSleep) / 60;
      return {
        idx, // use index for overlay comparison
        date: r.date.split('-').slice(1).join('/'),
        duration: parseFloat(duration.toFixed(1)),
        sleepTime: adjustedSleep,
        wakeTime: adjustedWake,
        score: calculateOverallQuality(r.condition, r.sleepQuality, calculateHabitScore(r.habits, habits))
      };
    });
  };

  const currentData = useMemo(() => processRecords(currentRecords), [currentRecords, habits]);
  const prevData = useMemo(() => processRecords(prevRecords), [prevRecords, habits]);

  // Combine for chart if compare is true
  const chartData = useMemo(() => {
    return currentData.map((d, i) => ({
      ...d,
      prevDuration: prevData[i]?.duration,
      prevSleepTime: prevData[i]?.sleepTime,
      prevWakeTime: prevData[i]?.wakeTime,
    }));
  }, [currentData, prevData]);

  const stats = useMemo(() => {
    if (!currentData.length) return { avgQ: 0, topQ: 0 };
    const scores = currentData.map(d => d.score);
    return { 
      avgQ: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), 
      topQ: Math.max(...scores)
    };
  }, [currentData]);

  const formatTime = (minutes: number) => {
    const mins = minutes % 1440;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Range & Period Selector */}
      <div className="flex flex-col items-center gap-4 sticky top-0 z-20 py-2">
        <div className="glass-panel p-1.5 rounded-full flex gap-1 ring-1 ring-white/10 w-[280px] h-11">
          {(['W', 'M', 'Y'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRange(r); setOffset(0); }}
              className={`flex-1 text-[11px] font-black rounded-full transition-all ${
                range === r ? 'bg-indigo-600/60 text-white shadow-lg' : 'text-slate-700 hover:text-slate-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setOffset(prev => prev - 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] text-slate-500 border border-white/5 active:scale-90"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 w-24 text-center">
            {offset === 0 ? 'Current' : `${Math.abs(offset)} ago`}
          </span>
          <button 
            onClick={() => setOffset(prev => Math.min(0, prev + 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] text-slate-500 border border-white/5 active:scale-90"
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1" />
          
          <button 
            onClick={() => setCompare(!compare)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${compare ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.03] text-slate-700 border-white/5'}`}
          >
            <Split size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-[28px] flex flex-col items-center border border-white/5">
          <Award size={20} className="text-yellow-500/30 mb-3" />
          <span className="text-3xl font-black text-slate-100">{stats.avgQ}</span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Avg Score</span>
        </div>
        <div className="glass-panel p-5 rounded-[28px] flex flex-col items-center border border-white/5">
          <Activity size={20} className="text-indigo-500/30 mb-3" />
          <span className="text-3xl font-black text-slate-100">{stats.topQ}</span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Peak</span>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-[32px] border border-white/5">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
          <TrendingUp size={14} className="text-indigo-400/50"/> 
          {compare ? 'Comparison View' : 'Sleep Regularity'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#334155" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                interval={range === 'Y' ? 40 : range === 'M' ? 6 : 0}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '16px', 
                  fontSize: '11px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                formatter={(val: any, name: string) => {
                  if (name.includes('Time')) return [formatTime(val), name.includes('sleep') ? 'Onset' : 'Wake'];
                  return [val, name];
                }}
              />
              {compare && (
                <>
                  <Line type="monotone" dataKey="prevSleepTime" stroke="#818cf8" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.3} />
                  <Line type="monotone" dataKey="prevWakeTime" stroke="#fbbf24" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.3} />
                </>
              )}
              <Line type="monotone" dataKey="sleepTime" stroke="#818cf8" strokeWidth={2} dot={{ r: 2, fill: '#818cf8' }} />
              <Line type="monotone" dataKey="wakeTime" stroke="#fbbf24" strokeWidth={2} dot={{ r: 2, fill: '#fbbf24' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 opacity-40">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-400" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Onset</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-amber-400" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Wake</span>
           </div>
           {compare && (
             <div className="flex items-center gap-2">
               <div className="w-2 h-0.5 bg-slate-500 border-t border-dashed" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Previous</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default StatsView;