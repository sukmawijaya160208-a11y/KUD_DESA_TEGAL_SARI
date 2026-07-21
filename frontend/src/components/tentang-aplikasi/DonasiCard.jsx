'use client';
import { motion } from 'framer-motion';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function DonasiCard({ data }) {
  if (!data) return null;

  const { bank, rekening, rekening_an } = data;

  if (!rekening && !bank) return null;

  return (
    <section className="pb-16 lg:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#fffdf6] border border-amber-200/50 rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Dukungan Pengembangan
                </h3>
                <p className="text-sm text-gray-500">
                  Dukung kami untuk terus mengembangkan aplikasi ini
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-8">
              {bank && (
                <div className="flex-1 p-4 rounded-xl bg-white/60 border border-amber-100/80">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Bank
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{bank}</p>
                </div>
              )}
              {rekening && (
                <div className="flex-1 p-4 rounded-xl bg-white/60 border border-amber-100/80">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    No. Rekening
                  </p>
                  <p className="text-sm font-semibold text-gray-800 font-mono tracking-wide">{rekening}</p>
                </div>
              )}
              {rekening_an && (
                <div className="flex-1 p-4 rounded-xl bg-white/60 border border-amber-100/80">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    A.N.
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{rekening_an}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
