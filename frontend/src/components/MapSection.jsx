'use client';

import { motion } from 'framer-motion';
import { useLogo } from '@/hooks/useLogo';

export default function MapSection() {
  const logoUrl = useLogo();

  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto" id="lokasi">
      <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">LOKASI KAMI</span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Temukan <span className="text-primary">Kantor KUD</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Kunjungi kantor kami untuk konsultasi langsung atau informasi lebih lanjut mengenai layanan KUD.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <motion.div initial={{ x: -30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-border p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-5">
            {logoUrl ? (
              <img src={logoUrl} alt="KUD" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold">K</span>
              </div>
            )}
            <div>
              <h3 className="font-heading font-bold text-foreground">KUD Desa Sari Subur</h3>
              <p className="text-xs text-gray-400">Kantor Pusat</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', label: 'Alamat', value: 'Jl. Raya Megang Sakti No. 123, Kec. Megang Sakti, Kab. Musi Rawas, Sumatera Selatan 31657' },
              { icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z', label: 'Telepon', value: '(0714) 123456' },
              { icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', label: 'Email', value: 'info@kudsarisubur.id' },
              { icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Jam Operasional', value: 'Senin - Jumat: 08.00 - 16.00 WIB\nSabtu: 08.00 - 12.00 WIB' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-400 block">{item.label}</span>
                  <span className="text-foreground text-sm whitespace-pre-line">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ x: 30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-muted rounded-2xl border border-border overflow-hidden min-h-[320px] relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127482.14845251206!2d103.61084315!3d-3.1831370499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e3bef3b1e4b1c6f%3A0x7b2f1a3e8c9a0b4d!2sMegang%20Sakti%2C%20Musi%20Rawas%20Regency%2C%20South%20Sumatra!5e0!3m2!1sen!2sid!4v1700000000000"
            width="100%" height="100%" style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi KUD Desa Sari Subur" />
        </motion.div>
      </div>
    </section>
  );
}
