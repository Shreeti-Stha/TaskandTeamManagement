const EmptyState = ({ title, message }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
    <h3 className="text-lg font-semibold text-ink">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{message}</p>
  </div>
);

export default EmptyState;
