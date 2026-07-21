'use client';
import { motion } from 'framer-motion';

export default function AboutSection({ teks }) {
  if (!teks) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 sm:p-10 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Tentang Aplikasi
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {teks}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
