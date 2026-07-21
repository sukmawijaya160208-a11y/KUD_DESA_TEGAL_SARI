'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import * as XLSX from 'xlsx';
import { useLogo } from '@/hooks/useLogo';
import { useToast } from '@/components/ToastProvider';
import { formatDate, formatRelative } from '@/lib/date';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import DateRangePicker from '@/components/ui/DateRangePicker';
import Badge from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import {
  UserGroupIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon,
  FunnelIcon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon,
  ChevronRightIcon, DocumentArrowDownIcon, TrashIcon,
  ExclamationTriangleIcon, ArrowPathIcon, PencilSquareIcon,
  UsersIcon, UserIcon, PhoneIcon, PhotoIcon, ShieldCheckIcon,
  CheckCircleIcon, MapPinIcon, ClipboardDocumentListIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';

  const ROLE_STYLES = {
    admin: 'bg-blue-100 text-blue-700 ring-blue-300',
    verifikator: 'bg-purple-100 text-purple-700 ring-purple-300',
    pekebun: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
  };

const STATUS_BADGE = {
  verified: <Badge status="verified" />,
  rejected: <Badge status="rejected" />,
  pending: <Badge status="pending" />,
};
const STATUS_LABEL = { verified: 'Terverifikasi', rejected: 'Ditolak', pending: 'Menunggu', default: '-' };

const PAGE_SIZES = [10, 25, 50, 100];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500'];
  return colors[Math.abs(hash) % colors.length];
}

function exportToExcel(users) {
  if (!users.length) return;
  const headers = ['Nama', 'Email', 'Role', 'Status Pekebun', 'NIK', 'No KK', 'No WhatsApp', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Tanggal Daftar'];
  const data = users.map(u => ({
    Nama: u.name || '',
    Email: u.email || '',
    Role: u.role || '',
    'Status Pekebun': STATUS_LABEL[u.pekebun?.status] || '-',
    NIK: u.pekebun?.nik || '',
    'No KK': u.pekebun?.no_kk || '',
    'No WhatsApp': u.pekebun?.no_whatsapp || '',
    'Tempat Lahir': u.pekebun?.tempat_lahir || '',
    'Tanggal Lahir': u.pekebun?.tanggal_lahir || '',
    Alamat: u.pekebun?.alamat || '',
    'Tanggal Daftar': u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : '',
  }));
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length * 2, 18) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  XLSX.writeFile(wb, `users_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function AdminUsersPage() {
  const toast = useToast();
  const searchRef = useRef(null);

  // --- Data ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // --- Filters ---
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // --- Sort ---
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // --- Pagination ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [gotoPage, setGotoPage] = useState('');

  // --- Selection ---
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkRoleModal, setBulkRoleModal] = useState(false);
  const [bulkRole, setBulkRole] = useState('pekebun');

  // --- CRUD ---
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'pekebun' });

  // --- Expansion ---
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expansionTab, setExpansionTab] = useState({});
  const [expansionCache, setExpansionCache] = useState({});

  // --- Detail Modal Tab ---
  const [detailTab, setDetailTab] = useState('info');

  // --- Import Excel ---
  const [importModal, setImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importRef = useRef(null);

  // --- Image Preview ---
  const [previewImage, setPreviewImage] = useState(null);

    // === LOAD DATA ===
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    api.admin.users.list()
      .then(d => { if (!cancelled) { setData(d.data || []); setDataError(null); } })
      .catch((e) => { if (!cancelled) { setDataError(e.message); toast.error(e.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, refreshKey]);

  const handleRetry = () => {
    setLoading(true);
    setDataError(null);
    reload();
  };

  // === DERIVED DATA ===
  const filtered = useMemo(() => {
    return data.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        if (!u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q) && !u.pekebun?.nik?.includes(search)) return false;
      }
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus && u.pekebun?.status !== filterStatus) return false;
      if (filterDateFrom && u.created_at && new Date(u.created_at) < new Date(filterDateFrom)) return false;
      if (filterDateTo && u.created_at) {
        const end = new Date(filterDateTo);
        end.setDate(end.getDate() + 1);
        if (new Date(u.created_at) > end) return false;
      }
      return true;
    });
  }, [data, search, filterRole, filterStatus, filterDateFrom, filterDateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va, vb;
      switch (sortKey) {
        case 'name': va = a.name?.toLowerCase(); vb = b.name?.toLowerCase(); break;
        case 'email': va = a.email?.toLowerCase(); vb = b.email?.toLowerCase(); break;
        case 'role': va = a.role; vb = b.role; break;
        case 'status': va = a.pekebun?.status || ''; vb = b.pekebun?.status || ''; break;
        case 'nik': va = a.pekebun?.nik || ''; vb = b.pekebun?.nik || ''; break;
        case 'no_whatsapp': va = a.pekebun?.no_whatsapp || ''; vb = b.pekebun?.no_whatsapp || ''; break;
        case 'lahan': va = (a.pekebun?.lahan?.length) || 0; vb = (b.pekebun?.lahan?.length) || 0; break;
        case 'program': va = (a.pekebun?.pendaftaranProgram?.length) || 0; vb = (b.pekebun?.pendaftaranProgram?.length) || 0; break;
        case 'tbs': va = (a.pekebun?.tbsSyncs?.length) || 0; vb = (b.pekebun?.tbsSyncs?.length) || 0; break;
        case 'created_at': va = a.created_at || ''; vb = b.created_at || ''; break;
        default: va = a.created_at || ''; vb = b.created_at || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  // === STATS ===
  const stats = useMemo(() => {
    const total = data.length;
    const roles = { admin: 0, verifikator: 0, pekebun: 0 };
    const statuses = { verified: 0, pending: 0, rejected: 0, none: 0 };
    data.forEach(u => {
      if (roles[u.role] !== undefined) roles[u.role]++;
      const s = u.pekebun?.status;
      if (s && statuses[s] !== undefined) statuses[s]++;
      else if (!s) statuses.none++;
    });
    const verifiedRate = roles.pekebun ? Math.round((statuses.verified / roles.pekebun) * 100) : 0;
    return { total, ...roles, ...statuses, verifiedRate };
  }, [data]);
  const [now] = useState(() => Date.now());
  const newUsers = data.filter(u => u.created_at && now - new Date(u.created_at).getTime() < 30 * 86400000).length;

  // === SORT HANDLER ===
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const renderSortIcon = (column) => {
    if (sortKey !== column) return <ArrowUpIcon className="w-3 h-3 text-gray-300 group-hover:text-gray-400" />;
    return sortDir === 'asc'
      ? <ArrowUpIcon className="w-3 h-3 text-primary" />
      : <ArrowDownIcon className="w-3 h-3 text-primary" />;
  };

  const renderSortHeader = (column, children, className) => (
    <th className={`text-left py-3 px-3 font-semibold text-foreground/70 group cursor-pointer select-none ${className || ''}`} onClick={() => toggleSort(column)}>
      <div className="flex items-center gap-1">
        {children}
        {renderSortIcon(column)}
      </div>
    </th>
  );

  // === SELECTION ===
  const allSelected = paged.length > 0 && paged.every(u => selected.has(u.id));
  const someSelected = paged.some(u => selected.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paged.forEach(u => next.delete(u.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      paged.forEach(u => next.add(u.id));
      setSelected(next);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // === EXPANSION ===
  const toggleExpand = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedRows(next);
    if (!expansionTab[id]) setExpansionTab(p => ({ ...p, [id]: 'info' }));
  };

  const loadExtraData = async (userId, type) => {
    const cacheKey = `${userId}_${type}`;
    if (expansionCache[cacheKey]) return;
    try {
      let result;
      if (type === 'lahan') {
        const all = await api.admin.lahan.list();
        result = Array.isArray(all) ? all.filter(l => l.user_id === userId || l.pekebun?.user_id === userId) : [];
      } else if (type === 'pendaftaran') {
        const all = await api.admin.pendaftaran.list();
        result = Array.isArray(all) ? all.filter(p => p.pekebun?.user_id === userId) : [];
      } else if (type === 'tbs') {
        const all = await api.admin.tbs.list();
        result = Array.isArray(all) ? all.filter(t => t.user_id === userId || t.pekebun?.user_id === userId) : [];
      }
      setExpansionCache(p => ({ ...p, [cacheKey]: result || [] }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // === BULK ACTIONS ===
  const handleBulkDelete = async () => {
    setSubmitting(true);
    const ids = [...selected];
    let success = 0;
    for (const id of ids) {
      try { await api.admin.users.delete(id); success++; } catch (e) { toast.error(`Gagal hapus user #${id}: ${e.message}`); }
    }
    toast.success(`${success} user berhasil dihapus`);
    setBulkDeleteModal(false);
    clearSelection();
    reload();
    setSubmitting(false);
  };

  const handleBulkRole = async () => {
    setSubmitting(true);
    const ids = [...selected];
    let success = 0;
    for (const id of ids) {
      try { await api.admin.users.update(id, { role: bulkRole }); success++; } catch (e) { toast.error(`Gagal ubah role user #${id}: ${e.message}`); }
    }
    toast.success(`Role ${success} user berhasil diubah`);
    setBulkRoleModal(false);
    clearSelection();
    reload();
    setSubmitting(false);
  };

  // === CRUD HANDLERS ===
  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.admin.users.create(form); toast.success('User berhasil ditambahkan'); setCreateModal(false); setForm({ name: '', email: '', password: '', role: 'pekebun' }); reload(); } catch (err) { toast.error(err.message); }
    setSubmitting(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.admin.users.update(editModal.id, editModal); toast.success('User berhasil diperbarui'); setEditModal(null); reload(); } catch (err) { toast.error(err.message); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try { await api.admin.users.delete(deleteModal.id); toast.success('User berhasil dihapus'); setDeleteModal(null); reload(); } catch (err) { toast.error(err.message); }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        if (!rows.length) { toast.error('File Excel kosong'); return; }
        setImportData(rows);
      } catch (err) {
        toast.error('Gagal membaca file: ' + err.message);
        setImportData(null);
      }
    };
    reader.onerror = () => { toast.error('Gagal membaca file'); };
    reader.readAsArrayBuffer(file);
  };

  const handleImportSubmit = async () => {
    if (!importData || !importData.length) return;
    setImportSubmitting(true);
    setImportResult(null);
    try {
      const res = await api.admin.users.importUsers(importData);
      setImportResult(res);
      if (res.created > 0) {
        toast.success(res.message);
        reload();
      }
      if (res.errors && res.errors.length) {
        res.errors.forEach(e => toast.error(e));
      }
    } catch (err) {
      toast.error(err.message);
      setImportResult({ created: 0, errors: [err.message] });
    }
    setImportSubmitting(false);
  };

  const IMPORT_TEMPLATE = [
    { key: 'name', label: 'Nama', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'password', label: 'Password', required: true },
    { key: 'role', label: 'Role (admin/verifikator/pekebun)', required: true },
    { key: 'nik', label: 'NIK', required: false },
    { key: 'no_kk', label: 'No KK', required: false },
    { key: 'no_whatsapp', label: 'No WhatsApp', required: false },
    { key: 'tempat_lahir', label: 'Tempat Lahir', required: false },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir', required: false },
    { key: 'alamat', label: 'Alamat', required: false },
  ];

  const columnMapping = {
    nama: 'name',
    email: 'email', surel: 'email',
    password: 'password', pass: 'password', sandi: 'password', kata_sandi: 'password',
    role: 'role', peran: 'role',
    nik: 'nik',
    no_kk: 'no_kk', nokk: 'no_kk', nomor_kk: 'no_kk',
    no_whatsapp: 'no_whatsapp', whatsapp: 'no_whatsapp', no_wa: 'no_whatsapp', wa: 'no_whatsapp', telepon: 'no_whatsapp', hp: 'no_whatsapp', no_hp: 'no_whatsapp', no_telp: 'no_whatsapp', no_telepon: 'no_whatsapp', phone: 'no_whatsapp',
    tempat_lahir: 'tempat_lahir', tmpt_lahir: 'tempat_lahir',
    tanggal_lahir: 'tanggal_lahir', tgl_lahir: 'tanggal_lahir', lahir: 'tanggal_lahir', birth: 'tanggal_lahir',
    alamat: 'alamat', address: 'alamat', almt: 'alamat',
  };

  function normalizeImportRow(row) {
    const norm = {};
    for (const [col, val] of Object.entries(row)) {
      const key = columnMapping[col.toLowerCase().trim()];
      if (key) norm[key] = String(val ?? '').trim();
    }
    return norm;
  }

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // === RENDER HELPERS ===
  const RoleBadge = ({ role }) => {
    const s = ROLE_STYLES[role] || 'bg-gray-100 text-gray-600 ring-gray-300';
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {role === 'admin' ? 'Admin' : role === 'verifikator' ? 'Verifikator' : 'Pekebun'}
      </span>
    );
  };

  const incompleteCount = (u) => {
    if (!u.pekebun) return 0;
    let n = 0;
    if (!u.pekebun.foto_pekebun) n++;
    if (!u.pekebun.upload_ktp) n++;
    if (!u.pekebun.upload_kk) n++;
    if (!u.pekebun.nik) n++;
    if (!u.pekebun.no_whatsapp) n++;
    return n;
  };

  const renderTabButton = (tab, current, label, onClick) => (
    <button key={tab} onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${current === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-foreground hover:border-gray-300'}`}>
      {label}
    </button>
  );

  const logoUrl = useLogo();

  // === RENDER ===
  if (loading) return <TableSkeleton />;

  if (dataError) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-destructive/60 mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Gagal Memuat Data</h2>
      <p className="text-gray-500 text-sm mb-4">{dataError}</p>
      <Button onClick={handleRetry}><ArrowPathIcon className="w-4 h-4" /> Coba Lagi</Button>
    </div>
  );

  return (
    <div>
      {/* === PAGE HEADER === */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt="KUD" className="w-full h-full object-contain p-1" />
            ) : (
              <UserGroupIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen User</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola semua akun pengguna</p>
          </div>
        </div>
        <Button onClick={() => setCreateModal(true)}>+ Tambah User</Button>
      </div>

      {/* === STATS BAR === */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total User', value: stats.total, icon: UsersIcon, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
          { label: 'Admin', value: stats.admin, icon: ShieldCheckIcon, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
          { label: 'Verifikator', value: stats.verifikator, icon: ClipboardDocumentListIcon, color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
          { label: 'Pekebun', value: stats.pekebun, icon: UserGroupIcon, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Verifikasi Rate', value: `${stats.verifiedRate}%`, icon: CheckCircleIcon, color: 'bg-amber-500', shadow: 'shadow-amber-500/20', sub: `${stats.verified} verified / ${stats.pending} pending` },
          { label: 'User Baru (30hr)', value: newUsers, icon: ChartBarIcon, color: 'bg-cyan-500', shadow: 'shadow-cyan-500/20' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface rounded-2xl border border-border p-4 ${s.shadow} transition-all duration-200`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-foreground">{s.value}</div>
            {s.sub && <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* === FILTER TOOLBAR === */}
      <Card className="mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input ref={searchRef} placeholder="Cari nama, email, atau NIK..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:ring-2 focus:ring-ring/30 focus:border-primary outline-none transition-all" />
          </div>
          <Select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }} className="min-w-[140px]">
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="verifikator">Verifikator</option>
            <option value="pekebun">Pekebun</option>
          </Select>
          <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="min-w-[160px]">
            <option value="">Semua Status</option>
            <option value="verified">Terverifikasi</option>
            <option value="pending">Menunggu</option>
            <option value="rejected">Ditolak</option>
          </Select>
          <DateRangePicker value={dateRange} onChange={(v) => { setDateRange(v); setFilterDateFrom(v.start); setFilterDateTo(v.end); setPage(1); }} placeholder="Filter tanggal" className="min-w-[240px]" />
          <Button variant="outline" size="sm" onClick={() => { setImportData(null); setImportFile(null); setImportResult(null); setImportModal(true); }} className="whitespace-nowrap">
            <DocumentArrowDownIcon className="w-4 h-4 rotate-180" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(sorted)} className="whitespace-nowrap">
            <DocumentArrowDownIcon className="w-4 h-4" /> Excel
          </Button>
        </div>

        {/* Active Filter Chips */}
        {(search || filterRole || filterStatus || filterDateFrom || filterDateTo) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-gray-400 font-medium"><FunnelIcon className="w-3 h-3 inline mr-1" />Filter:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Cari: {search}
                <button onClick={() => setSearch('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterRole && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Role: {filterRole}
                <button onClick={() => setFilterRole('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Status: {STATUS_LABEL[filterStatus]}
                <button onClick={() => setFilterStatus('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterDateFrom && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Dari: {filterDateFrom}
                <button onClick={() => setFilterDateFrom('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            {filterDateTo && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Sampai: {filterDateTo}
                <button onClick={() => setFilterDateTo('')} className="cursor-pointer hover:text-primary-dark"><XMarkIcon className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); setPage(1); }}
              className="text-xs text-gray-400 hover:text-foreground underline cursor-pointer ml-1">Clear all</button>
          </div>
        )}
      </Card>

      {/* === BULK ACTION BAR === */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <CheckCircleIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{selected.size} user dipilih</span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={clearSelection}>Batal</Button>
          <Button size="sm" variant="primary" onClick={() => setBulkRoleModal(true)}><UsersIcon className="w-3.5 h-3.5" /> Ubah Role</Button>
          <Button size="sm" variant="danger" onClick={() => setBulkDeleteModal(true)}><TrashIcon className="w-3.5 h-3.5" /> Hapus</Button>
          <Button size="sm" variant="outline" onClick={() => exportToExcel(data.filter(u => selected.has(u.id)))}>
            <DocumentArrowDownIcon className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      )}

      {/* === TABLE === */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-3 w-10">
                  <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="py-3 px-2 w-8" />
                {renderSortHeader('name', 'Nama', 'min-w-[180px]')}
                {renderSortHeader('email', 'Email', 'min-w-[180px]')}
                {renderSortHeader('role', 'Role')}
                {renderSortHeader('status', 'Status Pekebun')}
                {renderSortHeader('nik', 'NIK')}
                {renderSortHeader('no_whatsapp', 'Kontak')}
                <th className="text-left py-3 px-3 font-semibold text-foreground/70">Dokumen</th>
                {renderSortHeader('lahan', 'Lahan', 'text-center')}
                {renderSortHeader('program', 'Program', 'text-center')}
                {renderSortHeader('created_at', 'Tgl Daftar')}
                <th className="text-left py-3 px-3 font-semibold text-foreground/70">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => {
                const expanded = expandedRows.has(u.id);
                const isSelected = selected.has(u.id);
                const inc = incompleteCount(u);
                return (
                  <tr key={u.id} className={`border-b border-border/50 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'} ${expanded ? 'bg-muted/30' : ''}`}>
                    <td className="py-3 px-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(u.id)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => toggleExpand(u.id)} className="p-0.5 rounded hover:bg-muted transition-all cursor-pointer">
                        {expanded ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${avatarColor(u.name)} flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm`}>
                          {u.foto_profil ? <img src={u.foto_profil} alt="" className="w-full h-full rounded-full object-cover" /> : u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            {u.name}
                            {inc > 0 && <span className="text-amber-500" title={`${inc} data belum lengkap`}><ExclamationTriangleIcon className="w-3.5 h-3.5" /></span>}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{u.email}</td>
                    <td className="py-3 px-3"><RoleBadge role={u.role} /></td>
                    <td className="py-3 px-3">
                      {u.pekebun ? (
                        <div className="flex flex-col gap-0.5">
                          {STATUS_BADGE[u.pekebun.status] || <Badge status="pending" />}
                          {u.pekebun.verified_at && <span className="text-[10px] text-gray-400">{formatRelative(u.pekebun.verified_at)}</span>}
                        </div>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-gray-500">{u.pekebun?.nik || '-'}</td>
                    <td className="py-3 px-3 text-xs text-gray-500">
                      {u.pekebun ? (
                        <div className="flex flex-col gap-0.5">
                          {u.pekebun.no_whatsapp && <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {u.pekebun.no_whatsapp}</span>}
                          {u.pekebun.alamat && <span className="truncate max-w-[120px] block" title={u.pekebun.alamat}>{u.pekebun.alamat}</span>}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {u.pekebun && (u.pekebun.foto_pekebun || u.pekebun.upload_ktp || u.pekebun.upload_kk) ? (
                        <div className="flex -space-x-1.5">
                          {u.pekebun.foto_pekebun && (
                            <button onClick={() => setPreviewImage(u.pekebun.foto_pekebun)}
                              className="w-7 h-7 rounded-lg border-2 border-surface overflow-hidden hover:z-10 relative cursor-pointer">
                              <img src={u.pekebun.foto_pekebun} alt="" className="w-full h-full object-cover" />
                            </button>
                          )}
                          {u.pekebun.upload_ktp && (
                            <button onClick={() => setPreviewImage(u.pekebun.upload_ktp)}
                              className="w-7 h-7 rounded-lg border-2 border-surface overflow-hidden hover:z-10 relative cursor-pointer">
                              <img src={u.pekebun.upload_ktp} alt="" className="w-full h-full object-cover" />
                            </button>
                          )}
                          {u.pekebun.upload_kk && (
                            <button onClick={() => setPreviewImage(u.pekebun.upload_kk)}
                              className="w-7 h-7 rounded-lg border-2 border-surface overflow-hidden hover:z-10 relative cursor-pointer">
                              <img src={u.pekebun.upload_kk} alt="" className="w-full h-full object-cover" />
                            </button>
                          )}
                        </div>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.pekebun ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                          <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                          {u.pekebun.lahan?.length ?? <span className="text-gray-300">?</span>}
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.pekebun ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                          <ClipboardDocumentListIcon className="w-3.5 h-3.5 text-gray-400" />
                          {u.pekebun.pendaftaranProgram?.length ?? <span className="text-gray-300">?</span>}
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatDate(u.created_at)}</span>
                        <span className="text-[10px] text-gray-400">{formatRelative(u.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1.5">
                        {u.pekebun && (
                          <button onClick={() => setDetailModal(u)} className="p-1.5 rounded-lg hover:bg-muted text-gray-400 hover:text-primary transition-all cursor-pointer" title="Detail">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setEditModal(u)} className="p-1.5 rounded-lg hover:bg-muted text-gray-400 hover:text-amber-600 transition-all cursor-pointer" title="Edit">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteModal(u)} className="p-1.5 rounded-lg hover:bg-muted text-gray-400 hover:text-destructive transition-all cursor-pointer" title="Hapus">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan="13" className="text-center py-16">
                    <UsersIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Tidak ada user ditemukan</p>
                    <p className="text-gray-300 text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* === INLINE ROW EXPANSION === */}
        {paged.map((u) => {
          if (!expandedRows.has(u.id)) return null;
          const tab = expansionTab[u.id] || 'info';
          const p = u.pekebun;
          return (
            <div key={`exp-${u.id}`} className="border-t border-border bg-muted/20 animate-fade-in">
              <div className="border-b border-border bg-muted/50">
                <div className="flex overflow-x-auto px-4">
                  {renderTabButton('info', tab, 'Info Pekebun', () => setExpansionTab(p => ({ ...p, [u.id]: 'info' })))}
                  {renderTabButton('dokumen', tab, 'Dokumen', () => setExpansionTab(p => ({ ...p, [u.id]: 'dokumen' })))}
                  {renderTabButton('lahan', tab, 'Lahan', () => { setExpansionTab(p => ({ ...p, [u.id]: 'lahan' })); loadExtraData(u.id, 'lahan'); })}
                  {renderTabButton('program', tab, 'Program', () => { setExpansionTab(p => ({ ...p, [u.id]: 'program' })); loadExtraData(u.id, 'pendaftaran'); })}
                  {renderTabButton('tbs', tab, 'TBS', () => { setExpansionTab(p => ({ ...p, [u.id]: 'tbs' })); loadExtraData(u.id, 'tbs'); })}
                </div>
              </div>
              <div className="p-4">
                {/* Tab: Info Pekebun */}
                {tab === 'info' && p && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {[
                      ['NIK', p.nik], ['No. KK', p.no_kk], ['Tempat Lahir', p.tempat_lahir],
                      ['Tanggal Lahir', p.tanggal_lahir ? formatDate(p.tanggal_lahir) : '-'],
                      ['WhatsApp', p.no_whatsapp], ['Status', p.status ? STATUS_LABEL[p.status] : '-'],
                      ['Terverifikasi Oleh', p.verified_by || '-'],
                      ['Tanggal Verifikasi', p.verified_at ? formatDate(p.verified_at) : '-'],
                      ['Catatan Verifikasi', p.catatan_verifikasi || '-'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span className="text-gray-400 text-[11px] block mb-0.5">{label}</span>
                        <span className="font-medium text-foreground text-sm">{value || '-'}</span>
                      </div>
                    ))}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <span className="text-gray-400 text-[11px] block mb-0.5">Alamat</span>
                      <span className="font-medium text-foreground text-sm">{p.alamat || '-'}</span>
                    </div>
                    {p.foto_pekebun && (
                      <div>
                        <span className="text-gray-400 text-[11px] block mb-1">Foto Pekebun</span>
                        <button onClick={() => setPreviewImage(p.foto_pekebun)}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img src={p.foto_pekebun} alt="" className="w-full h-full object-cover" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {tab === 'info' && !p && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <UserIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    User ini belum memiliki data pekebun
                  </div>
                )}

                {/* Tab: Dokumen */}
                {tab === 'dokumen' && (
                  <div>
                    {p && (p.foto_pekebun || p.upload_ktp || p.upload_kk) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                          { src: p.foto_pekebun, label: 'Foto Pekebun' },
                          { src: p.upload_ktp, label: 'KTP' },
                          { src: p.upload_kk, label: 'KK' },
                        ].filter(x => x.src).map((doc, i) => (
                          <button key={i} onClick={() => setPreviewImage(doc.src)}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted cursor-pointer">
                            <img src={doc.src} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md">{doc.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        <PhotoIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        Belum ada dokumen yang diupload
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Lahan */}
                {tab === 'lahan' && <ExpansionTabContent cacheKey={`${u.id}_lahan`} cache={expansionCache} loadFn={() => loadExtraData(u.id, 'lahan')} emptyMessage="Belum ada data lahan" />}

                {/* Tab: Program */}
                {tab === 'program' && <ExpansionTabContent cacheKey={`${u.id}_pendaftaran`} cache={expansionCache} loadFn={() => loadExtraData(u.id, 'pendaftaran')} emptyMessage="Belum ada pendaftaran program" />}

                {/* Tab: TBS */}
                {tab === 'tbs' && <ExpansionTabContent cacheKey={`${u.id}_tbs`} cache={expansionCache} loadFn={() => loadExtraData(u.id, 'tbs')} emptyMessage="Belum ada data TBS" />}
              </div>
            </div>
          );
        })}

        {/* === PAGINATION === */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Menampilkan {sorted.length === 0 ? 0 : (safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, sorted.length)} dari {sorted.length} data</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">per halaman:</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border border-border rounded-lg px-2 py-1 text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none cursor-pointer">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">« Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) pageNum = i + 1;
              else if (safePage <= 4) pageNum = i + 1;
              else if (safePage >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = safePage - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${safePage === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-border hover:bg-muted text-gray-600'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40 hover:bg-muted transition-all cursor-pointer">Next »</button>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-400">Go:</span>
              <input type="number" min={1} max={totalPages} value={gotoPage} onChange={(e) => setGotoPage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(gotoPage); if (v >= 1 && v <= totalPages) setPage(v); setGotoPage(''); } }}
                className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-white focus:ring-ring/30 focus:border-primary outline-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* === MODALS === */}

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => { setDetailModal(null); setDetailTab('info'); }} title="Detail User & Pekebun" maxWidth="max-w-2xl">
        {detailModal && detailModal.pekebun && (() => {
          const p = detailModal.pekebun;
          return (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {p.foto_pekebun ? (
                    <img src={p.foto_pekebun} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(p.foto_pekebun)} />
                  ) : <span className="text-primary font-bold text-xl">{p.nama?.charAt(0)}</span>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{p.nama}</h3>
                  <Badge status={p.status} />
                  <p className="text-xs text-gray-400 mt-0.5">User: {detailModal.name} ({detailModal.email})</p>
                </div>
              </div>
              <div className="border-b border-border mb-4">
                <div className="flex gap-0">
                  {['info', 'dokumen'].map(t => (
                    <button key={t} onClick={() => setDetailTab(t)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer ${detailTab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}>
                      {t === 'info' ? 'Data Pekebun' : 'Dokumen'}
                    </button>
                  ))}
                </div>
              </div>
              {detailTab === 'info' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    ['NIK', p.nik], ['No. KK', p.no_kk],
                    ['Tempat Lahir', p.tempat_lahir], ['Tanggal Lahir', p.tanggal_lahir ? formatDate(p.tanggal_lahir) : '-'],
                    ['WhatsApp', p.no_whatsapp],
                    ['Alamat', p.alamat],
                  ].map(([label, value]) => (
                    <div key={label} className={label === 'Alamat' ? 'col-span-2' : ''}>
                      <span className="text-gray-400 text-xs block">{label}</span>
                      <span className="font-medium text-foreground">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}
              {detailTab === 'dokumen' && (p.foto_pekebun || p.upload_ktp || p.upload_kk) && (
                <div className="grid grid-cols-3 gap-3">
                  {[p.foto_pekebun, p.upload_ktp, p.upload_kk].filter(Boolean).map((src, i) => (
                    <button key={i} onClick={() => setPreviewImage(src)}
                      className="aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer group">
                      <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tambah User">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="pekebun">Pekebun</option><option value="verifikator">Verifikator</option><option value="admin">Admin</option>
          </Select>
          <Button type="submit" loading={submitting}>Simpan</Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit User">
        <form onSubmit={handleEdit} className="space-y-3">
          <Input label="Nama" value={editModal?.name || ''} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} required />
          <Input label="Email" type="email" value={editModal?.email || ''} onChange={(e) => setEditModal({ ...editModal, email: e.target.value })} required />
          <Input label="Password (kosongkan jika tidak diganti)" type="password" value={editModal?.password || ''} onChange={(e) => setEditModal({ ...editModal, password: e.target.value })} />
          <Select label="Role" value={editModal?.role || 'pekebun'} onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}>
            <option value="pekebun">Pekebun</option><option value="verifikator">Verifikator</option><option value="admin">Admin</option>
          </Select>
          <Button type="submit" loading={submitting}>Simpan</Button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus User">
        <p className="text-gray-600 text-sm mb-4">Yakin ingin menghapus user <strong>{deleteModal?.name}</strong>?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal open={bulkDeleteModal} onClose={() => setBulkDeleteModal(false)} title="Hapus User Terpilih" maxWidth="max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Yakin ingin menghapus <strong>{selected.size} user</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setBulkDeleteModal(false)}>Batal</Button>
          <Button variant="danger" onClick={handleBulkDelete} loading={submitting}>Hapus {selected.size} User</Button>
        </div>
      </Modal>

      {/* Bulk Role Modal */}
      <Modal open={bulkRoleModal} onClose={() => setBulkRoleModal(false)} title="Ubah Role User" maxWidth="max-w-md">
        <p className="text-sm text-gray-600 mb-4">Ubah role untuk <strong>{selected.size} user</strong> yang dipilih:</p>
        <Select value={bulkRole} onChange={(e) => setBulkRole(e.target.value)} label="Role Baru">
          <option value="pekebun">Pekebun</option><option value="verifikator">Verifikator</option><option value="admin">Admin</option>
        </Select>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={() => setBulkRoleModal(false)}>Batal</Button>
          <Button onClick={handleBulkRole} loading={submitting}>Simpan</Button>
        </div>
      </Modal>

      {/* Import Excel Modal */}
      <Modal open={importModal} onClose={() => { if (!importSubmitting) setImportModal(false); }} title="Import Excel" maxWidth="max-w-3xl">
        {!importData ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Petunjuk:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                <li>Siapkan file Excel (.xlsx) dengan kolom sesuai template di bawah</li>
                <li>Kolom <strong>Nama, Email, Password, Role</strong> wajib diisi</li>
                <li>Role: <strong>admin</strong>, <strong>verifikator</strong>, atau <strong>pekebun</strong></li>
                <li>Jika Role <strong>pekebun</strong>, data pekebun akan otomatis dibuat</li>
              </ul>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-gray-500 border-b border-border">Template Kolom</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {IMPORT_TEMPLATE.map(t => (
                        <th key={t.key} className="text-left py-2 px-3 font-semibold text-gray-500">
                          {t.label} {t.required && <span className="text-red-500">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      {IMPORT_TEMPLATE.map(t => (
                        <td key={t.key} className="py-2 px-3 text-gray-400 italic">
                          {t.key === 'name' ? 'Budi Santoso' : t.key === 'email' ? 'budi@mail.com' : t.key === 'password' ? 'min8karakter' : t.key === 'role' ? 'pekebun' : t.key === 'nik' ? '1234567890123456' : t.key === 'no_kk' ? '1234567890123456' : t.key === 'no_whatsapp' ? '08123456789' : t.key === 'tempat_lahir' ? 'Jakarta' : t.key === 'tanggal_lahir' ? '1990-01-15' : t.key === 'alamat' ? 'Jl. Merdeka No.1' : ''}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer" onClick={() => importRef.current?.click()}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <DocumentArrowDownIcon className="w-5 h-5 text-primary rotate-180" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Klik untuk pilih file Excel</p>
                <p className="text-xs text-gray-400">Format .xlsx, maksimal 5MB</p>
              </div>
              {importFile && (
                <span className="text-xs text-primary font-medium truncate max-w-[200px]">{importFile.name}</span>
              )}
            </div>
            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImportFile} className="hidden" />

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setImportModal(false)}>Batal</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Ditemukan <strong>{importData.length}</strong> baris data
                {importFile && <span className="text-gray-400 ml-1">({importFile.name})</span>}
              </p>
              <button onClick={() => { setImportData(null); setImportFile(null); }} className="text-xs text-primary hover:underline cursor-pointer">Pilih file lain</button>
            </div>

            {importResult && (
              <div className={`rounded-xl p-4 text-sm ${importResult.created > 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <p className="font-medium">{importResult.message}</p>
                {importResult.errors?.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs max-h-32 overflow-y-auto">
                    {importResult.errors.map((e, i) => <li key={i} className="text-red-600">{e}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold text-gray-500 w-8">#</th>
                    {IMPORT_TEMPLATE.map(t => (
                      <th key={t.key} className="text-left py-2 px-3 font-semibold text-gray-500 whitespace-nowrap">
                        {t.label} {t.required && <span className="text-red-500">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importData.map((row, i) => {
                    const nr = normalizeImportRow(row);
                    const missing = IMPORT_TEMPLATE.filter(t => t.required && !nr[t.key]);
                    return (
                      <tr key={i} className={`border-b border-border/50 ${missing.length ? 'bg-red-50' : 'hover:bg-muted/50'}`}>
                        <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                        {IMPORT_TEMPLATE.map(t => (
                          <td key={t.key} className="py-2 px-3 text-gray-600 max-w-[150px] truncate" title={nr[t.key] || ''}>
                            {nr[t.key] || <span className="text-red-300 italic">kosong</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setImportModal(false)} disabled={importSubmitting}>Tutup</Button>
              {!importResult && (
                <Button onClick={handleImportSubmit} loading={importSubmitting}>
                  Import {importData.length} User
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 cursor-pointer">
              <XMarkIcon className="w-4 h-4 text-gray-700" />
            </button>
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

function ExpansionTabContent({ cacheKey, cache, loadFn, emptyMessage }) {
  const data = cache[cacheKey];
  const [loading, setLoading] = useState(false);

  if (data === undefined) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="text-gray-300 mb-3"><ArrowPathIcon className="w-8 h-8" /></div>
        <p className="text-gray-400 text-sm mb-3">Data belum dimuat</p>
        <Button size="sm" variant="outline" onClick={async () => { setLoading(true); await loadFn(); setLoading(false); }} loading={loading}>
          <ArrowPathIcon className="w-3.5 h-3.5" /> Muat Data
        </Button>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {Object.keys(data[0]).filter(k => !['id', 'created_at', 'updated_at', 'deleted_at', 'user_id', 'pekebun_id', 'pekebun', 'pivot'].includes(k)).slice(0, 5).map(k => (
              <th key={k} className="text-left py-2 px-3 font-semibold text-gray-500 uppercase tracking-wider">{k.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((item, i) => (
            <tr key={item.id || i} className="border-b border-border/30 hover:bg-muted/50">
              {Object.keys(data[0]).filter(k => !['id', 'created_at', 'updated_at', 'deleted_at', 'user_id', 'pekebun_id', 'pekebun', 'pivot'].includes(k)).slice(0, 5).map(k => (
                <td key={k} className="py-2 px-3 text-gray-600">{typeof item[k] === 'object' ? JSON.stringify(item[k]).slice(0, 50) : String(item[k] ?? '-').slice(0, 50)}</td>
              ))}
            </tr>
          ))}
          {data.length > 10 && (
            <tr>
              <td colSpan={5} className="py-2 px-3 text-gray-400 text-center italic">...dan {data.length - 10} lainnya</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
