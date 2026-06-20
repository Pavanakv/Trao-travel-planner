import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
          <div className="bg-teal text-paper px-6 py-4 flex items-center justify-between">
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
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
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
