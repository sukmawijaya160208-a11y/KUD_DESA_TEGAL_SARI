'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-gray-600 w-28 text-right">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-800 w-16">{value}</span>
    </div>
  );
}

export default function AdminLaporanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.laporan().then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const maxPekebun = Math.max(...(data.pekebun_per_status?.map((d) => d.total) || [1]));
  const maxProgram = Math.max(...(data.pendaftaran_per_program?.map((d) => d.total) || [1]));
  const maxTbs = Math.max(...(data.total_tbs_per_bulan?.map((d) => Number(d.total)) || [1]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Pekebun per Status">
          <div className="space-y-1">
            {data.pekebun_per_status?.map((d) => (
              <Bar key={d.status} label={d.status} value={d.total} max={maxPekebun} color="bg-kud-green" />
            ))}
          </div>
        </Card>
        <Card title="Pendaftaran per Program">
          <div className="space-y-1">
            {data.pendaftaran_per_program?.map((d) => (
              <Bar key={d.program_kud_id} label={d.program_kud?.nama || 'N/A'} value={d.total} max={maxProgram} color="bg-kud-gold" />
            ))}
          </div>
        </Card>
        <Card title="Total TBS per Bulan" className="lg:col-span-2">
          {data.total_tbs_per_bulan?.length > 0 ? (
            <div className="space-y-1">
              {data.total_tbs_per_bulan?.map((d) => (
                <Bar key={d.bulan} label={d.bulan} value={Number(d.total)} max={maxTbs} color="bg-blue-500" />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data TBS</p>
          )}
        </Card>
      </div>
    </div>
  );
}
