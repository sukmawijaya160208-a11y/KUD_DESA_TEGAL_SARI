'use client';

import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 px-6 lg:px-12 pt-20 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm mb-6 group">
              <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </Link>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full text-sm mb-4 border border-white/10">
              <ShieldCheckIcon className="w-4 h-4" />
              Legal
            </div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">Syarat & Ketentuan</h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Ketentuan penggunaan aplikasi Sistem Informasi Koperasi Unit Desa Sari Subur
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose prose-sm md:prose-base max-w-none text-gray-700">
          <h2>1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses dan menggunakan aplikasi KUD Desa Sari Subur (&quot;Aplikasi&quot;), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat &amp; Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan, mohon untuk tidak menggunakan Aplikasi.
          </p>

          <h2>2. Definisi</h2>
          <ul>
            <li><strong>Aplikasi:</strong> Sistem Informasi Koperasi Unit Desa Sari Subur berbasis web.</li>
            <li><strong>Pengguna:</strong> Setiap individu yang mengakses dan/atau menggunakan Aplikasi.</li>
            <li><strong>KUD:</strong> Koperasi Unit Desa Sari Subur sebagai pengelola Aplikasi.</li>
            <li><strong>Pekebun:</strong> Anggota KUD yang terdaftar sebagai pekebun kelapa sawit.</li>
            <li><strong>Verifikator:</strong> Petugas yang ditunjuk untuk melakukan verifikasi data pekebun dan program.</li>
          </ul>

          <h2>3. Pendaftaran Akun</h2>
          <p>
            Pengguna wajib mendaftarkan akun dengan data yang benar, lengkap, dan akurat. Pengguna bertanggung jawab penuh atas kerahasiaan kredensial akun serta segala aktivitas yang terjadi dalam akun tersebut. KUD berhak menolak, menangguhkan, atau mengakhiri akun apabila ditemukan pelanggaran terhadap ketentuan ini.
          </p>

          <h2>4. Penggunaan Aplikasi</h2>
          <p>Pengguna setuju untuk:</p>
          <ul>
            <li>Menggunakan Aplikasi sesuai dengan peraturan perundang-undangan yang berlaku.</li>
            <li>Tidak menyalahgunakan Aplikasi untuk tujuan ilegal atau tidak etis.</li>
            <li>Tidak mengganggu keamanan, integritas, atau kinerja Aplikasi.</li>
            <li>Tidak menyebarkan konten yang bersifat fitnah, cabul, atau melanggar hak pihak lain.</li>
          </ul>

          <h2>5. Hak dan Kewajiban KUD</h2>
          <p>KUD berhak untuk:</p>
          <ul>
            <li>Mengelola, memelihara, dan mengembangkan Aplikasi.</li>
            <li>Menolak pendaftaran atau menonaktifkan akun yang melanggar ketentuan.</li>
            <li>Melakukan pembaruan terhadap Syarat & Ketentuan sewaktu-waktu.</li>
            <li>Menghapus atau mengedit konten yang diunggah Pengguna jika melanggar ketentuan.</li>
          </ul>

          <h2>6. Data dan Privasi</h2>
          <p>
            KUD menghormati privasi Pengguna. Pengumpulan, penggunaan, dan perlindungan data pribadi diatur dalam Kebijakan Privasi terpisah. Dengan menggunakan Aplikasi, Pengguna menyetujui pengelolaan data sesuai Kebijakan Privasi yang berlaku.
          </p>

          <h2>7. Batasan Tanggung Jawab</h2>
          <p>
            Aplikasi disediakan &quot;sebagaimana adanya&quot; (as is). KUD tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan Aplikasi. KUD tidak menjamin Aplikasi bebas dari gangguan, kesalahan, atau virus.
          </p>

          <h2>8. Perubahan Ketentuan</h2>
          <p>
            KUD berhak mengubah Syarat & Ketentuan ini setiap saat. Perubahan akan diumumkan melalui Aplikasi. Pengguna disarankan untuk meninjau halaman ini secara berkala. Penggunaan Aplikasi setelah perubahan dianggap sebagai penerimaan terhadap perubahan tersebut.
          </p>

          <h2>9. Hukum yang Berlaku</h2>
          <p>
            Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah atau jalur hukum yang berlaku.
          </p>

          <h2>10. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi pengelola Aplikasi melalui halaman kontak yang tersedia.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
