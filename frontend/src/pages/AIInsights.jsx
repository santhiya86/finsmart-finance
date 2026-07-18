import { useState, useEffect } from 'react';
import { getSummary, getTransactions } from '../services/api';
import toast from 'react-hot-toast';
import { MdAutoAwesome, MdRefresh, MdTrendingUp, MdLightbulb, MdUpdate } from 'react-icons/md';

function analyzeData(summary, transactions) {
  const { totalIncome, totalExpense, balance, categoryBreakdown } = summary;
  const savingsRate = totalIncome ? ((balance/totalIncome)*100) : 0;
  let score = savingsRate>=30?9:savingsRate>=20?8:savingsRate>=10?7:savingsRate>=0?6:3;
  const scoreReason = savingsRate>=20?`You save ${savingsRate.toFixed(1)}% of income — excellent!`:savingsRate>=0?`You save ${savingsRate.toFixed(1)}% of income. Aim for 20%+.`:`You are spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn.`;
  const sorted = Object.entries(categoryBreakdown||{}).sort(([,a],[,b])=>b-a);
  const top = sorted[0];
  const recurringCount = transactions.filter(t=>t.isRecurring).length;
  const observations = [
    top?`Your biggest expense is ${top[0]} at Rs.${top[1].toLocaleString()} (${totalExpense?((top[1]/totalExpense)*100).toFixed(1):0}% of total spending).`:'Start adding transactions to see insights.',
    savingsRate>=0?`You have saved Rs.${balance.toLocaleString()} overall with a ${savingsRate.toFixed(1)}% savings rate.`:`You are overspending by Rs.${Math.abs(balance).toLocaleString()}.`,
    `You have ${transactions.length} transactions tracked. ${recurringCount} are recurring auto-transactions.`,
  ];
  const tipMap = { Food:'Try meal prepping on weekends. Cooking at home saves up to 60% vs eating out.',Travel:'Book travel in advance and compare prices. Public transport saves significantly.',Rent:'If rent exceeds 30% of income, consider finding a roommate to reduce cost.',Shopping:'Apply the 24-hour rule before purchases to avoid impulse buying.',Entertainment:'Set a fixed monthly entertainment budget and look for free alternatives.',Health:'Preventive checkups are cheaper than treatment. Compare pharmacy prices.',Education:'Look for free online resources before paying for courses.',Utilities:'Unplug devices when not in use. LED lights reduce electricity bills by 15-20%.' };
  const tips = [
    top?(tipMap[top[0]]||`Your top expense is ${top[0]}. Set a budget limit for this category.`):'Set budgets for each category to track spending better.',
    savingsRate<20?`Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You currently save ${Math.max(0,savingsRate).toFixed(1)}%.`:'Great savings rate! Consider investing surplus in SIP mutual funds.',
    'Use Budget Tracker to set monthly limits and get automatic email alerts at 80% usage.',
  ];
  const motivation = savingsRate>=20?'Outstanding financial discipline! Keep this momentum going!':savingsRate>=0?'Every rupee saved today builds a stronger tomorrow!':'Awareness is the first step — you can turn this around!';
  return { score, scoreReason, observations, tips, motivation, generatedAt:new Date().toLocaleTimeString(), transactionCount:transactions.length };
}

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const generateInsights = async (showToast=true) => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([getSummary(), getTransactions()]);
      if (txRes.data.length === 0) { toast.error('Add some transactions first to get insights.'); setLoading(false); return; }
      const result = analyzeData(sumRes.data, txRes.data);
      setInsights(result);
      if (showToast) toast.success('Insights updated!');
    } catch { toast.error('Failed to load data. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => generateInsights(false), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const scoreColor = s => s>=8?'text-emerald-600':s>=5?'text-yellow-500':'text-red-500';
  const scoreBg = s => s>=8?'bg-emerald-50 border-emerald-200':s>=5?'bg-yellow-50 border-yellow-200':'bg-red-50 border-red-200';

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold text-slate-800">🤖 AI Spending Insights</h1><p className="text-slate-500 text-sm mt-0.5">Live analysis of your finances — updates with new transactions</p></div>
      <div className="card text-center py-8">
        <MdAutoAwesome className="text-5xl text-primary-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">{insights?`Insights from ${insights.generatedAt}`:'Analyze My Finances'}</h2>
        <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">Analysis based on {insights?insights.transactionCount:''} transactions including recurring auto-transactions.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => generateInsights(true)} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>:<><MdRefresh className="text-xl" />{insights?'Refresh Insights':'Generate Insights'}</>}
          </button>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${autoRefresh?'bg-emerald-100 text-emerald-700 border border-emerald-200':'bg-slate-100 text-slate-600'}`}>
            <MdUpdate className="text-lg" />{autoRefresh?'Auto-refresh ON':'Auto-refresh OFF'}
          </button>
        </div>
        {autoRefresh && <p className="text-xs text-emerald-600 mt-3 animate-pulse">🔄 Auto-refresh every 30 seconds</p>}
      </div>
      {loading && <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="card animate-pulse"><div className="h-4 bg-slate-200 rounded w-1/3 mb-3" /><div className="space-y-2"><div className="h-3 bg-slate-100 rounded w-full" /><div className="h-3 bg-slate-100 rounded w-5/6" /></div></div>)}</div>}
      {insights && !loading && (
        <div className="space-y-4">
          <div className={`card border ${scoreBg(insights.score)}`}>
            <div className="flex items-center gap-4">
              <div className="text-center flex-shrink-0"><div className={`text-5xl font-bold ${scoreColor(insights.score)}`}>{insights.score}</div><div className="text-xs text-slate-400 mt-1">out of 10</div></div>
              <div><h3 className="text-base font-bold text-slate-800">Financial Health Score</h3><p className="text-sm text-slate-600 mt-1">{insights.scoreReason}</p></div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><MdTrendingUp className="text-xl text-primary-500" /><h3 className="text-base font-bold text-slate-800">Spending Observations</h3></div>
            <div className="space-y-3">{insights.observations.map((obs,i)=>(
              <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                <p className="text-sm text-slate-700">{obs}</p>
              </div>))}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><MdLightbulb className="text-xl text-yellow-500" /><h3 className="text-base font-bold text-slate-800">Money-Saving Tips</h3></div>
            <div className="space-y-3">{insights.tips.map((tip,i)=>(
              <div key={i} className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
                <span className="text-yellow-500 text-lg flex-shrink-0">💡</span>
                <p className="text-sm text-slate-700">{tip}</p>
              </div>))}</div>
          </div>
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
            <div className="flex items-start gap-3"><span className="text-2xl">🌟</span><div><h3 className="text-sm font-bold text-primary-700 mb-1">Financial Motivation</h3><p className="text-sm text-slate-700">{insights.motivation}</p></div></div>
          </div>
          <p className="text-xs text-center text-slate-400">Last updated: {insights.generatedAt} · {insights.transactionCount} transactions · Click Refresh for latest data</p>
        </div>
      )}
    </div>
  );
}
