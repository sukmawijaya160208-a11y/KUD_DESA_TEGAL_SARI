'use client';

import { motion } from 'framer-motion';

const events = [
  { year: '2019', title: 'Berdirinya KUD Sari Subur', desc: 'KUD Desa Sari Subur resmi didirikan pada tahun 2019 oleh 50 pekebun sawit di Kecamatan Megang Sakti, Kabupaten Musi Rawas, sebagai wadah perjuangan petani sawit.', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-500' },
  { year: '2020', title: 'Program PSR Dimulai', desc: 'KUD mulai mengakses program Peremajaan Sawit Rakyat (PSR) untuk membantu pekebun meremajakan kebun sawit tua yang tidak produktif.', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-18v18M3 7h2.25m-2.25 3h2.25m-2.25 3h2.25', color: 'bg-emerald-500' },
  { year: '2021', title: '200+ Anggota Aktif', desc: 'Jumlah anggota mencapai 200 pekebun dengan total lahan kelola 500+ hektar. KUD mulai membangun sistem administrasi yang lebih tertib.', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', color: 'bg-amber-500' },
  { year: '2022', title: 'Kemitraan Strategis', desc: 'KUD menjalin kemitraan dengan PTPN, Bank BRI, dan Dinas Perkebunan untuk memperluas akses modal, pupuk, dan pasar bagi pekebun.', icon: 'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z', color: 'bg-purple-500' },
  { year: '2023', title: 'Pelatihan BPDP & Tokoh Teladan', desc: 'KUD aktif mengirim anggota untuk pelatihan SDM Perkebunan Sawit yang diselenggarakan BPDP dan Ditjenbun. Ketua KUD terpilih sebagai Tokoh Teladan.', icon: 'M4.26 10.147a60.438 60.438 0 0-.529 3.853.75.75 0 0 0 1.498.112c.248-1.523.59-2.945 1.01-4.112M4.26 10.147a60.12 60.12 0 0 1 5.315-4.729M4.26 10.147a60.058 60.058 0 0 1 2.115 7.323m13.243-6.443a60.12 60.12 0 0 0-5.315-4.729m5.315 4.729a60.438 60.438 0 0 1 .529 3.853.75.75 0 0 1-1.498.112c-.248-1.523-.59-2.945-1.01-4.112m-5.461-6.01a60.04 60.04 0 0 1 5.816 3.168A60.36 60.36 0 0 1 12 3.375a60.36 60.36 0 0 1-10.923 4.48A60.04 60.04 0 0 1 6.922 3.17m5.461 6.01A60.04 60.04 0 0 0 6.922 3.17', color: 'bg-primary' },
  { year: '2024', title: 'Beasiswa SDM Sawit BPDPKS', desc: '52 mahasiswa penerima Beasiswa Pendidikan SDM Sawit dari BPDPKS dilepas Bupati Musi Rawas. KUD juga perluas jangkauan ke 500+ pekebun.', icon: 'M4.26 10.147a60.438 60.438 0 0-.529 3.853.75.75 0 0 0 1.498.112c.248-1.523.59-2.945 1.01-4.112M4.26 10.147a60.12 60.12 0 0 1 5.315-4.729M4.26 10.147a60.058 60.058 0 0 1 2.115 7.323m13.243-6.443a60.12 60.12 0 0 0-5.315-4.729m5.315 4.729a60.438 60.438 0 0 1 .529 3.853.75.75 0 0 1-1.498.112c-.248-1.523-.59-2.945-1.01-4.112m-5.461-6.01a60.04 60.04 0 0 1 5.816 3.168A60.36 60.36 0 0 1 12 3.375a60.36 60.36 0 0 1-10.923 4.48A60.04 60.04 0 0 1 6.922 3.17m5.461 6.01A60.04 60.04 0 0 0 6.922 3.17', color: 'bg-amber-500' },
  { year: '2025', title: 'Transformasi Digital & 371 Anggota BPJS', desc: 'KUD luncurkan sistem informasi digital untuk pendaftaran PSR, harga TBS, dan manajemen anggota. 371 anggota terdaftar BPJS Ketenagakerjaan.', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25', color: 'bg-primary' },
  { year: '2026', title: '532+ Pekebun & Digital', desc: 'KUD melayani 532+ pekebun dengan website dan aplikasi digital. Menjadi koperasi sawit modern terdepan di Sumatera Selatan.', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z', color: 'bg-amber-500' },
];

export default function Timeline() {
  return (
    <section className="py-14 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto" id="sejarah">
      <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">SEJARAH KUD</span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Perjalanan <span className="text-primary">KUD Sari Subur</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Dari 50 pekebun hingga 371 anggota — berikut tonggak sejarah dalam perjalanan kami
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
              className={`relative flex items-start gap-3 md:gap-6 mb-10 md:mb-14 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

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
      className="bg-white rounded-2xl border border-border p-4 md:p-5 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${item.color}`}>{item.year}</span>
        <h3 className="font-heading font-bold text-foreground text-sm">{item.title}</h3>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}
