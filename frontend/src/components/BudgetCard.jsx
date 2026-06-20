export default function BudgetCard({ budgetEstimate }) {
  if (!budgetEstimate) return null;

  return (
    <div className="stamp-edge bg-paper overflow-hidden">
      <div className="bg-ink text-paper px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-paper/60">Boarding Pass</p>
        <p className="font-display text-lg">Trip Budget</p>
      </div>
      <div className="p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-ink/60">Flights (Est.)</span>
          <span>${budgetEstimate.flights}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/60">Accommodation</span>
          <span>${budgetEstimate.accommodation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/60">Food &amp; Drink</span>
          <span>${budgetEstimate.food}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink/60">Activities</span>
          <span>${budgetEstimate.activities}</span>
        </div>
        <div className="flex justify-between font-medium text-ink pt-2 border-t border-dashed border-ink/20">
          <span>Total Est.</span>
          <span>${budgetEstimate.total}</span>
        </div>
      </div>
    </div>
  );
}
