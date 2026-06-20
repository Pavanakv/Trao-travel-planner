import { useState } from 'react';

export default function PackingList({ packingList, onToggle, onAdd }) {
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  if (!packingList) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAdding(true);
    await onAdd(newItem);
    setNewItem('');
    setAdding(false);
  }

  return (
    <div className="stamp-edge bg-paper p-4">
      <h3 className="font-display text-lg text-ink mb-3">Packing List</h3>

      <ul className="space-y-2 mb-3">
        {packingList.map((item, idx) => {
          const inputId = `packing-item-${idx}`;
          return (
            <li key={idx} className="flex items-center gap-3 text-sm">
              <input
                id={inputId}
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggle(idx)}
                className="accent-teal"
              />
              <label htmlFor={inputId} className={item.checked ? 'line-through text-ink/40' : ''}>
                {item.item}
              </label>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-dashed border-ink/15">
        <label htmlFor="new-packing-item" className="sr-only">
          Add a packing item
        </label>
        <input
          id="new-packing-item"
          type="text"
          placeholder="+ Add item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 text-sm rounded-sm border border-ink/30 bg-white/60 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal"
        />
        <button
          type="submit"
          disabled={adding}
          aria-label="Add packing item"
          className="text-sm bg-teal text-paper px-3 py-1.5 rounded-sm disabled:opacity-60"
        >
          +
        </button>
      </form>
    </div>
  );
}
