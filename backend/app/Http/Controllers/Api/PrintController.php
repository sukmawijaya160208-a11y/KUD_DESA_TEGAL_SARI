<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lahan;
use App\Models\Pekebun;
use App\Models\Pengaturan;
use App\Models\SettingKud;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class PrintController extends Controller
{
    public function kartuAnggota(Pekebun $pekebun)
    {
        $pekebun->load('user');
        $setting_kud = SettingKud::first();
        $pengaturan = Pengaturan::pluck('value', 'key');
        $nomor_anggota = 'KUD-' . str_pad($pekebun->id, 5, '0', STR_PAD_LEFT) . '/' . now()->format('Y');
        $tanggal_terbit = now()->format('d F Y');
        $masa_berlaku = now()->addYears(5)->format('d F Y');

        $pdf = Pdf::loadView('pdf.kartu-anggota', compact(
            'pekebun', 'setting_kud', 'pengaturan', 'nomor_anggota', 'tanggal_terbit', 'masa_berlaku'
        ))->setPaper([0, 0, 498.9, 158.74]);

        return $pdf->stream('kartu-anggota-' . $pekebun->nama . '.pdf');
    }

    public function kartuAnggotaSaya()
    {
        $pekebun = request()->user()->pekebun;
        if (!$pekebun) {
            return response()->json(['message' => 'Data pekebun tidak ditemukan'], 404);
        }

        $pekebun->load('user');
        $setting_kud = SettingKud::first();
        $pengaturan = Pengaturan::pluck('value', 'key');
        $nomor_anggota = 'KUD-' . str_pad($pekebun->id, 5, '0', STR_PAD_LEFT) . '/' . now()->format('Y');
        $tanggal_terbit = now()->format('d F Y');
        $masa_berlaku = now()->addYears(5)->format('d F Y');

        $pdf = Pdf::loadView('pdf.kartu-anggota', compact(
            'pekebun', 'setting_kud', 'pengaturan', 'nomor_anggota', 'tanggal_terbit', 'masa_berlaku'
        ))->setPaper([0, 0, 498.9, 158.74]);

        return $pdf->stream('kartu-anggota-' . $pekebun->nama . '.pdf');
    }

    public function kartuAdmin(User $user)
    {
        $setting_kud = SettingKud::first();

        $pdf = Pdf::loadView('pdf.kartu-admin', compact('user', 'setting_kud'))
            ->setPaper([0, 0, 498.9, 158.74]);

        return $pdf->stream('kartu-admin-' . $user->name . '.pdf');
    }

    public function sertifikat(Pekebun $pekebun)
    {
        $pekebun->load('user');
        $setting_kud = SettingKud::first();
        $pengaturan = Pengaturan::pluck('value', 'key');
        $nomor_anggota = 'KUD-' . str_pad($pekebun->id, 5, '0', STR_PAD_LEFT) . '/' . now()->format('Y');

        $pdf = Pdf::loadView('pdf.sertifikat', compact(
            'pekebun', 'setting_kud', 'pengaturan', 'nomor_anggota'
        ))->setPaper('a4', 'landscape');

        return $pdf->stream('sertifikat-' . $pekebun->nama . '.pdf');
    }

    public function sertifikatSaya()
    {
        $pekebun = request()->user()->pekebun;
        if (!$pekebun) {
            return response()->json(['message' => 'Data pekebun tidak ditemukan'], 404);
        }

        $pekebun->load('user');
        $setting_kud = SettingKud::first();
        $pengaturan = Pengaturan::pluck('value', 'key');
        $nomor_anggota = 'KUD-' . str_pad($pekebun->id, 5, '0', STR_PAD_LEFT) . '/' . now()->format('Y');

        $pdf = Pdf::loadView('pdf.sertifikat', compact(
            'pekebun', 'setting_kud', 'pengaturan', 'nomor_anggota'
        ))->setPaper('a4', 'landscape');

        return $pdf->stream('sertifikat-' . $pekebun->nama . '.pdf');
    }
}
