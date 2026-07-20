'use client';

import { motion } from 'framer-motion';

const events = [
  { year: '2010', title: 'Berdirinya KUD', desc: 'KUD Desa Tegal Sari resmi didirikan pada 12 Juli 2010 oleh 50 pekebun sawit binaan CV. Sumatera Multi Jaya di Kecamatan Megang Sakti.', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-500' },
  { year: '2015', title: 'Ekspansi Layanan', desc: 'KUD melebarkan sayap melayani lebih dari 300 pekebun di 3 desa: Tegal Sari, Megang Sakti, dan Tugu Sari. Program PSR mulai diperkenalkan.', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-18v18M3 7h2.25m-2.25 3h2.25m-2.25 3h2.25', color: 'bg-emerald-500' },
  { year: '2020', title: '500+ Anggota Aktif', desc: 'Jumlah anggota menembus 500 pekebun dengan total lahan kelola mencapai 1.200 hektar. KUD mulai mengadopsi sistem administrasi berbasis komputer.', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', color: 'bg-amber-500' },
  { year: '2025', title: 'Transformasi Digital', desc: 'KUD meluncurkan sistem informasi digital untuk pendaftaran program PSR, pencatatan hasil panen TBS, informasi harga terkini, dan manajemen anggota secara online.', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25', color: 'bg-primary' },
  { year: '2026', title: '1.250+ Pekebun', desc: 'KUD melayani lebih dari 1.250 pekebun dengan 3.200+ hektar lahan kelola dan 48 program aktif. Menjadi koperasi sawit digital terdepan di Sumatera Selatan.', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z', color: 'bg-amber-500' },
];

export default function Timeline() {
  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto" id="sejarah">
      <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">SEJARAH KUD</span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Perjalanan <span className="text-primary">KUD Tegal Sari</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Dari 50 pekebun hingga lebih dari 1.250 anggota — berikut tonggak sejarah dalam perjalanan kami
          membangun koperasi sawit yang mandiri dan profesional.
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 md:-translate-x-px" />

        {events.map((item, idx) => {
          const isLeft = idx % 2 === 0;
          return (
            <motion.div key={item.year}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative flex items-start gap-6 mb-10 md:mb-14 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

              <div className="hidden md:flex flex-1 justify-end">
                {isLeft ? (
                  <div className="w-full max-w-lg">
                    <TimelineCard item={item} idx={idx} side="left" />
                  </div>
                ) : <div />}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <motion.div whileHover={{ scale: 1.15 }}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${item.color} flex items-center justify-center shadow-lg shadow-black/10 ring-4 ring-white`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </motion.div>
                <span className="mt-1 text-[10px] font-bold text-primary md:hidden">{item.year}</span>
              </div>

              <div className="hidden md:flex flex-1 justify-start">
                {!isLeft ? (
                  <div className="w-full max-w-lg">
                    <TimelineCard item={item} idx={idx} side="right" />
                  </div>
                ) : <div />}
              </div>

              <div className="md:hidden flex-1 min-w-0">
                <TimelineCard item={item} idx={idx} side={isLeft ? 'left' : 'right'} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function TimelineCard({ item }) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(37,99,235,0.08)' }}
      className="bg-white rounded-2xl border border-border p-5 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${item.color}`}>{item.year}</span>
        <h3 className="font-heading font-bold text-foreground text-sm">{item.title}</h3>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}
