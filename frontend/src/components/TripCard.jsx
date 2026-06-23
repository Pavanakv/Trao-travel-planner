import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gradientForDestination, monogramForDestination } from '../utils/cardTheme.js';

export default function TripCard({ trip }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const isPlanned = trip.days?.length > 0;
  const tripCode = `VOY-${trip.destination.slice(0, 2).toUpperCase()}-${trip._id.slice(-2).toUpperCase()}`;
  const showPhoto = trip.photoUrl && !photoFailed;

  return (
    <Link
      to={`/trips/${trip._id}`}
      className="stamp-edge bg-paper overflow-hidden hover:-translate-y-0.5 transition-transform block"
    >
      <div className="relative h-24">
        {showPhoto ? (
          <>
            <img
              src={trip.photoUrl}
              alt={trip.destination}
              onError={() => setPhotoFailed(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/30" />
          </>
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientForDestination(trip.destination)} flex items-center justify-center`}
          >
            <span className="font-display text-3xl text-paper/90">
              {monogramForDestination(trip.destination)}
            </span>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-medium ${
            isPlanned ? 'bg-mustard/90 text-ink' : 'bg-paper/80 text-ink/70'
          }`}
        >
          {isPlanned ? 'Planned' : 'Pending'}
        </span>
      </div>

      <div className="p-4">
        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-1">
          {tripCode}
        </p>
        <h3 className="font-display text-lg text-ink mb-1">{trip.destination}</h3>
        <p className="text-xs text-ink/60 mb-2">
          {trip.numDays} Days &middot; <span className="capitalize">{trip.budgetType}</span> Budget
        </p>

        {trip.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {trip.interests.slice(0, 3).map((interest) => (
              <span key={interest} className="text-[10px] bg-teal/15 text-teal px-2 py-0.5 rounded-full">
                #{interest}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-dashed border-ink/15">
          <span className="text-xs font-medium text-stamp">
            {isPlanned ? 'View Plan →' : 'Needs Generation'}
          </span>
        </div>
      </div>
    </Link>
  );
}