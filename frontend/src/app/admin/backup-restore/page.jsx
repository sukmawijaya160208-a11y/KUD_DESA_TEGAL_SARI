'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon, ShieldCheckIcon, DocumentTextIcon,
  ClockIcon, CircleStackIcon, CloudArrowDownIcon,
} from '@heroicons/react/24/outline';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function formatNumber(n) {
  return (n || 0).toLocaleString('id-ID');
}

export default function BackupRestorePage() {
  const toast = useToast();
  const restoreRef = useRef(null);

  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreParsed, setRestoreParsed] = useState(null);
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.admin.backupRestore.backup();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_kud_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Backup berhasil — ${formatNumber(res.metadata.total_records)} record`);
    } catch (err) {
      toast.error('Backup gagal: ' + err.message);
    }
    setBackupLoading(false);
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRestoreFile(file);
    setRestoreParsed(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.data || !data.metadata) {
          toast.error('Format file backup tidak valid');
          setRestoreFile(null);
          return;
        }
        setRestoreParsed(data);
      } catch {
        toast.error('Gagal membaca file backup');
        setRestoreFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restoreParsed) return;
    setRestoreLoading(true);
    try {
      const res = await api.admin.backupRestore.restore({ data: restoreParsed.data });
      toast.success(res.message);
      setRestoreParsed(null);
      setRestoreFile(null);
    } catch (err) {
      toast.error('Restore gagal: ' + err.message);
    }
    setRestoreLoading(false);
  };

  const handleReset = async () => {
    if (resetConfirm !== 'RESET') return;
    setResetLoading(true);
    try {
      const res = await api.admin.backupRestore.resetData('RESET');
      toast.success(res.message);
      setResetConfirm('');
    } catch (err) {
      toast.error('Reset gagal: ' + err.message);
    }
    setResetLoading(false);
  };

  const totalRecords = restoreParsed?.metadata?.total_records || 0;
  const tableList = restoreParsed?.metadata?.tables || [];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <CircleStackIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-heading font-bold text-foreground">Backup & Restore</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola cadangan data KUD. Download backup, restore dari file, atau reset data dengan aman.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
                <CircleStackIcon className="w-3.5 h-3.5 text-primary" />
                <span><strong className="text-foreground">12</strong> tabel</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
                <DocumentTextIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Format <strong className="text-foreground">JSON</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Termasuk <strong className="text-foreground">metadata</strong></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Backup & Restore Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Card */}
        <motion.div variants={fadeUp}>
          <Card className="relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <CloudArrowDownIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">Download Backup</h2>
                  <p className="text-sm text-gray-500">Cadangan seluruh data KUD dalam satu file</p>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 space-y-2 text-sm text-gray-600 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>10 tabel termasuk users, pekebun, lahan, program, TBS</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Format JSON — portable dan mudah diverifikasi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Dilengkapi metadata (versi, timestamp, jumlah record)</span>
                </div>
              </div>

              <Button onClick={handleBackup} loading={backupLoading} className="w-full">
                <ArrowDownTrayIcon className="w-4 h-4" />
                {backupLoading ? 'Menyiapkan backup...' : 'Download Backup'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Restore Card */}
        <motion.div variants={fadeUp}>
          <Card className="relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <ArrowUpTrayIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">Restore Backup</h2>
                  <p className="text-sm text-gray-500">Pulihkan data dari file backup .json</p>
                </div>
              </div>

              {!restoreParsed ? (
                <div
                  onClick={() => restoreRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer group"
                >
                  <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-300 group-hover:text-emerald-400 transition-colors mb-3" />
                  <p className="text-sm font-medium text-foreground">Pilih file backup</p>
                  <p className="text-xs text-gray-400 mt-1">Format .json — Drag & drop atau klik</p>
                  {restoreFile && (
                    <p className="text-xs text-emerald-600 mt-2 font-medium truncate max-w-[250px] mx-auto">{restoreFile.name}</p>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/50 rounded-xl p-4 space-y-2 border border-emerald-100">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircleIcon className="w-4 h-4 shrink-0" />
                    <span className="font-medium">File backup valid</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CircleStackIcon className="w-3.5 h-3.5" />
                      <span>{formatNumber(totalRecords)} record</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      <span>{tableList.length} tabel</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tableList.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <input ref={restoreRef} type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />

              <div className="flex gap-2">
                {restoreParsed && (
                  <Button variant="ghost" onClick={() => { setRestoreParsed(null); setRestoreFile(null); }} className="flex-1" disabled={restoreLoading}>
                    <XCircleIcon className="w-4 h-4" /> Batal
                  </Button>
                )}
                {restoreParsed && (
                  <Button onClick={handleRestore} loading={restoreLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    {restoreLoading ? 'Merestorasi...' : `Restore ${formatNumber(totalRecords)} Record`}
                  </Button>
                )}
                {!restoreParsed && restoreFile && (
                  <Button variant="ghost" onClick={() => { setRestoreFile(null); restoreRef.current.value = ''; }} className="flex-1">
                    <XCircleIcon className="w-4 h-4" /> Hapus
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Reset Data Card — Danger Zone */}
      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden border-destructive/20">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
          <div className="relative space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-lg shadow-destructive/20 shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-heading font-bold text-foreground">Zona Berbahaya</h2>
                  <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold rounded uppercase tracking-wider">Destructive</span>
                </div>
                <p className="text-sm text-gray-500">Hapus semua data transaksional dari sistem. Tindakan ini <strong className="text-destructive">tidak dapat dibatalkan</strong>.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-destructive/5 rounded-xl p-4 space-y-2 border border-destructive/10">
                <h4 className="text-sm font-semibold text-foreground">Yang akan dihapus:</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  {['Semua pekebun & lahannya', 'Program KUD & pendaftaran', 'Riwayat TBS & harga TBS', 'Notifikasi & verifikasi log', 'User non-admin'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><XCircleIcon className="w-3.5 h-3.5 text-destructive/60 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 space-y-2 border border-emerald-100">
                <h4 className="text-sm font-semibold text-foreground">Yang tetap aman:</h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  {['Akun Admin tetap utuh', 'Pengaturan aplikasi', 'Sesi login tidak terganggu'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500/60 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Ketik <strong className="text-destructive">RESET</strong> untuk konfirmasi</label>
                <input
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  placeholder='Ketik "RESET" disini...'
                  className="w-full px-4 py-2.5 rounded-xl border border-destructive/30 bg-white text-sm focus:ring-2 focus:ring-destructive/30 focus:border-destructive outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <Button
                onClick={handleReset}
                loading={resetLoading}
                disabled={resetConfirm !== 'RESET'}
                variant="danger"
                className="shrink-0"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                {resetLoading ? 'Mereset...' : 'Reset Semua Data'}
              </Button>
            </div>

            <div className="flex items-center gap-2 px-1">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] text-gray-400">Backup data terlebih dahulu sebelum reset untuk menghindari kehilangan data.</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div variants={fadeUp} className="text-center py-4">
        <p className="text-xs text-gray-400">
          <ShieldCheckIcon className="w-3.5 h-3.5 inline mr-1" />
          Semua operasi backup & restore menggunakan database transaction untuk menjaga integritas data.
        </p>
      </motion.div>
    </motion.div>
  );
}
