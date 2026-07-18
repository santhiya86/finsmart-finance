import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, getSummary, getBudgets, processRecurring } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TransactionCard from '../components/TransactionCard';
import { MdAccountBalanceWallet, MdTrendingUp, MdTrendingDown, MdAdd, MdFilterList, MdWarning, MdAutoAwesome, MdTrackChanges, MdRepeat, MdClose } from 'react-icons/md';

const CATEGORIES = ['All','Food','Travel','Rent','Shopping','Entertainment','Health','Education','Utilities','Salary','Freelance','Investment','Other'];

function StatCard({ label, amount, icon: Icon, color, bg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`text-2xl ${color}`} /></div>
      <div><p className="text-xs text-slate-400 font-medium">{label}</p><p className={`text-xl font-bold ${color}`}>Rs.{Number(amount||0).toLocaleString()}</p></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome:0, totalExpense:0, balance:0 });
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterType !== 'All') params.type = filterType.toLowerCase();
      if (filterStart) params.startDate = filterStart;
      if (filterEnd) params.endDate = filterEnd;
      const [txRes, sumRes, budgetRes] = await Promise.all([getTransactions(params), getSummary(), getBudgets()]);
      setTransactions(txRes.data);
      setSummary(sumRes.data);
      setBudgetAlerts(budgetRes.data.filter(b => b.percentage >= 80));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterCategory, filterType, filterStart, filterEnd]);

  useEffect(() => { processRecurring().catch(() => {}); fetchData(); }, [fetchData]);

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t._id !== id));
    getSummary().then(r => setSummary(r.data)).catch(() => {});
    getBudgets().then(r => setBudgetAlerts(r.data.filter(b => b.percentage >= 80))).catch(() => {});
  };

  const visibleAlerts = budgetAlerts.filter(b => !dismissedAlerts.has(b._id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800">Hello, {user?.name?.split(' ')[0]} 👋</h1><p className="text-slate-500 text-sm mt-0.5">Here's your financial summary</p></div>
        <button onClick={() => navigate('/add')} className="btn-primary flex items-center gap-2 self-start sm:self-auto"><MdAdd className="text-xl" />Add Transaction</button>
      </div>

      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map(b => (
            <div key={b._id} className={`flex items-center gap-3 p-4 rounded-xl border ${b.isExceeded ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <MdWarning className={`text-xl flex-shrink-0 ${b.isExceeded ? 'text-red-500' : 'text-yellow-500'}`} />
              <p className="text-sm font-medium text-slate-700 flex-1 cursor-pointer" onClick={() => navigate('/budget')}>
                {b.isExceeded ? `🔴 ${b.category} budget exceeded by Rs.${(b.spent-b.amount).toLocaleString()}! (${b.percentage}% used)` : `⚠️ ${b.category} budget at ${b.percentage}% — Rs.${b.spent.toLocaleString()} of Rs.${b.amount.toLocaleString()} used`}
              </p>
              <button onClick={() => setDismissedAlerts(prev => new Set([...prev, b._id]))} className="p-1 rounded-lg hover:bg-white/50 text-slate-400 hover:text-slate-600 flex-shrink-0"><MdClose className="text-lg" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Balance" amount={summary.balance} icon={MdAccountBalanceWallet} color={summary.balance>=0?'text-primary-500':'text-red-500'} bg={summary.balance>=0?'bg-primary-50':'bg-red-50'} />
        <StatCard label="Total Income" amount={summary.totalIncome} icon={MdTrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Total Expense" amount={summary.totalExpense} icon={MdTrendingDown} color="text-red-500" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{to:'/budget',icon:MdTrackChanges,color:'text-purple-500',bg:'bg-purple-50',label:'Budget Tracker',sub:'Set spending limits'},
          {to:'/recurring',icon:MdRepeat,color:'text-blue-500',bg:'bg-blue-50',label:'Recurring',sub:'Auto transactions'},
          {to:'/ai-insights',icon:MdAutoAwesome,color:'text-primary-500',bg:'bg-primary-50',label:'AI Insights',sub:'Smart advice'}
        ].map(({to,icon:Icon,color,bg,label,sub}) => (
          <div key={to} onClick={() => navigate(to)} className="card cursor-pointer hover:shadow-md transition-all flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`text-xl ${color}`} /></div>
            <div><p className="text-sm font-semibold text-slate-700">{label}</p><p className="text-xs text-slate-400">{sub}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><MdFilterList className="text-slate-400 text-xl" /><h2 className="text-sm font-semibold text-slate-700">Filters</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="label">Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field"><option>All</option><option>Income</option><option>Expense</option></select></div>
          <div><label className="label">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">From</label><input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="input-field" /></div>
          <div><label className="label">To</label><input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="input-field" /></div>
        </div>
        {(filterCategory!=='All'||filterType!=='All'||filterStart||filterEnd) && (
          <button onClick={() => {setFilterCategory('All');setFilterType('All');setFilterStart('');setFilterEnd('');}} className="mt-3 text-xs text-primary-500 hover:underline font-medium">Clear all filters</button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-slate-800">Recent Transactions</h2><span className="text-xs text-slate-400">{transactions.length} records</span></div>
        {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          : transactions.length === 0 ? <div className="text-center py-12"><p className="text-slate-400 text-sm">No transactions found</p><button onClick={() => navigate('/add')} className="mt-3 btn-primary text-sm">Add your first transaction</button></div>
          : <div className="space-y-2">{transactions.map(t => <TransactionCard key={t._id} transaction={t} onDelete={handleDelete} />)}</div>}
      </div>
    </div>
  );
}
