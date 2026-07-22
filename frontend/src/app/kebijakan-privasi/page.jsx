'use client';

import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function KebijakanPrivasiPage() {
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
              <LockClosedIcon className="w-4 h-4" />
              Privasi
            </div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">Kebijakan Privasi</h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Bagaimana KUD Desa Sari Subur mengelola dan melindungi data pribadi Anda
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose prose-sm md:prose-base max-w-none text-gray-700">
          <h2>1. Pendahuluan</h2>
          <p>
            KUD Desa Sari Subur ("KUD", "kami", "kita") berkomitmen untuk melindungi privasi Pengguna aplikasi Sistem Informasi Koperasi Unit Desa Sari Subur ("Aplikasi"). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi data pribadi Anda.
          </p>

          <h2>2. Data yang Dikumpulkan</h2>
          <p>Kami dapat mengumpulkan data berikut:</p>
          <ul>
            <li><strong>Data Akun:</strong> Nama lengkap, alamat email, nomor telepon, kata sandi (dienkripsi).</li>
            <li><strong>Data Profil Pekebun:</strong> Nomor KTP, alamat, foto KTP/KK, foto profil, data lahan, surat tanah, surat keterangan.</li>
            <li><strong>Data Transaksi:</strong> Data TBS (panen), pendaftaran program, riwayat verifikasi.</li>
            <li><strong>Data Teknis:</strong> Alamat IP, jenis peramban, halaman yang dikunjungi, waktu akses.</li>
          </ul>

          <h2>3. Penggunaan Data</h2>
          <p>Data yang dikumpulkan digunakan untuk:</p>
          <ul>
            <li>Menyediakan dan mengelola Aplikasi.</li>
            <li>Verifikasi identitas dan data pekebun.</li>
            <li>Pengelolaan program KUD dan pendaftaran.</li>
            <li>Pencatatan dan pelaporan transaksi TBS.</li>
            <li>Komunikasi terkait layanan dan informasi program.</li>
            <li>Peningkatan kualitas layanan Aplikasi.</li>
            <li>Kepatuhan terhadap kewajiban hukum yang berlaku.</li>
          </ul>

          <h2>4. Perlindungan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data pribadi Anda dari akses tidak sah, perubahan, pengungkapan, atau penghancuran. Langkah-langkah tersebut meliputi enkripsi kata sandi, penggunaan token autentikasi, dan pembatasan akses data berdasarkan peran pengguna.
          </p>

          <h2>5. Pembagian Data</h2>
          <p>
            Kami tidak menjual data pribadi Anda kepada pihak ketiga. Data dapat dibagikan dalam situasi berikut:
          </p>
          <ul>
            <li>Dengan petugas KUD yang berwenang untuk keperluan verifikasi dan pengelolaan.</li>
            <li>Dengan penyedia layanan teknis yang membantu pengoperasian Aplikasi (hosting, penyimpanan).</li>
            <li>Jika diwajibkan oleh hukum atau peraturan perundang-undangan yang berlaku.</li>
          </ul>

          <h2>6. Penyimpanan Data</h2>
          <p>
            Data pribadi Anda disimpan selama akun Anda aktif atau selama diperlukan untuk memenuhi tujuan yang dijelaskan dalam Kebijakan Privasi ini. Data dapat disimpan lebih lama jika diwajibkan oleh hukum. Setelah tidak diperlukan, data akan dihapus atau dianonimkan.
          </p>

          <h2>7. Hak Pengguna</h2>
          <p>Anda berhak untuk:</p>
          <ul>
            <li>Mengakses data pribadi yang kami miliki.</li>
            <li>Memperbarui atau memperbaiki data yang tidak akurat.</li>
            <li>Meminta penghapusan data (dengan batasan tertentu).</li>
            <li>Menarik persetujuan pengelolaan data.</li>
            <li>Mengajukan keluhan terkait pengelolaan data pribadi.</li>
          </ul>
          <p>
            Untuk menggunakan hak-hak tersebut, silakan hubungi pengelola Aplikasi.
          </p>

          <h2>8. Cookie</h2>
          <p>
            Aplikasi dapat menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna. Cookie digunakan untuk menyimpan preferensi sesi dan data autentikasi. Anda dapat mengatur preferensi cookie melalui pengaturan peramban Anda.
          </p>

          <h2>9. Perubahan Kebijakan</h2>
          <p>
            Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui Aplikasi. Kami menyarankan untuk meninjau halaman ini secara berkala.
          </p>

          <h2>10. Kontak</h2>
          <p>
            Jika ada pertanyaan atau kekhawatiran mengenai Kebijakan Privasi ini, silakan hubungi pengelola KUD Desa Sari Subur.
          </p>

          <p className="text-sm text-gray-400 mt-8 italic">
            Terakhir diperbarui: Juli 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
