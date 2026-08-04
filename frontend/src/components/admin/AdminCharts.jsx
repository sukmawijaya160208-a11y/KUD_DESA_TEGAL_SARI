'use client';

import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatDate, formatNumberId } from '@/lib/date';

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
const AREA_GRADIENT = { g1: '#3B82F6', g2: '#93C5FD' };

export function AreaChartWidget({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data TBS</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="tbsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={AREA_GRADIENT.g1} stopOpacity={0.3} />
            <stop offset="95%" stopColor={AREA_GRADIENT.g2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="bulan" tickFormatter={(v) => v?.slice(-2) + '/' + v?.slice(2, 4)} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E9EDEF', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          labelFormatter={(v) => formatDate(v + '-01', 'MMMM yyyy')}
           formatter={(v) => [formatNumberId(v) + ' kg', 'TBS']}
        />
        <Area type="monotone" dataKey="total" stroke={AREA_GRADIENT.g1} strokeWidth={2} fill="url(#tbsGradient)" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChartWidget({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Belum ada data</p>;
  const total = data.reduce((s, d) => s + Number(d.total), 0) || 1;
  const labels = { verified: 'Terverifikasi', pending: 'Pending', rejected: 'Ditolak' };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} animationDuration={1000}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E9EDEF' }}
            formatter={(v) => [formatNumberId(v) + ' pekebun', '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-sm">
        {data.map((d, i) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-500 w-24">{labels[d.status] || d.status}</span>
            <span className="font-semibold text-foreground">{d.total}</span>
            <span className="text-gray-400 text-xs">({((d.total / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
