<?php

namespace Database\Seeders;

use App\Models\BlogMedia;
use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            [
                'title' => 'Tingkatkan Kompetensi Pekebun Sawit, KUD Sari Subur Kirim 45 Anggota Ikut Pelatihan di Palembang',
                'slug' => 'tingkatkan-kompetensi-pekebun-sawit-kud-sari-subur-kirim-45-anggota',
                'excerpt' => 'KUD Sari Subur mengirimkan 45 orang anggotanya untuk mengikuti Pelatihan yang diselenggarakan oleh AKPY, BPDP dan Ditjenbun di Hotel Excelton Palembang.',
                'content' => 'Tingkatkan Kompetensi Pekebun Sawit, KUD Sari Subur mengirimkan 45 orang anggotanya untuk mengikuti Pelatihan yang diselenggarakan oleh AKPY, BPDP dan Ditjenbun di Hotel Excelton Palembang mulai tanggal 21 s/d 25 Mei 2025.

Petani sawit adalah petani yang membudidayakan kelapa sawit sebagai mata pencaharian utama mereka. Mereka mengelola kebun kelapa sawit, mulai dari penanaman, perawatan, hingga panen buah kelapa sawit. Petani sawit bisa merupakan petani swadaya (mandiri) maupun petani yang tergabung dalam program kemitraan dengan perusahaan. Peningkatan kompetensi sumberdaya manusia (SDM) untuk petani sawit sangat diperlukan agar dapat meningkatkan produktivitas, kualitas hasil, dan keberlanjutan usaha perkebunan kelapa sawit. Dengan SDM kompeten, petani dapat mengelola kebun secara lebih efisien, dan beradaptasi dengan tantangan yang ada.

Dengan adanya program pelatihan pengembangan SDM Perkebunan Kelapa Sawit (SDM PKS) yang diadakan Badan Pengelola Dana Perkebunan (BPDP) dan Ditjen Perkebunan, dengan menggandeng Akademi Komunitas Perkebunan Yogyakarta (AKPY) sebagai mitra penyelenggara, maka Koperasi Unit Desa Sari Subur mengikutsertakan 45 orang anggotanya untuk mengikuti pelatihan budi daya kelapa sawit tersebut.

AKPY menyelenggarakan dua pelatihan yaitu Teknis Budidaya Kelapa Sawit, yang diikuti 123 peserta dari kabupaten Musi Rawas. Sedangkan untuk pelatihan Manajemen dan Administrasi Keuangan, diikuti 32 peserta dari kabupaten Ogan Komering Ilir (OKI). Kedua pelatihan diadakan dari 21-25 Mei 2025 di hotel Excelton Palembang.

Dengan adanya pelatihan ini Ketua Koperasi Unit Desa Sari Subur Dedek Sulaiman, S.Pd. I memaparkan bahwa "untuk menghadapi permasalahan-permasalahan perkebunan kelapa sawit perlu adanya solusi dan strategi, agar pengelolaan kebun dan kelembagaan dapat lebih baik sehingga diharapan mampu meningkatkan produktivitas kebun masyarakat dan dapat mejadikan kebun sawit yang baik dan berkelanjutan" ujarnya.

Adapun seluruh biaya selama pelatihan ditanggung oleh panitia, mulai dari Akomodasi, Konsumsi dan Transfortasi pulang pergi hingga uang saku seluruhnya ditanggung Panitia.',
                'category' => 'Pelatihan',
                'featured' => true,
                'media' => ['/images/blog/budidaya sawit 1.jpg', '/images/blog/pemetaan dan budidaya.jpg'],
            ],
            [
                'title' => 'KUD Sari Subur Kirim 16 Anggota Ikut Pelatihan Panen dan Pasca Panen di Palembang',
                'slug' => 'kud-sari-subur-kirim-16-anggota-pelatihan-panen-pasca-panen',
                'excerpt' => 'KUD Sari Subur mengirimkan 16 orang anggotanya untuk mengikuti Pelatihan Panen dan Pasca Panen di Palembang guna meningkatkan kompetensi pekebun sawit.',
                'content' => 'Guna untuk meningkatkan kompetensi pekebun sawit agar semakin pekebun sawit yang professional dalam mengelola kebunnya, Badan Pengelola Dana Perkebunan (BPDP), bersama Direktorat Jenderal Perkebunan (Ditjenbun) Kementerian Pertanian (Kementan) dan Best Planter Indonesia (BPI) menggelar Pelatihan Panen dan Pasca Panen bagi pekebun di Provinsi Sumatera Selatan melalui program Pengembangan Sumber Daya Manusia Perkebunan Kelapa Sawit (SDM PKS).

KUD Sari Subur mengirimkan anggotanya sebanyak 16 orang untuk mengikuti pelatihan Panen dan Pascapanen, hal ini bertujuan untuk meningkatkan pengetahuan dan keterampilan petani mengenai teknik panen dan penanganan pascapanen yang benar. Hal ini bertujuan untuk menghasilkan panen yang berkualitas sesuai standar nasional, meminimalkan kerugian, serta meningkatkan produktivitas dan daya saing perkebunan kelapa sawit.

Ketua KUD Sari Subur Kabupaten Musi Rawas, Dedek Sulaiman, S.Pd.I memaparkan bahwa "penyebab produktivitas sawit rakyat yang ada di KUD Sari Subur belum meningkat maksimal adalah masalah kemampuan sumber daya manusia (SDM) yang masih kurang, Oleh sebab itu kami sangat berperan aktif ketika pemerintah mengadakan pelatihan untuk meningkatkan SDM Sawit".

Pelatihan panen dan pasca panen dilaksanakan di hotel Swarna Dwipa Palembang yang berlangsung sejak tanggal 16 Juni s/d 21 Juni 2025. Adapun seluruh biaya selama pelatihan ditanggung oleh panitia, mulai dari Akomodasi, Konsumsi dan Transfortasi pulang pergi hingga uang saku seluruhnya ditanggung Panitia.',
                'category' => 'Pelatihan',
                'featured' => false,
                'media' => ['/images/blog/panen dan pasca 1.jpg', '/images/blog/panen 2.jpg'],
            ],
            [
                'title' => 'KUD Sari Subur Kirim 13 Orang Peserta Pelatihan Pemetaan Kebun Sawit BPDP dan IPB Training',
                'slug' => 'kud-sari-subur-pelatihan-pemetaan-kebun-sawit-bpdp-ipb',
                'excerpt' => 'KUD Sari Subur mengirimkan 13 orang peserta Pelatihan Pemetaan Kebun Sawit yang diselenggarakan oleh BPDP dan IPB Training guna perkuat legalitas dan tata kelola agraria.',
                'content' => 'KUD Sari Subur Kabupaten Musi Rawas mengirimkan 13 orang Peserta Pelatihan Pemetaan Kebun Sawit yang diselenggarakan oleh BPDP dan IPB Training guna Perkuat Legalitas dan Tata Kelola Agraria yang digelar di Hotel Emilia Hotel By Amazing Palembang sejak tanggal 20 s/d 23 Mei 2025.

Badan Pengelola Dana Perkebunan (BPDP) dan Direktorat Jenderal Perkebunan Kementerian Pertanian bekerja sama dengan IPB Training menggelar Pelatihan Teknis Pemetaan Lokasi Perkebunan Kelapa Sawit di Palembang. Kegiatan ini ditujukan untuk memperkuat kapasitas SDM perkebunan dalam menghadapi tantangan legalitas lahan dan pemanfaatan data spasial.

Pelatihan yang berlangsung secara tatap muka ini diikuti oleh 88 peserta dari tiga kabupaten sentra sawit di Sumatera Selatan: Kabupaten Ogan Komering Ilir, Kabupaten Musi Rawas, dan Kabupaten Musi Rawas Utara. Acara dibuka secara resmi oleh Kepala Dinas Perkebunan Provinsi Sumatera Selatan, Ir Agus Darwa, MSi dan dihadiri oleh perwakilan BP2SDMP Kementerian Pertanian serta tim pengajar dari IPB Training.

Adapun KUD Sari Subur mengirimkan anggotanya sebanyak 13 orang untuk menjadi peserta Pelatihan Teknis Pemetaan Lokasi Perkebunan Kelapa Sawit di Palembang. Ketua KUD Sari Subur, Dedek Sulaiman, S.Pd. I berharap "setelah peserta mengikuti pelatihan tersebut diharapkan mampu dalam hal teknik pengambilan koordinat GPS, penggunaan drone, pemetaan blok kebun, hingga penyusunan peta poligon berbasis spasial, sehingga dapat berkontribusi dalam program-program KUD Sari Subur." ujarnya.

Kepala Dinas Perkebunan Provinsi Sumatera Selatan Ir. Agus Darwa, MSi menjelaskan bahwa pelatihan ini memiliki makna penting dan strategis di tengah meningkatnya penertiban oleh Satgas Penegakan Kawasan Hutan. "Lebih dari 160 ribu hektar kebun di Sumsel saat ini terindikasi berada di kawasan hutan. Tanpa pemahaman pemetaan dan legalitas lahan, petani bisa dirugikan," tegasnya.

Materi pelatihan meliputi teknik pengambilan koordinat GPS, penggunaan drone, pemetaan blok kebun, hingga penyusunan peta poligon berbasis spasial. Pelatihan dilengkapi dengan praktik lapangan dan diskusi kelompok. Adapun seluruh biaya selama pelatihan ditanggung oleh panitia.',
                'category' => 'Pelatihan',
                'featured' => false,
                'media' => ['/images/blog/pemetaan 1.jpg', '/images/blog/pemetaan dan budidaya.jpg'],
            ],
            [
                'title' => '371 Anggota KUD Sari Subur Terima Manfaat BPJS Ketenagakerjaan dari DBH Sawit Sumsel',
                'slug' => 'anggota-kud-sari-subur-bpjs-ketenagakerjaan-dbh-sawit',
                'excerpt' => 'Anggota KUD Sari Subur mendapatkan perlindungan jaminan sosial BPJS Ketenagakerjaan sebanyak 371 orang, didanai dari Dana Bagi Hasil kelapa sawit sebesar 20 persen.',
                'content' => 'Anggota Koperasi Unit Desa Sari Subur Kabupaten Musi Rawas mendapatkan perlindungan jaminan sosial BPJS Ketenagakerjaan sebanyak 371 orang, dimana dana untuk membayar iuran BPJS Ketenagakerjaan tersebut bersumber dari Dana Bagi Hasil (DBH) kelapa sawit sebesar 20 persen.

Adapun jaminan sosial yang didapatkan anggota Koperasi Unit Desa Sari Subur sebanyak 371 orang tersebut adalah Jaminan Kecelakaan Kerja (JKK) dan Jaminan Kesehatan Nasional (JKN).

Program ini tidak terlepas dari Peran Pemerintah Kabupaten Musi Rawas dan Provinsi Sumatera Selatan, terutama Dinas Perkebunan Kabupaten Musi Rawas dan Dinas Perkebunan Provinsi Sumatera Selatan yang telah membantu program ini hingga dapat terealisasi.

Ketua Koperasi Unit Desa Sari Subur, Dedek Sulaiman, S.Pd. I, memaparkan bahwa "kegiatan ini sebagai upaya dalam memberikan perlindungan jaminan sosial ketenagakerjaan bagi pekebun kelapa sawit di Sumatera Selatan khususnya anggota Koperasi Unit Desa Sari Subur Kabupaten Musi Rawas dari risiko kecelakaan kerja dan kematian, oleh karenanya diucapkan terimakasih yang tidak terhingga kepada Stakeholder terkhusus Bapak Kepala Dinas Perkebunan Kabupaten Musi Rawas Kgs. M. Effendi Fery, S.STP., M.Si. dan Bapak Kepala Dinas Perkebunan Provinsi Sumatera Selatan Ir Agus Darwa, M.Si yang sudah berkontribusi sejauh ini terhadap pekebun sawit" ujarnya.',
                'category' => 'Sosial',
                'featured' => false,
                'media' => ['/images/blog/image.png'],
            ],
            [
                'title' => 'Bupati Musi Rawas Lepas 52 Calon Mahasiswa Penerima Beasiswa SDM Sawit BPDPKS',
                'slug' => 'bupati-musi-rawas-lepas-52-mahasiswa-beasiswa-sdm-sawit-bpdpks',
                'excerpt' => 'Bupati Musi Rawas Hj. Ratna Machmud melepas 52 calon mahasiswa penerima Beasiswa Pendidikan Pengembangan SDM Sawit dari BPDPKS tahun 2024.',
                'content' => 'Bupati Musi Rawas Hj. Ratna Machmud melepas secara resmi mahasiswa penerima Beasiswa Pendidikan Pengembangan SDM Sawit dari Badan Pengelola Dana Perkebunan Kelapa Sawit (BPDPKS) tahun anggaran 2024 yang dilaksanakan di Pendopoan rumah dinas Bupati, Rabu (28/8/2024).

Program Pemerintah Kabupaten Musi Rawas melalui Dinas Perkebunan (Disbun) atas kerjasama BPDPKS dengan Dirjen Perkebunan Kementan RI pada tahun 2024 telah berhasil meloloskan 52 Calon mahasiswa penerima beasiswa yang berasal dari masyarakat lokal Kabupaten Musi Rawas.

Bupati Musi Rawas Hj. Ratna Machmud, mengatakan beasiswa ini merupakan rekomendasi Bupati Musi Rawas yang merupakan bentuk awal komitmen Bupati sebagaimana visi dan misi untuk periode selanjutnya 2025-2030, yakni pemberian beasiswa untuk Siswa/Siswi berprestasi di Kabupaten Musi Rawas.

Kepala Dinas Perkebunan Kabupaten Musi Rawas, Kgs M Effendi Fery S.STP.M.Si menyampaikan bahwa pemberian beasiswa SDM Sawit ini bertujuan untuk menciptakan Sumber Daya Manusia yang berkualitas di sektor perkebunan kelapa sawit.

Ketua KUD Sari Subur, Dedek Sulaiman menjelaskan bahwa "tujuan utama beasiswa BPDPKS adalah untuk meningkatkan sumber daya manusia di sektor perkebunan kelapa sawit, beasiswa ini bertujuan untuk mencetak tenaga kerja terampil dan profesional yang siap berkontribusi dalam pengembangan industri kelapa sawit, dan harapannya setelah mereka selesai pendidikannya masing-masing, mampu untuk bekerja secara profesional di industri perkelapasawitan" ujarnya.

Beasiswa BPDPKS memberikan kuliah gratis bagi mahasiswa yang lolos seleksi. Fasilitas yang diberikan meliputi: Biaya Pendidikan, Biaya Hidup, Akomodasi, Uang Saku, Bantuan Transportasi, Sertifikasi Kompetensi, Program Magang, dan Biaya Wisuda.',
                'category' => 'Pendidikan',
                'featured' => false,
                'media' => ['/images/blog/beasiswa 1.jpg', '/images/blog/beasiswa 2.jpg'],
            ],
            [
                'title' => 'Kunjungan dan Pengawasan Dinas Perkebunan Mura terhadap Program PSR KUD Sari Subur',
                'slug' => 'kunjungan-dinas-perkebunan-psr-kud-sari-subur',
                'excerpt' => 'Kunjungan dan pengawasan dari Dinas Perkebunan Kabupaten Musi Rawas terhadap pelaksanaan program PSR KUD Sari Subur Desa Sari Subur.',
                'content' => 'Kunjungan dan pengawasan dari Dinas Perkebunan Kabupaten Musi Rawas terhadap pelaksanaan program PSR KUD Sari Subur Desa Sari Subur. Kegiatan ini merupakan bagian dari monitoring dan evaluasi program Peremajaan Sawit Rakyat (PSR) yang sedang berjalan di wilayah Kecamatan Megang Sakti.

Program PSR (Peremajaan Sawit Rakyat) adalah program pemerintah untuk meremajakan tanaman sawit pekebun yang sudah tua atau tidak produktif. KUD membantu pekebun dalam proses pendaftaran, verifikasi, dan pencairan bantuan. Dengan adanya kunjungan langsung dari Dinas Perkebunan, diharapkan program PSR dapat berjalan sesuai dengan ketentuan dan tepat sasaran.',
                'category' => 'PSR',
                'featured' => false,
                'media' => ['/images/blog/IMG_20200112_162640.jpg'],
            ],
            [
                'title' => 'MoU Tumbang Chiping Program PSR KUD Sari Subur dengan PT. Anggoro Lestari',
                'slug' => 'mou-tumbang-chiping-psr-kud-sari-subur',
                'excerpt' => 'Penandatanganan MoU Tumbang Chiping program PSR KUD Sari Subur Desa Sari Subur dengan PT. Anggoro Lestari di Dinas Perkebunan Kabupaten Musi Rawas.',
                'content' => 'MoU Tumbang Chiping program PSR KUD Sari Subur Desa Sarisubur Kecamatan Megang Sakti Kabupaten Musi Rawas dengan PT. Anggoro Lestari di Dinas Perkebunan Kabupaten Musi Rawas. Kerjasama ini merupakan langkah strategis dalam pelaksanaan program Peremajaan Sawit Rakyat (PSR) di wilayah Kabupaten Musi Rawas.

Dengan adanya kerjasama ini, diharapkan proses tumbang chiping (penumbangan dan pengecekan) tanaman sawit tua dapat berjalan dengan lancar dan sesuai dengan standar operasional prosedur yang telah ditetapkan, sehingga program PSR dapat memberikan manfaat yang optimal bagi pekebun sawit di Desa Sari Subur dan sekitarnya.',
                'category' => 'PSR',
                'featured' => false,
                'media' => ['/images/blog/IMG_20191206_170602.jpg'],
            ],
        ];

        foreach ($articles as $data) {
            $media = $data['media'];
            unset($data['media']);

            $data['views'] = rand(50, 500);
            $data['created_by'] = 1;

            $post = BlogPost::create($data);

            foreach ($media as $i => $url) {
                BlogMedia::create([
                    'blog_post_id' => $post->id,
                    'type' => 'image',
                    'url' => $url,
                    'caption' => null,
                    'order' => $i,
                ]);
            }
        }
    }
}
