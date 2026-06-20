import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function entryRef() {
  return `VOY-AUTH-${new Date().getFullYear()}`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="stamp-edge bg-paper overflow-hidden">
          {/* Ticket header strip */}
          <div className="bg-ink text-paper px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-paper/60">Carrier</p>
              <p className="font-display text-xl">Voyage</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-paper/60">Entry Ref</p>
              <p className="font-mono text-xs text-mustard">{entryRef()}</p>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-ink/70 mb-6">
              Welcome back. Please verify your identification to continue the journey.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-medium text-ink/60 uppercase tracking-widest mb-1">
                  E-Mail Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="explorer@voyage.world"
                  className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-[11px] font-medium text-ink/60 uppercase tracking-widest mb-1">
                  Secure Keycode
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>

              {error && <p className="text-stamp text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stamp text-paper font-medium py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Verifying...' : 'Confirm Boarding →'}
              </button>

              <p className="text-center text-xs text-ink/40">Forgot Keycode?</p>
            </form>

            <div className="my-6 border-t border-dashed border-ink/20" />

            <p className="text-center text-[11px] uppercase tracking-widest text-ink/50 mb-3">
              New Traveller
            </p>
            <Link
              to="/register"
              className="block text-center w-full border border-ink/30 text-ink font-medium py-2.5 rounded-sm hover:bg-ink/5 transition-colors text-sm"
            >
              Register New Passport
            </Link>
          </div>

          <div className="bg-ink/5 px-6 py-3 flex items-center justify-between text-[10px] text-ink/50 uppercase tracking-wide">
            <span>Gate / Term: 24A · Premier</span>
            <span>Voyage Intl.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
