'use client';

import { motion } from 'framer-motion';

const team = [
  { name: 'Sahuri', role: 'Sekretaris', desc: 'Mengelola administrasi dan kesekretariatan koperasi dengan sistem digital yang transparan dan akuntabel.', initial: 'SH' },
  { name: 'Dedek Sulaiman, S.Pd.I', role: 'Ketua KUD', desc: 'Memimpin koperasi dengan visi kemandirian dan profesionalisme sejak 2010. Berpengalaman 20+ tahun di bidang perkebunan sawit.', initial: 'DS' },
  { name: 'Mas Prapto', role: 'Bendahara', desc: 'Bertanggung jawab atas pengelolaan keuangan koperasi yang sehat dan transparan untuk kesejahteraan anggota.', initial: 'MP' },
  { name: 'Triono', role: 'Manager Operasional', desc: 'Mengelola operasional harian koperasi termasuk pelayanan anggota, program PSR, dan pemasaran TBS.', initial: 'TR' },
  { name: 'M. Sukma Wijaya', role: 'Ketua Pengawas', desc: 'Memastikan seluruh kegiatan koperasi berjalan sesuai AD/ART dan peraturan yang berlaku.', initial: 'MS' },
  { name: 'Fitriani, S.P.', role: 'Koordinator Lapangan', desc: 'Menjembatani komunikasi antara koperasi dan pekebun di 5 desa binaan KUD Tegal Sari.', initial: 'FT' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

function TeamCard({ member, idx }) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      }}
      className="bg-white rounded-2xl border border-border p-6 text-center transition-all duration-200 relative overflow-hidden group cursor-default"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <motion.div whileHover={{ scale: 1.1 }}
        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${['from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-amber-500 to-amber-600', 'from-purple-500 to-purple-600', 'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600'][idx % 6]} flex items-center justify-center shadow-lg shadow-black/5`}>
        <span className="text-white font-bold text-lg font-heading">{member.initial}</span>
      </motion.div>

      <h3 className="font-heading font-bold text-foreground text-sm mb-0.5">{member.name}</h3>
      <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold mb-3">{member.role}</span>
      <p className="text-gray-500 text-xs leading-relaxed">{member.desc}</p>
    </motion.div>
  );
}

export default function TeamSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30 px-6 lg:px-12" id="tim">
      <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
        className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">TIM MANAJEMEN</span>
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
          Pengurus <span className="text-primary">KUD Tegal Sari</span>
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Tim profesional yang berdedikasi tinggi untuk memajukan kesejahteraan pekebun sawit
          melalui layanan koperasi yang transparan dan modern.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {team.map((member, idx) => (
          <TeamCard key={member.name} member={member} idx={idx} />
        ))}
      </motion.div>
    </section>
  );
}
