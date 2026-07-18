import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdAccountBalanceWallet, MdEmail, MdLock, MdPerson, MdCheckCircle } from 'react-icons/md';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    const result = await register(form.name, form.email, form.password);
    if (result.success) { setSuccess(true); toast.success('Account created! Please login.'); setTimeout(() => navigate('/login'), 2000); }
    else toast.error(result.message);
  };
  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="card text-center py-12 w-full max-w-md">
        <MdCheckCircle className="text-6xl text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created!</h2>
        <p className="text-slate-500 text-sm">Redirecting to login...</p>
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/30 mb-4">
            <MdAccountBalanceWallet className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FinSmart Finance</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account to get started</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative"><MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative"><MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative"><MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} className="input-field pl-10" required />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length >= 6 && <p className="text-xs text-emerald-500 mt-1">✓ Passwords match</p>}
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}<Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
