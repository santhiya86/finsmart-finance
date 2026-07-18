import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdAddCircleOutline, MdBarChart, MdLogout, MdMenu, MdClose, MdAccountBalanceWallet, MdTrackChanges, MdDownload, MdRepeat, MdAutoAwesome, MdFlag } from 'react-icons/md';

const navItems = [
  { to: '/', label: 'Dashboard', icon: MdDashboard, end: true },
  { to: '/add', label: 'Add Transaction', icon: MdAddCircleOutline },
  { to: '/reports', label: 'Reports', icon: MdBarChart },
  { to: '/budget', label: 'Budget Tracker', icon: MdTrackChanges },
  { to: '/goals', label: 'Goal Planner', icon: MdFlag },
  { to: '/recurring', label: 'Recurring', icon: MdRepeat },
  
  { to: '/export', label: 'Export Data', icon: MdDownload },
  { to: '/ai-insights', label: 'AI Insights', icon: MdAutoAwesome },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-primary-500 font-bold text-lg"><MdAccountBalanceWallet className="text-2xl" /><span>FinSmart</span></div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">{open ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}</button>
      </div>
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-slate-100 flex flex-col p-4 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 text-primary-500 font-bold text-xl px-2 py-2 mt-1">
          <MdAccountBalanceWallet className="text-3xl" />
          <div><div className="leading-tight">FinSmart</div><div className="text-slate-400 font-normal text-xs leading-tight">Finance Dashboard</div></div>
        </div>
        <nav className="flex-1 space-y-0.5 mt-4 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
              <Icon className="text-xl flex-shrink-0" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden"><p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p><p className="text-xs text-slate-400 truncate">{user?.email}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <MdLogout className="text-xl" />Logout
          </button>
        </div>
      </aside>
      <div className="lg:hidden h-14" />
    </>
  );
}
