"use client";

type Point = { label: string; value: number };

export function LineChart({ data }: { data: Point[] }) {
  const width = 640;
  const height = 240;
  const padding = 24;
  const max = Math.max(...data.map((point) => point.value), 1);
  const points = data
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - (point.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Health progress chart" className="h-60 w-full rounded-2xl bg-slate-50 p-2">
        <polyline fill="none" stroke="#059669" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {data.map((point, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
          const y = height - padding - (point.value / max) * (height - padding * 2);
          return <circle key={point.label} cx={x} cy={y} r="5" fill="#059669" />;
        })}
      </svg>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
        {data.map((point) => <div key={point.label}>{point.label}</div>)}
      </div>
    </div>
  );
}
