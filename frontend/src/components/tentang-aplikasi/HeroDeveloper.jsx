'use client';
import { motion } from 'framer-motion';
import { PhoneIcon, CameraIcon, EnvelopeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function HeroDeveloper({ data, admin, onEdit }) {
  if (!data) return null;

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
      <div className="absolute top-0 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="shrink-0"
          >
            <div className="relative">
              <div className="w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-2xl">
                {data.foto_pengembang ? (
                  <img
                    src={data.foto_pengembang}
                    alt={data.developer_name || 'Foto Pengembang'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700/50 text-slate-400">
                    <CameraIcon className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-emerald-500 rounded-full blur-xl opacity-30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {data.developer_name || 'Pengembang'}
            </h1>
            {data.developer_role && (
              <p className="mt-2 text-lg sm:text-xl text-emerald-400 font-medium">
                {data.developer_role}
              </p>
            )}

            <div className="mt-6 w-20 h-1 bg-emerald-500 rounded-full mx-auto lg:mx-0" />

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {data.kontak && (
                <a
                  href={`https://wa.me/${data.kontak.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  <PhoneIcon className="w-4 h-4" />
                  {data.kontak}
                </a>
              )}
              {data.instagram && (
                <a
                  href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-pink-400 transition-colors text-sm"
                >
                  <CameraIcon className="w-4 h-4" />
                  {data.instagram}
                </a>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors text-sm"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  {data.email}
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {admin && onEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit Profil
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
