import { useEffect, useState } from 'react';
import { getSummary, getTransactions } from '../services/api';
import { PieChartBox, BarChartBox } from '../components/ChartBox';
import { format } from 'date-fns';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterMonth) {
          params.startDate = `${filterMonth}-01`;
          const [y,m] = filterMonth.split('-').map(Number);
          params.endDate = `${filterMonth}-${new Date(y,m,0).getDate()}`;
        }
        const [sumRes, txRes] = await Promise.all([getSummary(), getTransactions(params)]);
        setSummary(sumRes.data); setTransactions(txRes.data);
      } catch(err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAll();
  }, [filterMonth]);

  if (loading) return <div className="space-y-6"><div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2].map(i => <div key={i} className="card h-80 animate-pulse bg-slate-100" />)}</div></div>;

  const expenses = transactions.filter(t => t.type==='expense');
  const filteredIncome = transactions.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const filteredExpense = expenses.reduce((s,t) => s+t.amount, 0);
  const filteredBalance = filteredIncome - filteredExpense;
  const savingsRate = filteredIncome ? (((filteredIncome-filteredExpense)/filteredIncome)*100).toFixed(1) : 0;
  const categoryBreakdown = {};
  expenses.forEach(t => { categoryBreakdown[t.category] = (categoryBreakdown[t.category]||0)+t.amount; });
  const pieData = Object.entries(categoryBreakdown).map(([name,value]) => ({name,value}));
  const barData = Object.entries(summary?.monthly||{}).sort(([a],[b]) => a.localeCompare(b)).slice(-6).map(([key,val]) => ({month:key.slice(5),income:val.income||0,expense:val.expense||0}));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1><p className="text-slate-500 text-sm mt-0.5">Includes all transactions (manual + recurring 🔁)</p></div>
        <div><label className="label">Filter by Month</label>
          <div className="flex gap-2">
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="input-field" />
            {filterMonth && <button onClick={() => setFilterMonth('')} className="btn-secondary text-xs px-3">Clear</button>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[['Total Income','text-emerald-600',`+Rs.${filteredIncome.toLocaleString()}`],['Total Expense','text-red-500',`-Rs.${filteredExpense.toLocaleString()}`],['Balance',filteredBalance>=0?'text-primary-500':'text-red-500',`Rs.${filteredBalance.toLocaleString()}`],['Savings Rate',savingsRate>=0?'text-primary-500':'text-red-500',`${savingsRate}%`]].map(([label,color,val]) => (
          <div key={label} className="card text-center"><p className="text-xs text-slate-400 font-medium mb-1">{label}</p><p className={`text-2xl font-bold ${color}`}>{val}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-base font-bold text-slate-800 mb-1">Spending by Category</h2><p className="text-xs text-slate-400 mb-4">{filterMonth?`Expenses for ${filterMonth}`:'All time expense categories'}</p><PieChartBox data={pieData} /></div>
        <div className="card"><h2 className="text-base font-bold text-slate-800 mb-1">Monthly Trend</h2><p className="text-xs text-slate-400 mb-4">Last 6 months income vs expense</p><BarChartBox data={barData} /></div>
      </div>
      {pieData.length > 0 && (
        <div className="card"><h2 className="text-base font-bold text-slate-800 mb-4">Category Breakdown</h2>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100"><th className="text-left py-2 text-slate-400 font-medium">Category</th><th className="text-right py-2 text-slate-400 font-medium">Amount</th><th className="text-right py-2 text-slate-400 font-medium">Share</th></tr></thead>
            <tbody>{pieData.sort((a,b) => b.value-a.value).map(({name,value}) => (
              <tr key={name} className="border-b border-slate-50">
                <td className="py-2.5 font-medium text-slate-700">{name}</td>
                <td className="py-2.5 text-right text-red-500 font-semibold">Rs.{value.toLocaleString()}</td>
                <td className="py-2.5 text-right text-slate-400">{filteredExpense?((value/filteredExpense)*100).toFixed(1):0}%</td>
              </tr>))}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
