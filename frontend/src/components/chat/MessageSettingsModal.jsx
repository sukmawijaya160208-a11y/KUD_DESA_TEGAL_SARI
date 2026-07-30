'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Volume2, Image, Key } from '@/lib/animated-icons';
import { api } from '@/lib/api';

const WALLPAPERS = [
  { key: null, label: 'Default', bg: 'bg-chat-pattern' },
  { key: 'solid-light', label: 'Putih', bg: 'bg-white' },
  { key: 'solid-cream', label: 'Krem', bg: 'bg-amber-50' },
  { key: 'solid-gray', label: 'Abu', bg: 'bg-gray-100' },
  { key: 'solid-green', label: 'Hijau Muda', bg: 'bg-emerald-50' },
];

export default function MessageSettingsModal({ open, onClose }) {
  const [settings, setSettings] = useState({
    notif_on: true,
    notif_sound: 'default',
    wallpaper: null,
    enter_to_send: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.chat.getSettings()
      .then((res) => {
        if (res) setSettings(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const saveSettings = async (data) => {
    setSaving(true);
    try {
      await api.chat.updateSettings(data);
    } catch {}
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-wa-primary text-white shrink-0">
              <h3 className="text-base font-semibold">Pengaturan Pesan</h3>
              <div className="flex items-center gap-2">
                {saving && <span className="text-[10px] text-white/60">Menyimpan...</span>}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Notification */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notifikasi</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Notifikasi Pesan</p>
                            <p className="text-[11px] text-gray-400">Tampilkan notifikasi saat ada pesan baru</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle('notif_on')}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.notif_on ? 'bg-wa-accent' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${settings.notif_on ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} style={{ transform: settings.notif_on ? 'translateX(22px)' : 'translateX(0)' }} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Suara Notifikasi</p>
                            <p className="text-[11px] text-gray-400">Pilih nada notifikasi pesan baru</p>
                          </div>
                        </div>
                        <select
                          value={settings.notif_sound}
                          onChange={(e) => handleChange('notif_sound', e.target.value)}
                          className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white text-foreground outline-none focus:ring-2 focus:ring-wa-primary/30"
                        >
                          <option value="default">Default</option>
                          <option value="chime">Chime</option>
                          <option value="pop">Pop</option>
                          <option value="gentle">Gentle</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Chat */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Obrolan</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Key className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Enter untuk Kirim</p>
                            <p className="text-[11px] text-gray-400">Kirim pesan dengan tombol Enter</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle('enter_to_send')}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.enter_to_send ? 'bg-wa-accent' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${settings.enter_to_send ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} style={{ transform: settings.enter_to_send ? 'translateX(22px)' : 'translateX(0)' }} />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Image className="w-5 h-5 text-gray-400" />
                          <p className="text-sm font-medium text-foreground">Wallpaper Obrolan</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {WALLPAPERS.map((wp) => (
                            <button
                              key={wp.key || 'default'}
                              onClick={() => handleChange('wallpaper', wp.key)}
                              className={`w-full aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                                settings.wallpaper === wp.key || (!settings.wallpaper && !wp.key)
                                  ? 'border-wa-primary shadow-md'
                                  : 'border-border hover:border-gray-300'
                              }`}
                              title={wp.label}
                            >
                              <div className={`w-full h-full ${wp.bg}`} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {WALLPAPERS.map((wp) => (
                            <span
                              key={wp.key || 'default'}
                              className={`text-[10px] ${settings.wallpaper === wp.key || (!settings.wallpaper && !wp.key) ? 'text-wa-primary font-semibold' : 'text-gray-400'}`}
                            >
                              {wp.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
