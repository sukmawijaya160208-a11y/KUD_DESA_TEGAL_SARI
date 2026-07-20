<?php

namespace Database\Seeders;

use App\Models\Pengaturan;
use App\Models\ProgramKud;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin KUD',
            'email' => 'admin@kud.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Verifikator KUD',
            'email' => 'verifikator@kud.com',
            'password' => bcrypt('password'),
            'role' => 'verifikator',
        ]);

        $programs = ['PSR', 'Intensifikasi', 'Ekstensifikasi', 'Pelatihan SDMPKS', 'Beasiswa SDMPKS', 'Kemitraan'];
        foreach ($programs as $p) {
            ProgramKud::create(['nama' => $p, 'jenis' => $p, 'deskripsi' => "Program $p"]);
        }

        Pengaturan::create(['key' => 'nama_ketua', 'value' => '']);
        Pengaturan::create(['key' => 'tahun_anggaran', 'value' => date('Y')]);
        Pengaturan::create(['key' => 'nama_kud', 'value' => 'KUD Desa Sari Subur']);
        Pengaturan::create(['key' => 'logo_kud', 'value' => '/storage/profil/logo.jpeg']);

        $this->call(BlogSeeder::class);
    }
}
