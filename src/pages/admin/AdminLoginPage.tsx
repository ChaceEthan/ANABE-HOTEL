import React, { useState } from 'react';
import { api, setStoredToken } from '../../lib/api.ts';
import { Logo } from '../../components/Logo.tsx';
import type { User } from '../../types/hotel.ts';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

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
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E2DED4] p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-block mx-auto cursor-pointer focus:outline-none"
            title="Return to ANABE HOTEL Homepage"
          >
            <Logo size="lg" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
              Management Portal
            </h1>
            <p className="text-xs text-[#7A7870] mt-1">
              Secure staff, manager, and owner management console.
            </p>
          </div>
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

        {/* Quick Demo Credentials Helper */}
        <div className="pt-4 border-t border-[#ECE8DE] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A18]">
            <KeyRound className="w-3.5 h-3.5 text-[#B89667]" />
            <span>Quick Login Role Selection (Pre-seeded Accounts)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickDemo('owner@anabehotel.com', 'Owner@Anabe2026!')}
              className="p-2 text-left bg-[#FAF9F5] hover:bg-[#F2ECE0] border border-[#E0DCD2] rounded transition-colors cursor-pointer"
            >
              <div className="font-bold text-[#1A1A18]">1. OWNER</div>
              <div className="text-[10px] text-[#7A7870]">Full control & finances</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('manager@anabehotel.com', 'Manager@Anabe2026!')}
              className="p-2 text-left bg-[#FAF9F5] hover:bg-[#F2ECE0] border border-[#E0DCD2] rounded transition-colors cursor-pointer"
            >
              <div className="font-bold text-[#1A1A18]">2. MANAGER</div>
              <div className="text-[10px] text-[#7A7870]">Operations & rooms</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('reception@anabehotel.com', 'Staff@Anabe2026!')}
              className="p-2 text-left bg-[#FAF9F5] hover:bg-[#F2ECE0] border border-[#E0DCD2] rounded transition-colors cursor-pointer"
            >
              <div className="font-bold text-[#1A1A18]">3. RECEPTION</div>
              <div className="text-[10px] text-[#7A7870]">Bookings & check-in</div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('housekeeping@anabehotel.com', 'Clean@Anabe2026!')}
              className="p-2 text-left bg-[#FAF9F5] hover:bg-[#F2ECE0] border border-[#E0DCD2] rounded transition-colors cursor-pointer"
            >
              <div className="font-bold text-[#1A1A18]">4. HOUSEKEEPING</div>
              <div className="text-[10px] text-[#7A7870]">Room cleaning status</div>
            </button>
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
