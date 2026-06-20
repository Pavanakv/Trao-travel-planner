import { useState } from 'react';

export default function DayCard({ day, isCollapsed, onToggleCollapse, onAddActivity, onRemoveActivity, onRegenerateDay }) {
  const [newActivity, setNewActivity] = useState('');
  const [instruction, setInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  async function handleAdd() {
    if (!newActivity.trim()) return;
    await onAddActivity(day.dayNumber, newActivity);
    setNewActivity('');
  }

  async function handleRegenerate() {
    if (!instruction.trim()) return;
    setRegenerating(true);
    await onRegenerateDay(day.dayNumber, instruction);
    setInstruction('');
    setRegenerating(false);
  }

  const dayLabel = day.activities[0]?.split(/[,.]/)[0] || `Day ${day.dayNumber}`;
  const addInputId = `add-activity-day-${day.dayNumber}`;
  const instructionInputId = `instruction-day-${day.dayNumber}`;

  return (
    <div className="stamp-edge bg-paper p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-ink/40">
            Day {String(day.dayNumber).padStart(2, '0')}
          </p>
          <h3 className="font-display text-lg text-ink">{dayLabel}</h3>
        </div>
        <button
          onClick={() => onToggleCollapse(day.dayNumber)}
          className="text-xs text-ink/50 font-medium"
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? 'Show activities' : 'Hide'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <ul className="space-y-2 mb-3">
            {day.activities.map((activity, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-ink/10 text-ink/70 text-[11px] flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{activity}</span>
                <button
                  onClick={() => onRemoveActivity(day.dayNumber, idx)}
                  className="text-stamp text-xs shrink-0"
                  aria-label={`Remove activity: ${activity}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 mb-3">
            <label htmlFor={addInputId} className="sr-only">
              Add an activity to day {day.dayNumber}
            </label>
            <input
              id={addInputId}
              type="text"
              placeholder="Add an activity..."
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 text-sm rounded-sm border border-ink/30 bg-white/60 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <button
              onClick={handleAdd}
              aria-label="Add activity"
              className="text-sm bg-teal text-paper px-3 py-1.5 rounded-sm"
            >
              +
            </button>
          </div>

          <div className="flex gap-2 pt-3 border-t border-dashed border-ink/15">
            <label htmlFor={instructionInputId} className="sr-only">
              Regenerate day {day.dayNumber} with instructions
            </label>
            <input
              id={instructionInputId}
              type="text"
              placeholder="Not vibing? Describe what you want for this day..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
              className="flex-1 text-sm rounded-sm border border-ink/30 bg-white/60 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-mustard"
            />
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              aria-label="Regenerate this day"
              className="text-sm bg-mustard text-ink px-3 py-1.5 rounded-sm disabled:opacity-60 shrink-0"
            >
              {regenerating ? '...' : '↻'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
