const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const ERROR_MESSAGES = {
  400: 'Data yang dikirim tidak valid',
  401: 'Sesi anda telah berakhir, silakan login kembali',
  403: 'Anda tidak memiliki akses ke fitur ini',
  404: 'Data tidak ditemukan',
  422: (data) => data?.message || 'Data yang diisi tidak valid',
  429: 'Terlalu banyak permintaan, silakan coba beberapa saat lagi',
  500: 'Terjadi kesalahan pada server, silakan coba lagi',
};

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Accept: 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!options.body || typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      const msg =
        ERROR_MESSAGES[res.status] ||
        data.message ||
        (data.errors && Object.values(data.errors)[0]?.[0]) ||
        'Permintaan gagal';

      const error = new Error(typeof msg === 'function' ? msg(data) : msg);
      error.status = res.status;
      error.data = data;

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error('Koneksi timeout, server tidak merespon');
    }

    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      throw new Error('Gagal terhubung ke server, periksa koneksi internet anda');
    }

    throw err;
  }
}

export const api = {
  pengaturan: {
    get: () => request('/pengaturan'),
  },
  tentangAplikasi: {
    get: () => request('/tentang-aplikasi'),
  },
  hargaTbs: {
    list: () => request('/harga-tbs'),
    latest: () => request('/harga-tbs/latest'),
  },
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    googleRedirect: () => request('/auth/google/redirect'),
    googleCallback: () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      return request('/auth/google/callback?code=' + encodeURIComponent(code));
    },
    uploadProfilePhoto: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return request('/auth/upload-profil', { method: 'POST', body: fd, headers: {} });
    },
  },
  upload: (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(endpoint, { method: 'POST', body: formData, headers: {} });
  },
  uploadDokumenProgram: (file, jenis) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jenis', jenis);
    return request('/upload/dokumen-program', { method: 'POST', body: formData, headers: {} });
  },
  notifikasi: {
    list: () => request('/notifikasi'),
    countUnread: () => request('/notifikasi/count'),
    markAsRead: (id) => request(`/notifikasi/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => request('/notifikasi/read-all', { method: 'PUT' }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    pekebun: {
      list: (params) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request('/admin/pekebun' + qs);
      },
      create: (data) => request('/admin/pekebun', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/admin/pekebun/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/admin/pekebun/${id}`, { method: 'DELETE' }),
    },
    program: {
      list: (params) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request('/admin/program' + qs);
      },
      stats: () => request('/admin/program/stats'),
      create: (data) => request('/admin/program', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/admin/program/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      toggleAktif: (id, aktif) => request(`/admin/program/${id}/toggle-aktif`, { method: 'PUT', body: JSON.stringify({ aktif }) }),
      delete: (id) => request(`/admin/program/${id}`, { method: 'DELETE' }),
    },
    pengaturan: {
      get: () => request('/admin/pengaturan'),
      update: (data) => request('/admin/pengaturan', { method: 'PUT', body: JSON.stringify(data) }),
      delete: (key) => request(`/admin/pengaturan/${key}`, { method: 'DELETE' }),
    },
    tentangAplikasi: {
      update: (data) => request('/admin/tentang-aplikasi', { method: 'PUT', body: JSON.stringify(data) }),
    },
    laporan: () => request('/admin/laporan'),
    tbs: {
      list: () => request('/admin/tbs'),
    },
    lahan: {
      list: (params) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request('/admin/lahan' + qs);
      },
      stats: () => request('/admin/lahan/stats'),
    },
    verifikasiLog: {
      list: () => request('/admin/verifikasi-log'),
    },
    users: {
      list: () => request('/admin/users'),
      create: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
      importUsers: (users) => request('/admin/users/import', { method: 'POST', body: JSON.stringify({ users }) }),
    },
    pendaftaran: {
      list: () => request('/admin/pendaftaran'),
      verifikasi: (id, data) => request(`/admin/pendaftaran/${id}/verifikasi`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/admin/pendaftaran/${id}`, { method: 'DELETE' }),
    },
    hargaTbs: {
      list: () => request('/admin/harga-tbs'),
      create: (data) => request('/admin/harga-tbs', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/admin/harga-tbs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/admin/harga-tbs/${id}`, { method: 'DELETE' }),
    },
    blog: {
      list: (params) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return request('/admin/blog' + qs);
      },
      create: (data) => request('/admin/blog', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/admin/blog/${id}`, { method: 'DELETE' }),
      uploadMedia: (id, file, caption) => {
        const fd = new FormData();
        fd.append('file', file);
        if (caption) fd.append('caption', caption);
        return request(`/admin/blog/${id}/media`, { method: 'POST', body: fd, headers: {} });
      },
      deleteMedia: (id) => request(`/admin/blog/media/${id}`, { method: 'DELETE' }),
      toggleFeatured: (id, featured) => request(`/admin/blog/${id}/toggle-featured`, { method: 'PUT', body: JSON.stringify({ featured }) }),
      categories: () => request('/admin/blog/categories/list'),
      createCategory: (name) => request('/admin/blog/categories', { method: 'POST', body: JSON.stringify({ name }) }),
      deleteCategory: (name) => request(`/admin/blog/categories/${encodeURIComponent(name)}`, { method: 'DELETE' }),
    },
    backupRestore: {
      backup: () => request('/admin/backup'),
      restore: (data) => request('/admin/restore', { method: 'POST', body: JSON.stringify(data) }),
      resetData: (confirmation) => request('/admin/reset-data', { method: 'POST', body: JSON.stringify({ confirmation }) }),
    },
  },
  chat: {
    users: () => request('/chat/users'),
    conversations: () => request('/chat/conversations'),
    create: (userId) => request('/chat/conversations', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
    messages: (conversationId) => request(`/chat/conversations/${conversationId}/messages`),
    send: (conversationId, message, attachment) => request(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ message, attachment }) }),
    markAsRead: (conversationId) => request(`/chat/conversations/${conversationId}/read`, { method: 'PUT' }),
    deleteMessage: (conversationId, messageId) => request(`/chat/conversations/${conversationId}/messages/${messageId}`, { method: 'DELETE' }),
    upload: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return request('/upload/chat', { method: 'POST', body: fd, headers: {} });
    },
  },
  calls: {
    initiate: (conversationId, type) => request('/calls', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, type }) }),
    pending: () => request('/calls/pending'),
    active: () => request('/calls/active'),
    accept: (callId) => request(`/calls/${callId}/accept`, { method: 'POST' }),
    reject: (callId) => request(`/calls/${callId}/reject`, { method: 'POST' }),
    end: (callId) => request(`/calls/${callId}/end`, { method: 'POST' }),
  },
  blog: {
    list: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request('/blog' + qs);
    },
    show: (slug) => request(`/blog/${slug}`),
    categories: () => request('/blog/categories'),
    featured: () => request('/blog/featured'),
    popular: () => request('/blog/popular'),
    incrementViews: (slug) => request(`/blog/${slug}/view`, { method: 'POST' }),
    related: (slug) => request(`/blog/${slug}/related`),
  },
  verifikator: {
    pengajuanPekebun: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request('/verifikator/pengajuan-pekebun' + qs);
    },
    verifikasiPekebun: (id, data) => request(`/verifikator/pekebun/${id}/verifikasi`, { method: 'PUT', body: JSON.stringify(data) }),
    pengajuanProgram: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request('/verifikator/pengajuan-program' + qs);
    },
    verifikasiProgram: (id, data) => request(`/verifikator/program/${id}/verifikasi`, { method: 'PUT', body: JSON.stringify(data) }),
    riwayat: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request('/verifikator/riwayat' + qs);
    },
    statsPekebun: () => request('/verifikator/stats/pekebun'),
    statsProgram: () => request('/verifikator/stats/program'),
    statsRiwayat: () => request('/verifikator/stats/riwayat'),
  },
  pekebun: {
    profil: () => request('/pekebun/profil'),
    updateProfil: (data) => request('/pekebun/profil', { method: 'PUT', body: JSON.stringify(data) }),
    lahan: {
      list: () => request('/pekebun/lahan'),
      create: (data) => request('/pekebun/lahan', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/pekebun/lahan/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/pekebun/lahan/${id}`, { method: 'DELETE' }),
    },
    programTersedia: () => request('/pekebun/program-tersedia'),
    daftarProgram: (data) => request('/pekebun/daftar-program', { method: 'POST', body: JSON.stringify(data) }),
    programSaya: () => request('/pekebun/program-saya'),
    tbs: {
      list: () => request('/pekebun/tbs'),
      create: (data) => request('/pekebun/tbs', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => request(`/pekebun/tbs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => request(`/pekebun/tbs/${id}`, { method: 'DELETE' }),
    },
  },
};
