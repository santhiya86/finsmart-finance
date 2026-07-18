import { useEffect, useState } from 'react';
import { getBudgets, setBudget, deleteBudget } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdWarning, MdRefresh } from 'react-icons/md';
import { format } from 'date-fns';

const BUDGET_CATEGORIES = ['Food','Travel','Rent','Shopping','Entertainment','Health','Education','Utilities','Other'];
const categoryColors = { Food:'bg-orange-500',Travel:'bg-blue-500',Rent:'bg-purple-500',Shopping:'bg-pink-500',Entertainment:'bg-yellow-500',Health:'bg-green-500',Education:'bg-indigo-500',Utilities:'bg-cyan-500',Other:'bg-slate-500' };

export default function BudgetTracker() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category:'Food', amount:'' });
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(),'yyyy-MM'));

  const fetchBudgets = async () => {
    setLoading(true);
    try { const { data } = await getBudgets(selectedMonth); setBudgets(data); }
    catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [selectedMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Please enter a valid amount'); return; }
    setSaving(true);
    try { await setBudget({ ...form, amount:parseFloat(form.amount), month:selectedMonth }); toast.success(`Budget set for ${form.category}!`); setForm({ category:'Food', amount:'' }); fetchBudgets(); }
    catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try { await deleteBudget(id); toast.success('Budget deleted'); fetchBudgets(); }
    catch { toast.error('Failed to delete'); }
  };

  const totalBudget = budgets.reduce((s,b) => s+b.amount, 0);
  const totalSpent = budgets.reduce((s,b) => s+(b.spent||0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800">💰 Budget Goal Tracker</h1><p className="text-slate-500 text-sm mt-0.5">Set monthly limits — includes all transactions (manual + recurring)</p></div>
        <button onClick={fetchBudgets} className="btn-secondary flex items-center gap-2 self-start"><MdRefresh className="text-lg" />Refresh</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="label">Select Month</label><input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input-field" /></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Total Budget</p><p className="text-xl font-bold text-primary-500">Rs.{totalBudget.toLocaleString()}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Total Spent</p><p className={`text-xl font-bold ${totalSpent>totalBudget?'text-red-500':'text-emerald-600'}`}>Rs.{totalSpent.toLocaleString()}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Categories</p><p className="text-xl font-bold text-slate-600">{budgets.length}</p></div>
      </div>
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 mb-4">Set Budget Limit</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><label className="label">Category</label>
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="input-field">
              {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1"><label className="label">Budget Amount (Rs.)</label><input type="number" placeholder="e.g. 5000" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} className="input-field" min="1" /></div>
          <div className="flex items-end"><button type="submit" className="btn-primary flex items-center gap-2 w-full sm:w-auto" disabled={saving}><MdAdd className="text-xl" />{saving?'Saving...':'Set Budget'}</button></div>
        </form>
      </div>
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 mb-4">Category Budgets — {selectedMonth}</h2>
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          : budgets.length === 0 ? <div className="text-center py-10"><p className="text-slate-400 text-sm">No budgets set for {selectedMonth}</p></div>
          : <div className="space-y-4">{budgets.map(b => {
              const pct = Math.min(b.percentage, 100);
              return (
                <div key={b._id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-3 h-3 rounded-full ${categoryColors[b.category]||'bg-slate-400'}`} />
                      <span className="text-sm font-semibold text-slate-700">{b.category}</span>
                      {b.isExceeded && <span className="flex items-center gap-1 text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full"><MdWarning className="text-sm" />Exceeded!</span>}
                      {b.isWarning && <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full"><MdWarning className="text-sm" />80%+ used</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Rs.{(b.spent||0).toLocaleString()} / Rs.{b.amount.toLocaleString()}</span>
                      <button onClick={() => handleDelete(b._id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><MdDelete className="text-base" /></button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${b.isExceeded?'bg-red-500':b.isWarning?'bg-yellow-400':'bg-emerald-500'}`} style={{width:`${pct}%`}} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-400">{b.percentage}% used</span>
                    <span className="text-xs text-slate-400">{b.isExceeded?`Rs.${((b.spent||0)-b.amount).toLocaleString()} over`:`Rs.${(b.remaining||0).toLocaleString()} remaining`}</span>
                  </div>
                </div>
              );
            })}</div>
        }
      </div>
    </div>
  );
}
