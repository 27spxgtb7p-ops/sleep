import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { Trash2, PlusCircle, MinusCircle, ShieldCheck } from 'lucide-react';

interface HabitManagerProps {
  habits: Habit[];
  onAdd: (name: string, type: HabitType) => void;
  onRemove: (id: string) => void;
}

const HabitManager: React.FC<HabitManagerProps> = ({ habits, onAdd, onRemove }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<HabitType>(HabitType.GOOD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim(), newType);
    setNewName('');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-indigo-400" />
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Setup</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-white/5 rounded-xl p-1.5 flex items-center gap-2">
        <input 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          placeholder="NEW PROTOCOL..." 
          className="flex-1 bg-transparent border-none text-xs font-bold text-slate-200 outline-none px-3 uppercase placeholder:text-slate-800" 
        />
        <div className="flex gap-1 p-0.5 bg-slate-950/40 rounded-lg">
          <button 
            type="button" 
            onClick={() => setNewType(HabitType.GOOD)} 
            className={`p-2 rounded transition-all ${newType === HabitType.GOOD ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-700'}`}
          >
            <PlusCircle size={14}/>
          </button>
          <button 
            type="button" 
            onClick={() => setNewType(HabitType.BAD)} 
            className={`p-2 rounded transition-all ${newType === HabitType.BAD ? 'bg-rose-500/20 text-rose-500' : 'text-slate-700'}`}
          >
            <MinusCircle size={14}/>
          </button>
        </div>
      </form>

      <div className="space-y-1.5">
        {habits.map((h) => (
          <div key={h.id} className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/5 group">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${h.type === HabitType.GOOD ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold uppercase text-slate-400">{h.name}</span>
            </div>
            <button onClick={() => onRemove(h.id)} className="text-slate-800 hover:text-rose-400">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default HabitManager;