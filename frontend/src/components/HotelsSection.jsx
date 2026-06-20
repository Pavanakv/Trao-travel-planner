export default function HotelsSection({ hotels }) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl text-ink mb-4">Recommended Stays</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {hotels.map((hotel, idx) => (
          <div key={idx} className="stamp-edge bg-paper overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-teal/30 to-mustard/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-ink/50 font-medium">
                {hotel.tier}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-ink text-sm mb-1">{hotel.name}</h3>
              <p className="text-xs text-ink/60">{hotel.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
