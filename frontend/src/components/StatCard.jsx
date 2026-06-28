const StatCard = ({ icon: Icon, label, value, accent = "text-brand" }) => (
  <div className="panel p-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="label">{label}</p>
        <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      </div>
      {Icon && (
        <div className={`rounded-md bg-slate-100 p-3 ${accent}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
