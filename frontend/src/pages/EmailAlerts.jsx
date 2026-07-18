import { useState } from 'react';
import { sendMonthlySummary } from '../services/api';
import toast from 'react-hot-toast';
import {
  MdBarChart, MdCheckCircle, MdAutoAwesome,
  MdNotifications, MdSend, MdWarning,
} from 'react-icons/md';

const MONTHS = [
  { value:1, label:'January' },{ value:2, label:'February' },{ value:3, label:'March' },
  { value:4, label:'April' },{ value:5, label:'May' },{ value:6, label:'June' },
  { value:7, label:'July' },{ value:8, label:'August' },{ value:9, label:'September' },
  { value:10, label:'October' },{ value:11, label:'November' },{ value:12, label:'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function EmailAlerts() {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sentSummary, setSentSummary] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleSendSummary = async () => {
    setLoadingSummary(true);
    setSentSummary(false);
    setSuccessMessage('');
    try {
      const { data } = await sendMonthlySummary({
        month: selectedMonth,
        year: selectedYear,
      });
      setSuccessMessage(data.message);
      setSentSummary(true);
      setShowSelector(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Failed to send. Check GMAIL_USER and GMAIL_APP_PASS in Render Environment Variables.'
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  const selectedMonthName = MONTHS.find(m => m.value === selectedMonth)?.label;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📧 Email Alerts</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Automatic and manual email notifications for your finances
        </p>
      </div>

      {/* Automatic Budget Alert explanation */}
      <div className="card border-2 border-primary-100 bg-primary-50">
        <div className="flex items-center gap-2 mb-3">
          <MdAutoAwesome className="text-xl text-primary-500" />
          <h2 className="text-base font-bold text-primary-700">🤖 Automatic Budget Alerts</h2>
        </div>
        <div className="space-y-2">
          <div className="flex gap-3 p-3 bg-white rounded-xl">
            <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">!</span>
            <div>
              <p className="text-sm text-slate-700 font-medium">⚠️ Warning at 80%</p>
              <p className="text-xs text-slate-500 mt-0.5">When you add an expense and spending reaches 80% of your budget — email sent automatically</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-white rounded-xl">
            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">!</span>
            <div>
              <p className="text-sm text-slate-700 font-medium">🔴 Alert at 100%</p>
              <p className="text-xs text-slate-500 mt-0.5">When spending exceeds 100% of budget — budget exceeded email sent automatically</p>
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-xs text-emerald-700 font-medium">
            ✅ No button needed! Budget alert emails are sent automatically to each user's registered email when they add an expense that crosses the threshold.
          </p>
        </div>
      </div>

      {/* How automatic alert works */}
      <div className="card bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <MdWarning className="text-xl text-yellow-500" />
          <h2 className="text-sm font-bold text-slate-700">How Automatic Alert Works</h2>
        </div>
        <div className="space-y-2">
          {[
            ['1', 'Set a budget in Budget Tracker (e.g. Food = Rs.5000)', 'bg-primary-500'],
            ['2', 'Add any Food expense transaction', 'bg-primary-500'],
            ['3', 'System checks: total Food spent ÷ Rs.5000 budget', 'bg-primary-500'],
            ['4', 'If result ≥ 80% → Email sent automatically to your inbox', 'bg-yellow-500'],
            ['5', 'If result ≥ 100% → Budget exceeded email sent automatically', 'bg-red-500'],
          ].map(([num, text, color]) => (
            <div key={num} className="flex gap-3 items-start">
              <span className={`w-6 h-6 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{num}</span>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Summary — manual send */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MdNotifications className="text-xl text-slate-500" />
          <h2 className="text-base font-bold text-slate-800">Monthly Financial Report</h2>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${sentSummary ? 'bg-emerald-100' : 'bg-primary-50'}`}>
              {sentSummary
                ? <MdCheckCircle className="text-3xl text-emerald-500" />
                : <MdBarChart className="text-3xl text-primary-500" />}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-800 mb-1">Send Monthly Summary</h3>
              <p className="text-sm text-slate-400 mb-4">
                Select a month and year to receive a complete financial report — total income, expenses, balance, category breakdown and all transactions — in your registered email.
              </p>
              <button
                onClick={() => { setShowSelector(true); setSentSummary(false); setSuccessMessage(''); }}
                disabled={loadingSummary}
                className="btn-primary flex items-center gap-2"
              >
                <MdBarChart className="text-lg" />
                Send Monthly Summary
              </button>
              {sentSummary && (
                <p className="text-xs text-emerald-600 mt-3 font-medium">✅ {successMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Month Year Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Select Month & Year</h2>
            <p className="text-sm text-slate-400 mb-5">
              Choose which month's report to send to your registered email.
            </p>
            <div className="mb-4">
              <label className="label">Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="input-field"
              >
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="label">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="input-field"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="bg-primary-50 rounded-xl p-3 mb-5 text-center border border-primary-100">
              <p className="text-xs text-slate-500 mb-1">Email subject will be:</p>
              <p className="text-sm font-semibold text-primary-700">
                Your Monthly Expense Report – {selectedMonthName} {selectedYear}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSelector(false)}
                className="btn-secondary flex-1"
                disabled={loadingSummary}
              >
                Cancel
              </button>
              <button
                onClick={handleSendSummary}
                disabled={loadingSummary}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loadingSummary
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                  : <><MdSend className="text-lg" />Send Report</>}
              </button>
            </div>
            {loadingSummary && (
              <p className="text-xs text-center text-slate-400 mt-3 animate-pulse">
                Generating your report and sending email. Please wait...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success message box */}
      {sentSummary && successMessage && (
        <div className="card bg-emerald-50 border-emerald-200 flex items-center gap-3">
          <MdCheckCircle className="text-2xl text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </div>
      )}

    
    </div>
  );
}
