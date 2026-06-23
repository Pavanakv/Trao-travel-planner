import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
      <Link to="/dashboard" className="font-display text-xl text-ink">
        Voyage
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-ink/70">{user?.name}</span>
        <button onClick={logout} className="text-sm text-stamp font-medium">
          Sign out
        </button>
      </div>
    </header>
  );
}