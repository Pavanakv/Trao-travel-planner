import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="stamp-edge bg-paper overflow-hidden">
          <div className="bg-indigo text-paper px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-paper/70">Departure</p>
              <p className="font-display text-xl">Voyage</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-paper/70">Gate</p>
              <p className="font-mono text-xs">002</p>
            </div>
          </div>

          <div className="p-6">
            <h2 className="font-display text-lg text-ink mb-1">Register your identity</h2>
            <p className="text-sm text-ink/60 mb-6">
              The final step before your world tour starts here.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-[11px] font-medium text-ink/60 uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Johnathan Traveler"
                  className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-[11px] font-medium text-ink/60 uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="explorer@voyage.world"
                  className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-[11px] font-medium text-ink/60 uppercase tracking-widest mb-1">
                  Vault Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.83 2.83M6.6 6.6C4.5 8 3 10 2 12c1.7 3.4 5 7 10 7 1.8 0 3.4-.4 4.8-1.2M17.4 17.4C19.5 16 21 14 22 12c-.6-1.2-1.4-2.4-2.4-3.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-stamp text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-mustard text-ink font-medium py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Issuing...' : 'Issue My Journal'}
              </button>
            </form>

            <div className="my-6 border-t border-dashed border-ink/20" />

            <p className="text-center text-[11px] uppercase tracking-widest text-ink/50 mb-2">
              Documentation
            </p>
            <p className="text-center text-sm text-ink/70">
              Already an established member?{' '}
              <Link to="/login" className="text-stamp font-medium">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}