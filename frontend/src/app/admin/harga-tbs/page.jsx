'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import {
  CurrencyDollarIcon, PlusIcon, PencilIcon, TrashIcon,
  CalendarDaysIcon, CheckCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDate, todayStr } from '@/lib/date';

const KELAS = { A: 'Tandan Buah Segar A', B: 'Tandan Buah Segar B', C: 'Tandan Buah Segar C' };

const COLORS = {
  A: { dot: 'bg-emerald-500', border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'text-emerald-600' },
  B: { dot: 'bg-amber-500', border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'text-amber-600' },
  C: { dot: 'bg-sky-500', border: 'border-l-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', label: 'text-sky-600' },
};

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function stateOf(item) {
  const t = todayStr();
  if (item.dari_tanggal <= t && (!item.sampai_tanggal || item.sampai_tanggal >= t)) return 'active';
  if (item.dari_tanggal > t) return 'upcoming';
  return 'expired';
}

function BadgeState({ s }) {
  const m = {
    active: { icon: CheckCircleIcon, label: 'Aktif', cls: 'bg-green-50 text-green-700 border-green-200' },
    upcoming: { icon: ClockIcon, label: 'Akan Datang', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    expired: { icon: ClockIcon, label: 'Kadaluarsa', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  };
  const c = m[s];
  const Icon = c.icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${c.cls}`}><Icon className="w-3 h-3" />{c.label}</span>;
}

export default function AdminHargaTbsPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [sub, setSub] = useState(false);
  const [tab, setTab] = useState('ALL');
  const [f, setF] = useState({ kelas: 'A', harga_per_kg: '', dari_tanggal: todayStr(), sampai_tanggal: '', keterangan: '' });

  useEffect(() => {
    api.admin.hargaTbs.list().then(d => setData(d.data || [])).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, [toast]);

  const openAdd = () => { setEdit(null); setF({ kelas: 'A', harga_per_kg: '', dari_tanggal: todayStr(), sampai_tanggal: '', keterangan: '' }); setShow(true); };
  const openEdit = (item) => { setEdit(item); setF({ kelas: item.kelas, harga_per_kg: String(item.harga_per_kg), dari_tanggal: item.dari_tanggal, sampai_tanggal: item.sampai_tanggal || '', keterangan: item.keterangan || '' }); setShow(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (f.sampai_tanggal && f.sampai_tanggal < f.dari_tanggal) { toast.error('Tanggal selesai harus setelah tanggal mulai'); return; }
    setSub(true);
    try {
      const p = { ...f, sampai_tanggal: f.sampai_tanggal || null };
      if (edit) { await api.admin.hargaTbs.update(edit.id, p); toast.success('Harga diperbarui'); }
      else { await api.admin.hargaTbs.create(p); toast.success('Harga ditambahkan'); }
      setShow(false); api.admin.hargaTbs.list().then(d => setData(d.data || [])).catch(() => {});
    } catch (err) { toast.error(err.message); } finally { setSub(false); }
  };

  const hapus = async () => {
    if (!del) return;
    try { await api.admin.hargaTbs.delete(del.id); toast.success('Harga dihapus'); setDel(null); api.admin.hargaTbs.list().then(d => setData(d.data || [])).catch(() => {}); }
    catch (err) { toast.error(err.message); }
  };

  const aktif = {};
  const upcoming = [];
  const expired = [];
  data.forEach((item) => {
    const s = stateOf(item);
    if (s === 'active') {
      if (!aktif[item.kelas] || item.dari_tanggal > aktif[item.kelas].dari_tanggal) aktif[item.kelas] = item;
    } else if (s === 'upcoming') upcoming.push(item);
    else expired.push(item);
  });

  const riwayat = [...upcoming, ...expired].filter((item) => tab === 'ALL' || item.kelas === tab);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <CurrencyDollarIcon className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Update Harga TBS</h1>
            <p className="text-xs text-gray-500">Atur harga TBS per kelas dengan periode berlaku</p>
          </div>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <PlusIcon className="w-4 h-4" /> Tambah Harga
        </Button>
      </div>

      {/* 3 KELAS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {['A', 'B', 'C'].map((k) => {
          const a = aktif[k];
          const c = COLORS[k];
          return (
            <div key={k} className={`bg-white rounded-xl border border-border border-l-4 ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-semibold ${c.label}`}>{KELAS[k]}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${a ? c.dot : 'bg-gray-200'}`} />
              </div>
              {a ? (
                <>
                  <div className="text-2xl font-bold text-foreground tracking-tight mb-1">{rupiah(a.harga_per_kg)}</div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <CalendarDaysIcon className="w-3 h-3" />
                    {formatDate(a.dari_tanggal)} — {a.sampai_tanggal ? formatDate(a.sampai_tanggal) : '∞'}
                  </p>
                  {a.keterangan && <p className="text-[10px] text-gray-400 mt-2 line-clamp-1">{a.keterangan}</p>}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-border">
                    <button onClick={() => openEdit(a)} className={`flex items-center gap-1 px-2.5 py-1.5 ${c.bg} ${c.text} rounded-lg text-[10px] font-medium hover:opacity-80 transition-all cursor-pointer`}>
                      <PencilIcon className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setDel(a)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium hover:opacity-80 transition-all cursor-pointer">
                      <TrashIcon className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-gray-300 text-sm">Belum ada harga</p>
                  <button onClick={openAdd} className="mt-2 text-xs text-primary font-medium hover:underline cursor-pointer">Tambah Harga</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RIWAYAT TAB */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Riwayat Harga</h2>
          <div className="flex gap-1">
            {['ALL', 'A', 'B', 'C'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${tab === t ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t === 'ALL' ? 'Semua' : <><span className="sm:hidden">{t}</span><span className="hidden sm:inline">{KELAS[t]}</span></>}
              </button>
            ))}
          </div>
        </div>

        {riwayat.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Belum ada riwayat harga</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {riwayat.map((item) => {
              const s = stateOf(item);
              const c = COLORS[item.kelas];
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <div className="w-28 shrink-0">
                    <span className="text-xs font-medium text-gray-600">{KELAS[item.kelas]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${s === 'expired' ? 'text-gray-400 line-through' : 'text-foreground'}`}>{rupiah(item.harga_per_kg)}</span>
                    <span className="text-[11px] text-gray-400 ml-3">
                      <CalendarDaysIcon className="w-3 h-3 inline mr-0.5 align-text-bottom" />
                      {friendly(item.dari_tanggal)} — {item.sampai_tanggal ? friendly(item.sampai_tanggal) : '∞'}
                    </span>
                    {item.keterangan && <span className="text-[10px] text-gray-400 ml-2 hidden sm:inline">{item.keterangan}</span>}
                  </div>
                  <BadgeState s={s} />
                  <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDel(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      <Modal open={show} onClose={() => setShow(false)} title={edit ? 'Edit Harga TBS' : 'Tambah Harga Baru'} maxWidth="md">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Kelas" value={f.kelas} onChange={(e) => setF({ ...f, kelas: e.target.value })} required>
            <option value="A">Tandan Buah Segar A</option>
            <option value="B">Tandan Buah Segar B</option>
            <option value="C">Tandan Buah Segar C</option>
          </Select>
          <Input label="Harga per Kg (Rp)" type="number" step="any" min="0" placeholder="Contoh: 2500"
            value={f.harga_per_kg} onChange={(e) => setF({ ...f, harga_per_kg: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Periode Berlaku</label>
            <div className="grid grid-cols-2 gap-3">
              <DatePicker label="Dari" value={f.dari_tanggal} onChange={(v) => setF({ ...f, dari_tanggal: v })} />
              <DatePicker label="Sampai" value={f.sampai_tanggal} onChange={(v) => setF({ ...f, sampai_tanggal: v })} helperText="Kosongkan jika tak terbatas" />
            </div>
          </div>
          <Textarea label="Keterangan" rows={2} placeholder="Opsional" value={f.keterangan} onChange={(e) => setF({ ...f, keterangan: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={sub}>{edit ? 'Simpan' : 'Tambah'}</Button>
            <Button variant="secondary" type="button" onClick={() => setShow(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL HAPUS */}
      <Modal open={!!del} onClose={() => setDel(null)} title="Hapus Harga" maxWidth="sm">
        {del && (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-700 font-medium">Hapus harga ini?</p>
            <p className="text-lg font-bold text-foreground mt-2">{rupiah(del.harga_per_kg)}</p>
            <p className="text-xs text-gray-400 mt-1">{KELAS[del.kelas]} — {formatDate(del.dari_tanggal)}{del.sampai_tanggal ? ` — ${formatDate(del.sampai_tanggal)}` : ''}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <Button variant="danger" onClick={hapus}>Ya, Hapus</Button>
          <Button variant="secondary" onClick={() => setDel(null)}>Batal</Button>
        </div>
      </Modal>
    </div>
  );
}
