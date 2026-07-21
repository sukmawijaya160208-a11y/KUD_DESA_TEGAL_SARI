'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import ExportDropdown from '@/components/ExportDropdown';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
        <ExportDropdown
          title="Laporan KUD"
          fetchAll={() => api.admin.laporan().then((res) => res)}
          pdfUrl={api.admin.export.laporanPdf()}
          csvUrl={api.admin.export.laporanCsv()}
          filename="laporan-kud"
          renderPrintContent={(data) => `
              <h3 style="font-size:13px;margin-bottom:8px;color:#1e40af;border-bottom:1px solid #e2e8f0;padding-bottom:4px">Pekebun per Status</h3>
              <table class="print-table" style="margin-bottom:16px">
                <thead><tr><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                  ${(data.pekebun_per_status || []).map((s) => `<tr><td>${s.status}</td><td style="font-weight:700">${s.total}</td></tr>`).join('')}
                </tbody>
              </table>

              <h3 style="font-size:13px;margin-bottom:8px;color:#1e40af;border-bottom:1px solid #e2e8f0;padding-bottom:4px">Pendaftaran per Program</h3>
              <table class="print-table" style="margin-bottom:16px">
                <thead><tr><th>Program</th><th>Total Pendaftar</th></tr></thead>
                <tbody>
                  ${(data.pendaftaran_per_program || []).map((p) => `<tr><td>${p.program_kud?.nama || '-'}</td><td style="font-weight:700">${p.total}</td></tr>`).join('')}
                </tbody>
              </table>

              <h3 style="font-size:13px;margin-bottom:8px;color:#1e40af;border-bottom:1px solid #e2e8f0;padding-bottom:4px">Total TBS per Bulan</h3>
              <table class="print-table">
                <thead><tr><th>Bulan</th><th>Total TBS</th></tr></thead>
                <tbody>
                  ${(data.total_tbs_per_bulan || []).map((t) => `<tr><td>${t.bulan}</td><td style="font-weight:700">${Number(t.total).toLocaleString()}</td></tr>`).join('')}
                </tbody>
              </table>
            `}
        />
      </div>
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
