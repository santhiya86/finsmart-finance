import { useEffect, useState } from 'react';
import { getRecurring, addRecurring, toggleRecurring, deleteRecurring } from '../services/api';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdPause, MdPlayArrow, MdRepeat } from 'react-icons/md';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = ['Food','Travel','Rent','Shopping','Entertainment','Health','Education','Utilities','Other'];
const INCOME_CATEGORIES = ['Salary','Freelance','Investment','Other'];
const frequencyColors = { daily:'bg-blue-100 text-blue-600', weekly:'bg-purple-100 text-purple-600', monthly:'bg-emerald-100 text-emerald-600' };
const defaultForm = { title:'', amount:'', type:'expense', category:'Food', frequency:'monthly', startDate:format(new Date(),'yyyy-MM-dd'), notes:'' };

export default function RecurringTransactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try { const { data } = await getRecurring(); setItems(data); }
    catch { toast.error('Failed to load recurring transactions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleTypeChange = (newType) => setForm(f => ({...f, type:newType, category:newType==='income'?INCOME_CATEGORIES[0]:EXPENSE_CATEGORIES[0]}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) { toast.error('Please fill all required fields'); return; }
    setSaving(true);
    try { await addRecurring({...form, amount:parseFloat(form.amount)}); toast.success('Recurring transaction added! First entry created in transactions.'); setForm(defaultForm); setShowForm(false); fetchItems(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try { await toggleRecurring(id); toast.success('Status updated'); fetchItems(); }
    catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    try { await deleteRecurring(id); toast.success('Deleted'); fetchItems(); }
    catch { toast.error('Failed to delete'); }
  };

  const categories = form.type==='income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const activeCount = items.filter(i => i.isActive).length;
  const monthlyIncome = items.filter(i=>i.isActive&&i.type==='income'&&i.frequency==='monthly').reduce((s,i)=>s+i.amount,0);
  const monthlyExpense = items.filter(i=>i.isActive&&i.type==='expense'&&i.frequency==='monthly').reduce((s,i)=>s+i.amount,0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800">🔄 Recurring Transactions</h1><p className="text-slate-500 text-sm mt-0.5">Auto-add transactions on a schedule — visible in transaction list</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 self-start sm:self-auto"><MdAdd className="text-xl" />Add Recurring</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Active</p><p className="text-2xl font-bold text-primary-500">{activeCount}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Monthly Auto-Income</p><p className="text-2xl font-bold text-emerald-600">Rs.{monthlyIncome.toLocaleString()}</p></div>
        <div className="card text-center"><p className="text-xs text-slate-400 mb-1">Monthly Auto-Expense</p><p className="text-2xl font-bold text-red-500">Rs.{monthlyExpense.toLocaleString()}</p></div>
      </div>

      {showForm && (
        <div className="card border-2 border-primary-100">
          <h2 className="text-base font-bold text-slate-800 mb-4">New Recurring Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type==='expense'?'bg-red-500 text-white shadow-sm':'text-slate-500'}`}>Expense</button>
              <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type==='income'?'bg-emerald-500 text-white shadow-sm':'text-slate-500'}`}>Income</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Title *</label><input name="title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Monthly Salary" className="input-field" required /></div>
              <div><label className="label">Amount (Rs.) *</label><input name="amount" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" min="1" className="input-field" required /></div>
              <div><label className="label">Category *</label><select name="category" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="input-field">{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="label">Frequency *</label><select name="frequency" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} className="input-field"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
              <div><label className="label">Start Date</label><input name="startDate" type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} className="input-field" /></div>
              <div><label className="label">Notes (optional)</label><input name="notes" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes..." className="input-field" /></div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700">ℹ️ First transaction created immediately and visible in transaction list with 🔁 tag.</div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1" disabled={saving}>{saving?'Saving...':'Add Recurring'}</button></div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-base font-bold text-slate-800 mb-4">All Recurring Transactions</h2>
        {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          : items.length===0 ? <div className="text-center py-10"><MdRepeat className="text-4xl text-slate-300 mx-auto mb-2" /><p className="text-slate-400 text-sm">No recurring transactions yet</p></div>
          : <div className="space-y-3">{items.map(item=>(
              <div key={item._id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.isActive?'bg-white border-slate-100':'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.isActive?'bg-primary-50':'bg-slate-100'}`}><MdRepeat className={`text-xl ${item.isActive?'text-primary-500':'text-slate-400'}`} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${frequencyColors[item.frequency]}`}>{item.frequency}</span>
                      <span className="text-xs text-slate-400">{item.category}</span>
                      <span className="text-xs text-slate-400">since {format(new Date(item.startDate),'dd MMM yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className={`text-sm font-bold whitespace-nowrap ${item.type==='income'?'text-emerald-600':'text-red-500'}`}>{item.type==='income'?'+':'-'}Rs.{item.amount.toLocaleString()}</span>
                  <button onClick={() => handleToggle(item._id)} className={`p-1.5 rounded-lg transition-colors ${item.isActive?'hover:bg-yellow-50 text-yellow-500':'hover:bg-emerald-50 text-emerald-500'}`} title={item.isActive?'Pause':'Resume'}>
                    {item.isActive?<MdPause className="text-base" />:<MdPlayArrow className="text-base" />}
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><MdDelete className="text-base" /></button>
                </div>
              </div>
            ))}</div>
        }
      </div>
    </div>
  );
}
