'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function TbsCalculator() {
  const [hektar, setHektar] = useState(2);
  const [pohon, setPohon] = useState(130);
  const [harga, setHarga] = useState(2650);

  const totalPohon = hektar * pohon;
  const estimasiTbs = totalPohon * 0.8;
  const beratPerTbs = 12;
  const totalBerat = estimasiTbs * beratPerTbs;
  const pendapatan = totalBerat * harga;
  const pendapatanPerBulan = pendapatan / 6;

  const formatRupiah = (num) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground">Luas Lahan: <span className="text-primary font-bold">{hektar} Ha</span></label>
            <input type="range" min="0.5" max="10" step="0.5" value={hektar} onChange={(e) => setHektar(parseFloat(e.target.value))} className="mt-2 w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-100 accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0.5 Ha</span><span>10 Ha</span></div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Pohon/Ha: <span className="text-primary font-bold">{pohon}</span></label>
            <input type="range" min="100" max="150" step="1" value={pohon} onChange={(e) => setPohon(parseInt(e.target.value))} className="mt-2 w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-100 accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>100</span><span>150</span></div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Harga TBS/kg: <span className="text-primary font-bold">{formatRupiah(harga)}</span></label>
            <input type="range" min="1500" max="3500" step="50" value={harga} onChange={(e) => setHarga(parseInt(e.target.value))} className="mt-2 w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-100 accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Rp 1.500</span><span>Rp 3.500</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-100/50">
          <h4 className="font-bold font-heading text-foreground text-sm mb-4 flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4 text-primary" />Estimasi Pendapatan</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Pohon</span><span className="font-semibold">{totalPohon.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimasi TBS Panen</span><span className="font-semibold">{estimasiTbs.toLocaleString()} tandan</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Berat</span><span className="font-semibold">{totalBerat.toLocaleString()} kg</span></div>
            <div className="border-t border-emerald-200/50 pt-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Per Musim Panen</span><span className="font-bold text-primary text-lg">{formatRupiah(pendapatan)}</span></div>
              <div className="flex justify-between text-sm mt-1"><span className="text-muted-foreground">Rata-rata/Bulan</span><span className="font-semibold text-primary">{formatRupiah(pendapatanPerBulan)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-6">*Estimasi berdasarkan asumsi standar. Hasil aktual dapat berbeda.</p>
    </motion.div>
  );
}
