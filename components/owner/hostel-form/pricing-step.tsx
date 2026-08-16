'use client';

export function PricingStep({ data, updateData, onContinue, onBack }: any) {
  // Logic here could be to set global hostel deposit or other pricing details
  // but currently bed prices are set in RoomsBedsStep.
  // We can use this to review pricing or set additional fees.
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-lg font-bold text-navy">Additional Pricing & Fees</h2>
        <p className="text-xs text-mist">Set any additional fees or deposits required for your hostel.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy uppercase tracking-wider">Security Deposit (MK)</label>
          <input
            type="number"
            value={data.deposit || ''}
            onChange={(e) => updateData({ deposit: e.target.value })}
            placeholder="e.g. 15,000"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-navy"
          />
          <p className="mt-1.5 text-[10px] text-slate-400 italic">One-time refundable deposit paid by students.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-navy uppercase tracking-wider">Other Fees (Optional)</label>
          <input
            type="text"
            value={data.otherFees || ''}
            onChange={(e) => updateData({ otherFees: e.target.value })}
            placeholder="e.g. Water fee: K2,000 per semester"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-navy"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          className="rounded-lg bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-dark shadow-lg shadow-navy/10"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
