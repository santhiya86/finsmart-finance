import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { addTransaction, updateTransaction } from '../services/api';
import toast from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = ['Food','Travel','Rent','Shopping','Entertainment','Health','Education','Utilities','Other'];
const INCOME_CATEGORIES = ['Salary','Freelance','Investment','Other'];

const defaultForm = { title:'', amount:'', type:'expense', category:'Food', date:format(new Date(),'yyyy-MM-dd'), notes:'' };

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && location.state?.transaction) {
      const t = location.state.transaction;
      setForm({ title:t.title, amount:t.amount, type:t.type, category:t.category, date:format(new Date(t.date),'yyyy-MM-dd'), notes:t.notes||'' });
    }
  }, [isEdit]);

  const handleTypeChange = (newType) => setForm(f => ({ ...f, type:newType, category:newType==='income'?INCOME_CATEGORIES[0]:EXPENSE_CATEGORIES[0] }));
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]:e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount:parseFloat(form.amount) };
      if (isEdit) { await updateTransaction(id, payload); toast.success('Transaction updated!'); }
      else { await addTransaction(payload); toast.success('Transaction added!'); }
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"><MdArrowBack className="text-xl" /></button>
        <div><h1 className="text-xl font-bold text-slate-800">{isEdit?'Edit Transaction':'Add Transaction'}</h1><p className="text-sm text-slate-400">{isEdit?'Update the details below':'Record a new income or expense'}</p></div>
      </div>
      <div className="card">
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
          <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${form.type==='expense'?'bg-red-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Expense</button>
          <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${form.type==='income'?'bg-emerald-500 text-white shadow-sm':'text-slate-500 hover:text-slate-700'}`}>Income</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Title *</label><input name="title" placeholder="e.g. Monthly rent" value={form.title} onChange={handleChange} className="input-field" required /></div>
          <div><label className="label">Amount (Rs.) *</label><input name="amount" type="number" placeholder="0.00" min="0.01" step="0.01" value={form.amount} onChange={handleChange} className="input-field" required /></div>
          <div><label className="label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Date *</label><input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" required /></div>
          <div><label className="label">Notes (optional)</label><textarea name="notes" placeholder="Any additional details..." value={form.notes} onChange={handleChange} rows={3} className="input-field resize-none" /></div>
          {form.amount && (
            <div className={`p-4 rounded-xl text-center ${form.type==='income'?'bg-emerald-50':'bg-red-50'}`}>
              <p className="text-xs text-slate-500 mb-1">You are adding</p>
              <p className={`text-2xl font-bold ${form.type==='income'?'text-emerald-600':'text-red-500'}`}>{form.type==='income'?'+':'-'}Rs.{parseFloat(form.amount||0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">{form.title||'Transaction'} · {form.category}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading?'Saving...':isEdit?'Update':'Add Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
