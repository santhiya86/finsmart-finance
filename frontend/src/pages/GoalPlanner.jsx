import { useEffect, useState } from 'react';
import { getGoals, createGoal, addSavings, deleteGoal } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdSavings, MdFlag, MdCheckCircle } from 'react-icons/md';
import { format } from 'date-fns';

const GOAL_CATEGORIES = ['Laptop','Phone','Vacation','Emergency Fund','Education','Vehicle','Home','Wedding','Other'];
const categoryEmojis = { Laptop:'💻',Phone:'📱',Vacation:'✈️','Emergency Fund':'🛡️',Education:'🎓',Vehicle:'🚗',Home:'🏠',Wedding:'💍',Other:'🎯' };
const defaultForm = { title:'', targetAmount:'', deadline:'', category:'Other', notes:'' };

export default function GoalPlanner() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [savingsInput, setSavingsInput] = useState({});

  const fetchGoals = async () => {
    setLoading(true);
    try { const { data } = await getGoals(); setGoals(data); }
    catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount || !form.deadline) { toast.error('Please fill all required fields'); return; }
    if (new Date(form.deadline) <= new Date()) { toast.error('Deadline must be a future date'); return; }
    setSaving(true);
    try { await createGoal({ ...form, targetAmount:parseFloat(form.targetAmount) }); toast.success('Goal created!'); setForm(defaultForm); setShowForm(false); fetchGoals(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
    finally { setSaving(false); }
  };

  const handleAddSavings = async (goalId) => {
    const amount = parseFloat(savingsInput[goalId]);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    try { await addSavings(goalId, amount); toast.success('Savings added!'); setSavingsInput(prev => ({...prev,[goalId]:''})); fetchGoals(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to add savings'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await deleteGoal(id); toast.success('Goal deleted'); fetchGoals(); }
    catch { toast.error('Failed to delete'); }
  };

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800">🎯 Financial Goal Planner</h1><p className="text-slate-500 text-sm mt-0.5">Set savings goals and track your progress</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 self-start sm:self-auto"><MdAdd className="text-xl" />New Goal</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Active Goals</p><p className="text-2xl font-bold text-primary-500">{activeGoals.length}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Total Saved</p><p className="text-2xl font-bold text-emerald-600">Rs.{activeGoals.reduce((s,g)=>s+g.savedAmount,0).toLocaleString()}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Still Needed</p><p className="text-2xl font-bold text-red-500">Rs.{activeGoals.reduce((s,g)=>s+g.remaining,0).toLocaleString()}</p></div>
      </div>

      {showForm && (
        <div className="card border-2 border-primary-100">
          <h2 className="text-base font-bold text-slate-800 mb-4">Create New Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Goal Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Buy a Laptop" className="input-field" required /></div>
              <div><label className="label">Target Amount (Rs.) *</label><input type="number" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})} placeholder="e.g. 50000" min="1" className="input-field" required /></div>
              <div><label className="label">Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field">
                  {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Target Date *</label><input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} min={new Date().toISOString().split('T')[0]} className="input-field" required /></div>
              <div className="sm:col-span-2"><label className="label">Notes (optional)</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Why this goal matters..." className="input-field" /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'Creating...':'Create Goal'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">Active Goals {activeGoals.length>0&&<span className="text-slate-400 font-normal text-sm">({activeGoals.length})</span>}</h2>
        {loading ? <div className="space-y-4">{[1,2].map(i=><div key={i} className="card h-40 animate-pulse bg-slate-100" />)}</div>
          : activeGoals.length===0 ? <div className="card text-center py-12"><MdFlag className="text-4xl text-slate-300 mx-auto mb-2" /><p className="text-slate-400 text-sm">No active goals yet</p><button onClick={() => setShowForm(true)} className="mt-3 btn-primary text-sm">Create your first goal</button></div>
          : activeGoals.map(goal => (
            <div key={goal._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryEmojis[goal.category]||'🎯'}</span>
                  <div><h3 className="text-base font-bold text-slate-800">{goal.title}</h3><p className="text-xs text-slate-400">Target: {format(new Date(goal.deadline),'dd MMM yyyy')} · {goal.daysLeft} days left</p></div>
                </div>
                <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><MdDelete /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[['Target',`Rs.${goal.targetAmount.toLocaleString()}`,'bg-slate-50','text-slate-700'],['Saved',`Rs.${goal.savedAmount.toLocaleString()}`,'bg-emerald-50','text-emerald-600'],['Remaining',`Rs.${goal.remaining.toLocaleString()}`,'bg-red-50','text-red-500']].map(([l,v,bg,c])=>(
                  <div key={l} className={`${bg} rounded-xl p-3 text-center`}><p className="text-xs text-slate-400 mb-1">{l}</p><p className={`text-sm font-bold ${c}`}>{v}</p></div>
                ))}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{goal.percentage}% complete</span><span>Rs.{goal.monthlySavingsNeeded.toLocaleString()}/month needed</span></div>
                <div className="w-full bg-slate-100 rounded-full h-3"><div className={`h-3 rounded-full transition-all duration-700 ${goal.percentage>=100?'bg-emerald-500':goal.percentage>=60?'bg-primary-500':goal.percentage>=30?'bg-yellow-400':'bg-red-400'}`} style={{width:`${goal.percentage}%`}} /></div>
              </div>
              <div className="flex gap-2">
                <input type="number" placeholder="Add savings amount..." value={savingsInput[goal._id]||''} onChange={e=>setSavingsInput(prev=>({...prev,[goal._id]:e.target.value}))} className="input-field flex-1" min="1" />
                <button onClick={() => handleAddSavings(goal._id)} className="btn-primary flex items-center gap-1 whitespace-nowrap"><MdSavings className="text-lg" />Add</button>
              </div>
            </div>
          ))
        }
      </div>

      {completedGoals.length>0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Completed Goals 🎉</h2>
          {completedGoals.map(goal=>(
            <div key={goal._id} className="card bg-emerald-50 border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3"><MdCheckCircle className="text-2xl text-emerald-500" /><div><p className="text-sm font-bold text-slate-700">{goal.title}</p><p className="text-xs text-slate-400">Rs.{goal.targetAmount.toLocaleString()} — Completed!</p></div></div>
              <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><MdDelete /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
