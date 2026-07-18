import { MdEdit, MdDelete, MdRepeat } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { deleteTransaction } from '../services/api';
import toast from 'react-hot-toast';

const categoryColors = {
  Food:'bg-orange-100 text-orange-600',Travel:'bg-blue-100 text-blue-600',Rent:'bg-purple-100 text-purple-600',
  Shopping:'bg-pink-100 text-pink-600',Entertainment:'bg-yellow-100 text-yellow-600',Health:'bg-green-100 text-green-600',
  Education:'bg-indigo-100 text-indigo-600',Utilities:'bg-cyan-100 text-cyan-600',Salary:'bg-emerald-100 text-emerald-600',
  Freelance:'bg-teal-100 text-teal-600',Investment:'bg-violet-100 text-violet-600',Other:'bg-slate-100 text-slate-600',
};

export default function TransactionCard({ transaction, onDelete }) {
  const navigate = useNavigate();
  const handleDelete = async () => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteTransaction(transaction._id); toast.success('Transaction deleted'); onDelete(transaction._id); }
    catch { toast.error('Failed to delete'); }
  };
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${categoryColors[transaction.category] || categoryColors.Other}`}>{transaction.category}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold text-slate-700 truncate">{transaction.title}</p>
            {transaction.isRecurring && <MdRepeat className="text-xs text-blue-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-slate-400">{format(new Date(transaction.date), 'dd MMM yyyy')}{transaction.isRecurring && <span className="ml-1 text-blue-400">🔁</span>}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-2">
        <span className={`text-sm font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
          {transaction.type === 'income' ? '+' : '-'}Rs.{transaction.amount.toLocaleString()}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => navigate(`/edit/${transaction._id}`, { state: { transaction } })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors"><MdEdit className="text-base" /></button>
          <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><MdDelete className="text-base" /></button>
        </div>
      </div>
    </div>
  );
}
