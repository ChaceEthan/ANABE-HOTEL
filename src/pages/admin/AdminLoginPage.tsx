import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import type { User } from '../../types/hotel.ts';
import { Logo } from '../../components/Logo.tsx';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E2DED4] p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <Logo className="h-10 w-auto max-w-[220px] mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
            Management Portal
          </h1>
          <p className="text-xs text-[#7A7870]">
            Secure staff, manager, and owner management console.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="staff@anabehotel.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
              />
              <Mail className="w-4 h-4 text-[#8C8A82] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-[#737169] block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded focus:outline-none focus:border-[#B89667]"
              />
              <Lock className="w-4 h-4 text-[#8C8A82] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1A1A18] hover:bg-[#B89667] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Role-Based Login Hints */}
        <div className="pt-4 border-t border-[#ECE8DE] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A18]">
            <KeyRound className="w-3.5 h-3.5 text-[#B89667]" />
            <span>Staff Login Accounts</span>
          </div>

          <div className="space-y-1.5 text-xs text-[#66655E]">
            <p>Sign in with the credentials provided by hotel management:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-[#8A8880]">
              <li><strong>Owner</strong> — Full hotel control, finances, and user management</li>
              <li><strong>Manager</strong> — Operations, rooms, bookings, and facilities</li>
              <li><strong>Reception</strong> — Bookings and guest check-in/check-out</li>
              <li><strong>Housekeeping</strong> — Room cleaning status updates</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateHome}
            className="text-xs text-[#7A7870] hover:text-[#1A1A18] underline cursor-pointer"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
