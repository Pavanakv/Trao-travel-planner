import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import DayCard from '../components/DayCard.jsx';
import BudgetCard from '../components/BudgetCard.jsx';
import PackingList from '../components/PackingList.jsx';
import HotelsSection from '../components/HotelsSection.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  async function fetchTrip() {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data.trip);
      // Collapse every day after the first by default, like the mockup
      const collapsed = {};
      (res.data.trip.days || []).forEach((d, i) => {
        if (i > 0) collapsed[d.dayNumber] = true;
      });
      setCollapsedDays(collapsed);
    } catch (err) {
      setError('Could not load this trip.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegeneratePlan() {
    setRegeneratingPlan(true);
    setError('');
    try {
      const res = await api.post(`/trips/${id}/regenerate-plan`);
      setTrip(res.data.trip);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not regenerate the plan. Try again.');
    } finally {
      setRegeneratingPlan(false);
    }
  }

  async function handleRegenerateDay(dayNumber, instruction) {
    setError('');
    try {
      const res = await api.post(`/trips/${id}/days/${dayNumber}/regenerate`, { instruction });
      setTrip(res.data.trip);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not regenerate this day.');
    }
  }

  async function handleAddActivity(dayNumber, activity) {
    setError('');
    try {
      const res = await api.patch(`/trips/${id}/days/${dayNumber}/activities`, {
        action: 'add',
        activity,
      });
      setTrip(res.data.trip);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add activity.');
    }
  }

  async function handleRemoveActivity(dayNumber, activityIndex) {
    setError('');
    try {
      const res = await api.patch(`/trips/${id}/days/${dayNumber}/activities`, {
        action: 'remove',
        activityIndex,
      });
      setTrip(res.data.trip);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove activity.');
    }
  }

  async function handleTogglePacking(index) {
    try {
      const res = await api.patch(`/trips/${id}/packing/${index}`);
      setTrip(res.data.trip);
    } catch (err) {
      setError('Could not update packing item.');
    }
  }

  async function handleAddPackingItem(item) {
    try {
      const res = await api.post(`/trips/${id}/packing`, { item });
      setTrip(res.data.trip);
    } catch (err) {
      setError('Could not add packing item.');
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/trips/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Could not delete trip.');
      setShowDeleteConfirm(false);
    }
  }

  function toggleDayCollapse(dayNumber) {
    setCollapsedDays((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/60">Loading...</div>;
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/60">
        Trip not found.{' '}
        <Link to="/dashboard" className="text-stamp ml-2">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const hasPlan = trip.days && trip.days.length > 0;
  const tripCode = `VOY-${new Date(trip.createdAt).getFullYear()} · GATE-${trip._id.slice(-3).toUpperCase()}`;

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <Link to="/dashboard" className="font-display text-lg text-ink">
          &larr; Voyage
        </Link>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-ink/60 hover:text-stamp">
          Sign out
        </button>
      </header>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="font-mono text-[11px] text-ink/40 uppercase tracking-widest mb-1">{tripCode}</p>
          <h1 className="font-display text-4xl text-ink mb-2">{trip.destination}</h1>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-ink/10 text-ink px-2.5 py-1 rounded-full">{trip.numDays} Days</span>
            <span className="text-xs bg-mustard/30 text-ink px-2.5 py-1 rounded-full capitalize">
              {trip.budgetType} Budget
            </span>
            {trip.interests?.map((interest) => (
              <span key={interest} className="text-xs bg-teal/15 text-teal px-2.5 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm border border-stamp text-stamp px-4 py-2 rounded-sm hover:bg-stamp/10 transition-colors"
        >
          Delete Trip
        </button>
      </div>

      {error && (
        <div className="bg-stamp/10 border border-stamp text-stamp text-sm px-4 py-3 rounded-sm mb-6" role="alert">
          {error}
        </div>
      )}

      {!hasPlan && (
        <div className="border border-stamp/40 bg-stamp/5 rounded-sm p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-ink">Generation failed</p>
            <p className="text-sm text-ink/60">We couldn't connect to the travel database. Please try again.</p>
          </div>
          <button
            onClick={handleRegeneratePlan}
            disabled={regeneratingPlan}
            className="bg-ink text-paper font-medium px-5 py-2 rounded-sm hover:bg-teal transition-colors disabled:opacity-60 shrink-0"
          >
            {regeneratingPlan ? 'Generating...' : 'Generate plan'}
          </button>
        </div>
      )}

      {hasPlan && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-ink">Daily Agenda</h2>
                <button
                  onClick={handleRegeneratePlan}
                  disabled={regeneratingPlan}
                  className="text-xs text-teal font-medium disabled:opacity-60"
                >
                  {regeneratingPlan ? 'Regenerating...' : '↻ Regenerate full plan'}
                </button>
              </div>

              <div className="space-y-4">
                {trip.days.map((day) => (
                  <DayCard
                    key={day.dayNumber}
                    day={day}
                    isCollapsed={collapsedDays[day.dayNumber]}
                    onToggleCollapse={toggleDayCollapse}
                    onAddActivity={handleAddActivity}
                    onRemoveActivity={handleRemoveActivity}
                    onRegenerateDay={handleRegenerateDay}
                  />
                ))}
              </div>
            </section>

            <HotelsSection hotels={trip.hotelSuggestions} />
          </div>

          <div className="space-y-6">
            <BudgetCard budgetEstimate={trip.budgetEstimate} />
            <PackingList
              packingList={trip.packingList}
              onToggle={handleTogglePacking}
              onAdd={handleAddPackingItem}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          destination={trip.destination}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
