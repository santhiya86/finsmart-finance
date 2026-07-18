import { useState } from 'react';
import { getTransactions, getSummary } from '../services/api';
import toast from 'react-hot-toast';
import { MdDownload, MdPictureAsPdf, MdTableChart } from 'react-icons/md';
import { format } from 'date-fns';

export default function ExportData() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const fetchData = async () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const [txRes, sumRes] = await Promise.all([getTransactions(params), getSummary()]);
    return { transactions: txRes.data, summary: sumRes.data };
  };

  const exportCSV = async () => {
    setLoadingCSV(true);
    try {
      const { transactions } = await fetchData();
      if (transactions.length === 0) { toast.error('No transactions found'); return; }
      const headers = ['Title','Amount','Type','Category','Date','Notes'];
      const rows = transactions.map(t => [`"${t.title.replace(/"/g,'""')}"`,t.amount,t.type,t.category,format(new Date(t.date),'dd-MM-yyyy'),`"${(t.notes||'').replace(/"/g,'""')}"`]);
      const csv = [headers.join(','),...rows.map(r=>r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download=`expense-report-${format(new Date(),'dd-MM-yyyy')}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`CSV downloaded! ${transactions.length} transactions exported.`);
    } catch (err) { toast.error(err.response?.data?.message||'Failed to export CSV'); }
    finally { setLoadingCSV(false); }
  };

  const exportPDF = async () => {
    setLoadingPDF(true);
    try {
      const { transactions, summary } = await fetchData();
      if (transactions.length === 0) { toast.error('No transactions found'); return; }
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Expense Report</title>
        <style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{color:#4f6ef7}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:9px 10px;text-align:left;font-size:11px;color:#64748b}td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:12px}.badge{padding:2px 8px;border-radius:5px;font-size:10px;font-weight:bold}</style>
        </head><body>
        <h1>💰 FinSmart Finance — Expense Report</h1>
        <p>Generated: ${format(new Date(),'dd MMM yyyy')}${startDate?` | From: ${startDate}`:''}${endDate?` To: ${endDate}`:''}</p>
        <div style="display:flex;gap:12px;margin:20px 0">
          ${[['Balance',`Rs.${(summary.balance||0).toLocaleString()}`,'#4f6ef7'],['Income',`+Rs.${(summary.totalIncome||0).toLocaleString()}`,'#10b981'],['Expense',`-Rs.${(summary.totalExpense||0).toLocaleString()}`,'#ef4444'],['Transactions',transactions.length,'#64748b']].map(([l,v,c])=>`<div style="flex:1;background:#f8fafc;border-radius:8px;padding:12px;text-align:center"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px">${l}</div><div style="font-size:18px;font-weight:bold;color:${c}">${v}</div></div>`).join('')}
        </div>
        <table><thead><tr><th>#</th><th>Title</th><th>Category</th><th>Date</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${transactions.map((t,i)=>`<tr><td>${i+1}</td><td>${t.title}${t.isRecurring?' 🔁':''}</td><td>${t.category}</td><td>${format(new Date(t.date),'dd MMM yyyy')}</td><td><span class="badge" style="background:${t.type==='income'?'#d1fae5':'#fee2e2'};color:${t.type==='income'?'#059669':'#dc2626'}">${t.type}</span></td><td style="text-align:right;font-weight:bold;color:${t.type==='income'?'#10b981':'#ef4444'}">${t.type==='income'?'+':'-'}Rs.${t.amount.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table><script>window.onload=function(){window.print();}</script></body></html>`;
      const blob = new Blob([html],{type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url,'_blank','width=900,height=700');
      if (!newWin) { const a=document.createElement('a'); a.href=url; a.download=`expense-report-${format(new Date(),'dd-MM-yyyy')}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast.success('Report downloaded! Open the HTML file and press Ctrl+P to save as PDF.'); }
      else { toast.success('Print dialog opened. Select "Save as PDF" to download.'); }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) { toast.error(err.response?.data?.message||'Failed to export PDF'); }
    finally { setLoadingPDF(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-slate-800">📤 Export Data</h1><p className="text-slate-500 text-sm mt-0.5">Download your transactions as CSV or PDF</p></div>
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 mb-4">Select Date Range (Optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">From Date</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="input-field" /></div>
          <div><label className="label">To Date</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="input-field" /></div>
        </div>
        {(startDate||endDate) && <button onClick={() => {setStartDate('');setEndDate('');}} className="mt-3 text-xs text-primary-500 hover:underline">Clear dates (export all)</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card text-center hover:shadow-md transition-shadow">
          <MdTableChart className="text-5xl text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Export as CSV</h3>
          <p className="text-xs text-slate-400 mb-4">Opens in Excel or Google Sheets with all transaction details.</p>
          <button onClick={exportCSV} disabled={loadingCSV} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all disabled:opacity-60">
            <MdDownload className="text-xl" />{loadingCSV?'Preparing...':'Download CSV'}
          </button>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <MdPictureAsPdf className="text-5xl text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Export as PDF</h3>
          <p className="text-xs text-slate-400 mb-4">Printable report with summary stats and full transaction table.</p>
          <button onClick={exportPDF} disabled={loadingPDF} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all disabled:opacity-60">
            <MdDownload className="text-xl" />{loadingPDF?'Preparing...':'Download PDF'}
          </button>
        </div>
      </div>
     
      
    </div>
  );
}
