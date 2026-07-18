import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdAccountBalanceWallet, MdEmail, MdLock } from 'react-icons/md';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) { toast.success('Welcome back!'); navigate('/'); }
    else toast.error(result.message);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <MdAccountBalanceWallet className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FinSmart Finance</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your finances</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Welcome back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
