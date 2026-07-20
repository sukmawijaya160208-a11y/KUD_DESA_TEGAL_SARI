'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function PekebunTbsPage() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tanggal: new Date().toISOString().split('T')[0], jumlah_tbs: '', keterangan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const load = () => api.pekebun.tbs.list().then(setData).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.pekebun.tbs.create(form);
      setShowForm(false);
      setForm({ tanggal: new Date().toISOString().split('T')[0], jumlah_tbs: '', keterangan: '' });
      toast.success('Data TBS berhasil ditambahkan');
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.pekebun.tbs.update(editModal.id, editModal);
      setEditModal(null);
      toast.success('Data TBS berhasil diperbarui');
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await api.pekebun.tbs.delete(deleteModal.id);
      setDeleteModal(null);
      toast.success('Data TBS berhasil dihapus');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">TBS Sync</h1>
          <p className="text-sm text-gray-500">Catat dan sinkron data Tandan Buah Segar</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Batal' : '+ Tambah TBS'}</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required />
              <Input label="Jumlah TBS" type="number" step="0.01" placeholder="0" value={form.jumlah_tbs} onChange={(e) => setForm({...form, jumlah_tbs: e.target.value})} required />
            </div>
            <Textarea label="Keterangan" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} rows={2} />
            <Button type="submit" loading={submitting}>Simpan</Button>
          </form>
        </Card>
      )}

      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Belum ada data TBS</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Jumlah TBS</th>
                  <th className="pb-3 font-semibold">Keterangan</th>
                  <th className="pb-3 font-semibold w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="py-3">{new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 font-semibold">{d.jumlah_tbs}</td>
                    <td className="py-3 text-gray-500">{d.keterangan || '-'}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditModal(d)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                        <button onClick={() => setDeleteModal(d)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit TBS">
        <form onSubmit={handleEdit} className="space-y-3">
          <Input label="Tanggal" type="date" value={editModal?.tanggal?.split('T')[0] || ''} onChange={(e) => setEditModal({...editModal, tanggal: e.target.value})} required />
          <Input label="Jumlah TBS" type="number" step="0.01" value={editModal?.jumlah_tbs || ''} onChange={(e) => setEditModal({...editModal, jumlah_tbs: e.target.value})} required />
          <Textarea label="Keterangan" value={editModal?.keterangan || ''} onChange={(e) => setEditModal({...editModal, keterangan: e.target.value})} rows={2} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" type="button" onClick={() => setEditModal(null)}>Batal</Button>
            <Button type="submit" loading={submitting}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus TBS">
        <p className="text-gray-600 text-sm mb-4">Yakin ingin menghapus data TBS tanggal <strong>{deleteModal?.tanggal ? new Date(deleteModal.tanggal).toLocaleDateString('id-ID') : ''}</strong>?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
