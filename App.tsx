import React, { useState, useEffect, useCallback } from 'react';
import { SleepRecord, Habit, HabitType } from './types';
import DailyEntry from './components/DailyEntry';
import HabitManager from './components/HabitManager';
import StatsView from './components/StatsView';
import HistoryModal from './components/HistoryModal';
import { Waves, Calendar, BarChart3, Settings, Trash2 } from 'lucide-react';

const STORAGE_KEY_RECORDS = 'sleep_flow_v3_records';
const STORAGE_KEY_HABITS = 'sleep_flow_v3_habits';

const App: React.FC = () => {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeTab, setActiveTab] = useState<'ENTRY' | 'STATS' | 'SETTINGS'>('ENTRY');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const r = localStorage.getItem(STORAGE_KEY_RECORDS);
    const h = localStorage.getItem(STORAGE_KEY_HABITS);
    if (r) setRecords(JSON.parse(r));
    if (h) setHabits(JSON.parse(h));
  }, []);

  const saveRecord = useCallback((record: SleepRecord) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.date === record.date);
      const next = idx > -1 
        ? prev.map((r, i) => i === idx ? record : r)
        : [...prev, record].sort((a, b) => a.date.localeCompare(b.date));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(next));
      return next;
    });
  }, []);

  const addHabit = (name: string, type: HabitType) => {
    const newHabits = [...habits, { id: crypto.randomUUID(), name, type }];
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(newHabits));
  };

  const removeHabit = (id: string) => {
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(newHabits));
  };

  const currentRecord = records.find(r => r.date === selectedDate) || null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans">
      <header className="px-6 py-4 flex justify-between items-center bg-slate-950/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 pt-safe">
        <button 
          onClick={() => setShowHistory(true)}
          className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 active:scale-90 transition-transform"
        >
          <Waves size={20} className="text-indigo-400/80" />
        </button>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-[12px] font-bold text-indigo-400/60 focus:outline-none [color-scheme:dark]"
        />
      </header>

      <main className="flex-1 px-5 py-6 max-w-lg mx-auto w-full mb-24 overflow-y-auto no-scrollbar">
        {activeTab === 'ENTRY' && (
          <DailyEntry 
            date={selectedDate} 
            habits={habits} 
            record={currentRecord} 
            onSave={saveRecord} 
          />
        )}
        {activeTab === 'STATS' && (
          <StatsView records={records} habits={habits} />
        )}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-4">
            <HabitManager habits={habits} onAdd={addHabit} onRemove={removeHabit} />
            
            <button 
              onClick={() => { if(confirm('Factory Reset?')) { localStorage.clear(); window.location.reload(); } }}
              className="w-full py-2.5 rounded-[32px] text-[11px] font-black uppercase tracking-[0.25em] text-rose-400/80 bg-rose-500/10 active:bg-rose-500/20 flex items-center justify-center gap-2 border border-rose-500/10 transition-all"
            >
              <Trash2 size={12} /> Clear App Data
            </button>
          </div>
        )}
      </main>

      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        records={records} 
        habits={habits}
      />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 rounded-full glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 ring-1 ring-white/10 w-[300px] h-12">
        {[
          { id: 'ENTRY', icon: Calendar },
          { id: 'STATS', icon: BarChart3 },
          { id: 'SETTINGS', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all duration-400 ${
              activeTab === tab.id ? 'text-indigo-400/90 bg-white/[0.05] shadow-inner' : 'text-slate-700'
            }`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          </button>
        ))}
      </nav>
    </div>
  );
};
export default App;