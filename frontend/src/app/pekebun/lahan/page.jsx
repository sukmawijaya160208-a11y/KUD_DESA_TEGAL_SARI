'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import PrintButton from '@/components/PrintButton';
import PrintPreview from '@/components/PrintPreview';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { MapPinIcon, PlusIcon, TrashIcon, XMarkIcon, EyeIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

function SingleUpload({ label, folder, onUpload, current }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const displayUrl = preview || current || '';
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const endpoint = `/upload/${folder}`;
      const res = await api.upload(endpoint, file);
      setPreview(res.url);
      onUpload(res.url);
      toast.success(`${label} berhasil diupload`);
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploading(false);
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {displayUrl ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted group shrink-0">
            <img src={displayUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <EyeIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center shrink-0">
            <CameraIcon className="w-6 h-6 text-gray-300" />
          </div>
        )}
        <label className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-100 border border-dashed border-border transition-all text-center">
          {uploading ? (
            <span className="text-primary">Uploading...</span>
          ) : (
            <span>{displayUrl ? 'Ganti Foto' : `Upload ${label}`}</span>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

function MultiUpload({ label, folder, urls = [], onUpdate }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const maxPhotos = 3;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (urls.length >= maxPhotos) {
      toast.error(`Maksimal ${maxPhotos} foto`);
      return;
    }
    setUploading(true);
    try {
      const endpoint = `/upload/${folder}`;
      const res = await api.upload(endpoint, file);
      onUpdate([...urls, res.url]);
      toast.success(`Foto ${urls.length + 1} berhasil diupload`);
    } catch (err) {
      toast.error('Upload gagal: ' + err.message);
    }
    setUploading(false);
  };

  const removePhoto = (idx) => {
    onUpdate(urls.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted group">
            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
            <button onClick={() => removePhoto(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg">
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
        {urls.length < maxPhotos && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted hover:border-primary/40 transition-all group">
            {uploading ? (
              <span className="text-xs text-primary">...</span>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-gray-400">{urls.length}/{maxPhotos}</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading || urls.length >= maxPhotos} />
          </label>
        )}
      </div>
      {urls.length === 0 && <p className="text-xs text-gray-400 mt-1">Upload foto kebun (maks {maxPhotos} foto)</p>}
    </div>
  );
}

export default function PekebunLahanPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [form, setForm] = useState({
    alamat_lahan: '', jenis_surat: 'SHM', nomor_surat: '', luas_lahan_m2: '',
    upload_surat_tanah: '', upload_surat_keterangan: '', titik_koordinat: '',
    foto_petani: '', foto_kebun: '',
  });
  const [kebunUrls, setKebunUrls] = useState([]);

  const load = useCallback(() => api.pekebun.lahan.list().then((d) => {
    setData(d.map((l) => ({
      ...l,
      foto_kebun_arr: l.foto_kebun ? (() => { try { return JSON.parse(l.foto_kebun); } catch { return []; } })() : [],
    })));
  }).catch((err) => toast.error(err.message)).finally(() => setLoading(false)), [toast]);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, foto_kebun: JSON.stringify(kebunUrls) };
      await api.pekebun.lahan.create(payload);
      setShowForm(false);
      setForm({ alamat_lahan: '', jenis_surat: 'SHM', nomor_surat: '', luas_lahan_m2: '', upload_surat_tanah: '', upload_surat_keterangan: '', titik_koordinat: '', foto_petani: '', foto_kebun: '' });
      setKebunUrls([]);
      toast.success('Lahan berhasil ditambahkan');
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await api.pekebun.lahan.delete(deleteModal.id);
      setDeleteModal(null);
      toast.success('Lahan berhasil dihapus');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openMaps = (coord) => {
    if (!coord) return;
    const q = coord.includes('http') ? coord : `https://www.google.com/maps?q=${encodeURIComponent(coord)}`;
    window.open(q, '_blank');
  };

  if (loading) return <div className="p-6"><CardSkeleton /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPinIcon className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Lahan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola lahan perkebunan Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrintPreview
            title="Data Lahan Pekebun"
            fetchAll={() => api.pekebun.lahan.list().then((d) => d.map((l) => ({
              ...l,
              foto_kebun_arr: l.foto_kebun ? (() => { try { return JSON.parse(l.foto_kebun); } catch { return []; } })() : [],
            })))}
            renderContent={(items) => `
              <table class="print-table">
                <thead>
                  <tr>
                    <th style="width:36px">No</th>
                    <th>Alamat Lahan</th>
                    <th>Surat</th>
                    <th style="width:90px;text-align:right">Luas (M²)</th>
                    <th>Dokumen</th>
                    <th style="width:100px">Koordinat</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((l, i) => {
                    const docs = [];
                    if (l.foto_petani) docs.push({ url: l.foto_petani, label: 'Petani' });
                    (l.foto_kebun_arr || []).forEach((url) => docs.push({ url, label: 'Kebun' }));
                    if (l.upload_surat_tanah) docs.push({ url: l.upload_surat_tanah, label: 'Tanah' });
                    if (l.upload_surat_keterangan) docs.push({ url: l.upload_surat_keterangan, label: 'Ket' });
                    return `
                    <tr>
                      <td>${i + 1}</td>
                      <td><strong>${l.alamat_lahan || '-'}</strong></td>
                      <td>${[l.jenis_surat, l.nomor_surat].filter(Boolean).join('<br>') || '-'}</td>
                      <td class="text-right font-bold">${Number(l.luas_lahan_m2 || 0).toLocaleString()}</td>
                      <td>
                        <div class="doc-grid">
                          ${docs.length > 0 ? docs.map((d) =>
                            `<a href="${d.url}" target="_blank"><img src="${d.url}" alt="${d.label}" title="${d.label}" /></a>`
                          ).join('') : '<span class="text-muted">-</span>'}
                        </div>
                      </td>
                      <td class="text-muted" style="font-size:10px">${l.titik_koordinat ? l.titik_koordinat.substring(0, 40) : '-'}</td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          />
          <PrintButton
            title="Data Lahan Pekebun"
            fetchAll={() => api.pekebun.lahan.list().then((d) => d.map((l) => ({
              ...l,
              foto_kebun_arr: l.foto_kebun ? (() => { try { return JSON.parse(l.foto_kebun); } catch { return []; } })() : [],
            })))}
            renderContent={(items) => `
              <table class="print-table">
                <thead>
                  <tr>
                    <th style="width:36px">No</th>
                    <th>Alamat Lahan</th>
                    <th>Surat</th>
                    <th style="width:90px;text-align:right">Luas (M²)</th>
                    <th>Dokumen</th>
                    <th style="width:100px">Koordinat</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((l, i) => {
                    const docs = [];
                    if (l.foto_petani) docs.push({ url: l.foto_petani, label: 'Petani' });
                    (l.foto_kebun_arr || []).forEach((url) => docs.push({ url, label: 'Kebun' }));
                    if (l.upload_surat_tanah) docs.push({ url: l.upload_surat_tanah, label: 'Tanah' });
                    if (l.upload_surat_keterangan) docs.push({ url: l.upload_surat_keterangan, label: 'Ket' });
                    return `
                    <tr>
                      <td>${i + 1}</td>
                      <td><strong>${l.alamat_lahan || '-'}</strong></td>
                      <td>${[l.jenis_surat, l.nomor_surat].filter(Boolean).join('<br>') || '-'}</td>
                      <td class="text-right font-bold">${Number(l.luas_lahan_m2 || 0).toLocaleString()}</td>
                      <td>
                        <div class="doc-grid">
                          ${docs.length > 0 ? docs.map((d) =>
                            `<a href="${d.url}" target="_blank"><img src="${d.url}" alt="${d.label}" title="${d.label}" /></a>`
                          ).join('') : '<span class="text-muted">-</span>'}
                        </div>
                      </td>
                      <td class="text-muted" style="font-size:10px">${l.titik_koordinat ? l.titik_koordinat.substring(0, 40) : '-'}</td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          />
          <Button onClick={() => setShowForm(!showForm)}>
            <PlusIcon className="w-4 h-4" /> {showForm ? 'Batal' : 'Tambah Lahan'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 border border-primary/20 shadow-md shadow-primary/5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Form Tambah Lahan</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Alamat Lahan" value={form.alamat_lahan} onChange={(e) => setForm({ ...form, alamat_lahan: e.target.value })} required placeholder="Masukkan alamat lengkap lahan" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Jenis Surat" value={form.jenis_surat} onChange={(e) => setForm({ ...form, jenis_surat: e.target.value })}>
                <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                <option value="SPPH">SPPH (Surat Pernyataan Penguasaan Hak)</option>
                <option value="SKT">SKT (Surat Keterangan Tanah)</option>
              </Select>
              <Input label="Nomor Surat" value={form.nomor_surat} onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })} required placeholder="Nomor surat tanah" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Luas Lahan (M²)" type="number" value={form.luas_lahan_m2} onChange={(e) => setForm({ ...form, luas_lahan_m2: e.target.value })} required placeholder="Contoh: 5000" />
              <div>
                <Input label="Titik Koordinat / Link Google Maps" value={form.titik_koordinat} onChange={(e) => setForm({ ...form, titik_koordinat: e.target.value })} placeholder="https://maps.google.com/?q=..." />
                {form.titik_koordinat && (
                  <button type="button" onClick={() => openMaps(form.titik_koordinat)}
                    className="mt-1 text-xs text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer">
                    <MapPinIcon className="w-3 h-3" /> Uji coba buka di Google Maps
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Upload Dokumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Upload Surat Tanah</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-100 border border-dashed border-border transition-all">
                    {form.upload_surat_tanah ? <span className="text-green-600 text-xs">✓ Terupload</span> : <><PhotoIcon className="w-4 h-4" /> Pilih File</>}
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const r = await api.upload('/upload/surat-tanah', f); setForm({ ...form, upload_surat_tanah: r.url }); toast.success('Surat tanah berhasil diupload'); } catch (err) { toast.error(err.message); } }} />
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Upload Surat Keterangan</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-100 border border-dashed border-border transition-all">
                    {form.upload_surat_keterangan ? <span className="text-green-600 text-xs">✓ Terupload</span> : <><PhotoIcon className="w-4 h-4" /> Pilih File</>}
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const r = await api.upload('/upload/surat-keterangan', f); setForm({ ...form, upload_surat_keterangan: r.url }); toast.success('Surat keterangan berhasil diupload'); } catch (err) { toast.error(err.message); } }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Foto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SingleUpload label="Foto Petani" folder="foto-petani" current="" onUpload={(url) => setForm({ ...form, foto_petani: url })} />
                <MultiUpload label="Foto Kebun" folder="foto-kebun" urls={kebunUrls} onUpdate={setKebunUrls} />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" loading={submitting}>
                <PlusIcon className="w-4 h-4" /> Simpan Lahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {data.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Belum ada data lahan</p>
          <p className="text-gray-400 text-sm mt-1">Tambahkan lahan perkebunan Anda untuk memulai</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}><PlusIcon className="w-4 h-4" /> Tambah Lahan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((l) => (
            <Card key={l.id} className="group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{l.alamat_lahan}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-semibold">{l.jenis_surat}</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-semibold">{Number(l.luas_lahan_m2).toLocaleString()} M²</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModal(l)} className="p-1.5 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Foto Grid */}
              <div className="flex gap-2 mb-3">
                {l.foto_petani && (
                  <button onClick={() => { setPreviewImage(l.foto_petani); setPreviewLabel('Foto Petani'); }}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted shrink-0 group/thumb cursor-pointer">
                    <img src={l.foto_petani} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 py-0.5 rounded">Petani</span>
                  </button>
                )}
                {l.foto_kebun_arr?.map((url, idx) => (
                  <button key={idx} onClick={() => { setPreviewImage(url); setPreviewLabel(`Foto Kebun ${idx + 1}`); }}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted shrink-0 group/thumb cursor-pointer">
                    <img src={url} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 py-0.5 rounded">Kebun</span>
                  </button>
                ))}
              </div>

              {/* Dokumen & Maps Links */}
              <div className="flex flex-wrap gap-2">
                {l.upload_surat_tanah && <a href={l.upload_surat_tanah} target="_blank" className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all inline-flex items-center gap-1">📄 Surat Tanah</a>}
                {l.upload_surat_keterangan && <a href={l.upload_surat_keterangan} target="_blank" className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all inline-flex items-center gap-1">📋 Keterangan</a>}
                {l.titik_koordinat && (
                  <button onClick={() => openMaps(l.titik_koordinat)}
                    className="text-xs bg-blue-50 text-primary px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all inline-flex items-center gap-1 cursor-pointer">
                    <MapPinIcon className="w-3 h-3" /> Buka Google Maps
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">Nomor Surat: {l.nomor_surat}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Lahan" maxWidth="max-w-sm">
        <p className="text-gray-600 text-sm mb-4">Yakin ingin menghapus lahan <strong className="text-foreground">{deleteModal?.alamat_lahan}</strong>?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Fullscreen Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4" onClick={() => { setPreviewImage(null); setPreviewLabel(''); }}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">{previewLabel || 'Preview'}</span>
              <button onClick={() => { setPreviewImage(null); setPreviewLabel(''); }} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
            <img src={previewImage} alt="" className="w-full h-auto rounded-2xl shadow-2xl mt-6" />
          </div>
        </div>
      )}
    </div>
  );
}
