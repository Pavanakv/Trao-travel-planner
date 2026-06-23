import { useState } from 'react';

function HotelCard({ hotel }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = hotel.photoUrl && !photoFailed;

  return (
    <div className="stamp-edge bg-paper overflow-hidden">
      <div className="h-20 relative">
        {showPhoto ? (
          <img
            src={hotel.photoUrl}
            alt={`${hotel.tier} stay`}
            onError={() => setPhotoFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal/30 to-mustard/30" />
        )}
        <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-ink/70 font-medium bg-paper/40">
          {hotel.tier}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-ink text-sm mb-1">{hotel.name}</h3>
        <p className="text-xs text-ink/60">{hotel.note}</p>
      </div>
    </div>
  );
}

export default function HotelsSection({ hotels }) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl text-ink mb-4">Recommended Stays</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {hotels.map((hotel, idx) => (
          <HotelCard key={idx} hotel={hotel} />
        ))}
      </div>
    </section>
  );
}