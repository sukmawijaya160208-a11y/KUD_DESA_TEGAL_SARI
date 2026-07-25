<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $faqItems = [
            ['title' => 'Apa itu KUD Desa Sari Subur?', 'description' => 'KUD (Koperasi Unit Desa) Sari Subur adalah koperasi petani kelapa sawit di Desa Tegal Sari yang bertujuan meningkatkan kesejahteraan petani melalui berbagai program kemitraan, simpan pinjam, dan pelatihan.', 'section_type' => 'faq', 'order' => 1, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bagaimana cara menjadi anggota?', 'description' => 'Calon anggota dapat mendaftar ke kantor KUD dengan membawa KTP, KK, dan surat keterangan dari kepala desa. Setelah verifikasi data, calon anggota akan mengikuti masa orientasi selama 1 bulan.', 'section_type' => 'faq', 'order' => 2, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Berapa harga TBS saat ini?', 'description' => 'Harga TBS (Tandan Buah Segar) diperbarui setiap minggu berdasarkan harga pasar dan kesepakatan Rapat Anggota. Cek halaman utama atau hubungi kantor KUD untuk harga terbaru.', 'section_type' => 'faq', 'order' => 3, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Apa saja syarat pinjaman?', 'description' => 'Syarat pinjaman: anggota aktif minimal 6 bulan, memiliki agunan ringan, mengisi formulir permohonan, dan mendapatkan persetujuan dari 2 orang penjamin yang juga anggota KUD.', 'section_type' => 'faq', 'order' => 4, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bagaimana cara menghubungi KUD?', 'description' => 'Kantor KUD buka Senin-Jumat pukul 08.00-16.00 WITA. Alamat: Jl. Tegal Sari, Kecamatan Tegal Sari. Telepon/WA: 085169883337.', 'section_type' => 'faq', 'order' => 5, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Apakah ada program untuk pemuda tani?', 'description' => 'Ya, KUD memiliki program Petani Muda Berdikari yang memberikan pelatihan, pendampingan, dan akses permodalan khusus untuk petani milenial usia 18-35 tahun.', 'section_type' => 'faq', 'order' => 6, 'is_active' => true, 'meta_data' => json_encode([]), 'created_at' => now(), 'updated_at' => now()],
        ];

        $layananItems = [
            ['title' => 'Call Center', 'description' => 'Hubungi kami setiap hari kerja pukul 08.00-16.00 WITA', 'section_type' => 'layanan', 'order' => 1, 'is_active' => true, 'meta_data' => json_encode(['kontak' => '085169883337', 'icon' => 'PhoneIcon']), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Kantor Pusat', 'description' => 'Jalan Tegal Sari, Kecamatan Tegal Sari', 'section_type' => 'layanan', 'order' => 2, 'is_active' => true, 'meta_data' => json_encode(['kontak' => 'Lihat di Google Maps', 'icon' => 'MapPinIcon']), 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Layanan Online', 'description' => 'Pantau harga, jadwal, dan informasi terbaru lewat website', 'section_type' => 'layanan', 'order' => 3, 'is_active' => true, 'meta_data' => json_encode(['kontak' => 'kud-sari-subur.my.id', 'icon' => 'GlobeAltIcon']), 'created_at' => now(), 'updated_at' => now()],
        ];

        $existingFaq = DB::table('landing_contents')->where('section_type', 'faq')->count();
        if ($existingFaq === 0) {
            DB::table('landing_contents')->insert($faqItems);
        }

        $existingLayanan = DB::table('landing_contents')->where('section_type', 'layanan')->count();
        if ($existingLayanan === 0) {
            DB::table('landing_contents')->insert($layananItems);
        }
    }

    public function down(): void
    {
        DB::table('landing_contents')->whereIn('section_type', ['faq', 'layanan'])->delete();
    }
};
