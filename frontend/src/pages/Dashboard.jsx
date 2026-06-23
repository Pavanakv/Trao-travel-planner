import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import TopNav from '../components/TopNav.jsx';
import TripCard from '../components/TripCard.jsx';

const INTEREST_OPTIONS = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'Nightlife'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [numDays, setNumDays] = useState(3);
  const [budgetType, setBudgetType] = useState('medium');
  const [interests, setInterests] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const res = await api.get('/trips');
      setTrips(res.data.trips);
    } catch (err) {
      setError('Could not load your trips.');
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post('/trips', { destination, numDays: Number(numDays), budgetType, interests });
      navigate(`/trips/${res.data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create trip.');
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <TopNav />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">
            VOY-{new Date().getFullYear()} / BOARDING
          </p>
          <h1 className="font-display text-2xl text-ink">Your Field Journals</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-indigo text-paper text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          {showForm ? 'Cancel' : '+ New Trip'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="stamp-edge bg-paper p-6 mb-8 space-y-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-ink mb-1">
              Destination
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Tokyo, Japan"
              className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="numDays" className="block text-sm font-medium text-ink mb-1">
                Number of days
              </label>
              <input
                id="numDays"
                type="number"
                min={1}
                max={30}
                value={numDays}
                onChange={(e) => setNumDays(e.target.value)}
                className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="budgetType" className="block text-sm font-medium text-ink mb-1">
                Budget
              </label>
              <select
                id="budgetType"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="w-full rounded-sm border border-ink/30 bg-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-ink mb-2">Interests</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  aria-pressed={interests.includes(interest)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                    interests.includes(interest)
                      ? 'bg-mustard border-mustard text-ink'
                      : 'border-ink/30 text-ink/70'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-stamp text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-stamp text-paper font-medium py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {creating ? 'Generating your itinerary...' : 'Save trip'}
          </button>
          <p className="text-xs text-ink/50 text-center">
            We'll generate your itinerary, budget, hotels, and packing list right after you save - this can take a few seconds.
          </p>
        </form>
      )}

      {loading ? (
        <p className="text-ink/60">Loading your trips...</p>
      ) : trips.length === 0 ? (
        <div className="stamp-edge bg-paper p-10 text-center">
          <p className="font-display text-xl text-ink mb-2">A blank page in your passport</p>
          <p className="text-ink/60 text-sm">Add your first trip to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}