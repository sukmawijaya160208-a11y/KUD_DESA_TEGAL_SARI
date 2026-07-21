<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lahan;
use App\Models\Pekebun;
use App\Models\PendaftaranProgram;
use App\Models\ProgramKud;
use App\Models\TbsSync;
use App\Models\User;
use App\Models\VerifikasiLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    // ===== PEKEBUN =====
    public function pekebunPdf(Request $request)
    {
        $query = Pekebun::with('user', 'lahan');
        $this->applyFilters($request, $query);

        $data = $query->orderBy('created_at', 'desc')->get();

        $pdf = Pdf::loadView('exports.pekebun-pdf', [
            'data' => $data,
            'title' => 'Data Pekebun',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('data-pekebun-'.now()->format('Y-m-d').'.pdf');
    }

    public function pekebunCsv(Request $request)
    {
        $query = Pekebun::with('user', 'lahan');
        $this->applyFilters($request, $query);

        $data = $query->orderBy('created_at', 'desc')->get();

        $headers = ['Nama', 'NIK', 'No KK', 'Tempat Lahir', 'Tanggal Lahir', 'No WhatsApp', 'Alamat', 'Email', 'Status', 'Jumlah Lahan', 'Tanggal Daftar'];
        $rows = $data->map(fn ($p) => [
            $p->nama,
            "'".$p->nik,
            "'".$p->no_kk,
            $p->tempat_lahir,
            $p->tanggal_lahir,
            $p->no_whatsapp,
            $p->alamat,
            $p->user->email ?? '',
            $p->status,
            $p->lahan->count(),
            $p->created_at->format('Y-m-d'),
        ])->toArray();

        return $this->csvResponse('data-pekebun', $headers, $rows);
    }

    // ===== USERS =====
    public function usersPdf(Request $request)
    {
        $query = User::with('pekebun');
        $data = $query->latest()->get();

        $pdf = Pdf::loadView('exports.users-pdf', [
            'data' => $data,
            'title' => 'Data Users',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('data-users-'.now()->format('Y-m-d').'.pdf');
    }

    public function usersCsv(Request $request)
    {
        $data = User::with('pekebun')->latest()->get();

        $headers = ['Nama', 'Email', 'Role', 'Status Pekebun', 'NIK', 'No WhatsApp', 'Tanggal Daftar'];
        $rows = $data->map(fn ($u) => [
            $u->name,
            $u->email,
            $u->role,
            $u->pekebun->status ?? '-',
            $u->pekebun->nik ?? '-',
            $u->pekebun->no_whatsapp ?? '-',
            $u->created_at->format('Y-m-d'),
        ])->toArray();

        return $this->csvResponse('data-users', $headers, $rows);
    }

    // ===== LAHAN =====
    public function lahanPdf(Request $request)
    {
        $query = Lahan::with('pekebun.user');
        $data = $query->latest()->get();

        $pdf = Pdf::loadView('exports.lahan-pdf', [
            'data' => $data,
            'title' => 'Data Lahan',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('data-lahan-'.now()->format('Y-m-d').'.pdf');
    }

    public function lahanCsv(Request $request)
    {
        $data = Lahan::with('pekebun.user')->latest()->get();

        $headers = ['Pekebun', 'NIK', 'Alamat Lahan', 'Jenis Surat', 'Nomor Surat', 'Luas (M2)', 'Titik Koordinat', 'Tanggal Daftar'];
        $rows = $data->map(fn ($l) => [
            $l->pekebun->nama ?? '-',
            "'".($l->pekebun->nik ?? '-'),
            $l->alamat_lahan,
            $l->jenis_surat ?? '-',
            $l->nomor_surat ?? '-',
            $l->luas_lahan_m2,
            $l->titik_koordinat ?? '-',
            $l->created_at->format('Y-m-d'),
        ])->toArray();

        return $this->csvResponse('data-lahan', $headers, $rows);
    }

    // ===== PENDAFTARAN =====
    public function pendaftaranPdf(Request $request)
    {
        $query = PendaftaranProgram::with('pekebun.user', 'programKud', 'lahan');
        $data = $query->latest()->get();

        $pdf = Pdf::loadView('exports.pendaftaran-pdf', [
            'data' => $data,
            'title' => 'Data Pendaftaran Program',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('data-pendaftaran-'.now()->format('Y-m-d').'.pdf');
    }

    public function pendaftaranCsv(Request $request)
    {
        $data = PendaftaranProgram::with('pekebun.user', 'programKud')->latest()->get();

        $headers = ['Pekebun', 'NIK', 'Program', 'Status', 'Tanggal Daftar', 'Catatan Verifikasi'];
        $rows = $data->map(fn ($p) => [
            $p->pekebun->nama ?? '-',
            "'".($p->pekebun->nik ?? '-'),
            $p->programKud->nama ?? '-',
            $p->status,
            $p->created_at->format('Y-m-d'),
            $p->catatan_verifikasi ?? '-',
        ])->toArray();

        return $this->csvResponse('data-pendaftaran', $headers, $rows);
    }

    // ===== VERIFIKASI LOG =====
    public function verifikasiLogPdf(Request $request)
    {
        $data = VerifikasiLog::with('user', 'verifiable')->latest()->take(500)->get();

        $pdf = Pdf::loadView('exports.verifikasi-log-pdf', [
            'data' => $data,
            'title' => 'Log Verifikasi',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('log-verifikasi-'.now()->format('Y-m-d').'.pdf');
    }

    public function verifikasiLogCsv(Request $request)
    {
        $data = VerifikasiLog::with('user')->latest()->take(500)->get();

        $headers = ['Waktu', 'Verifikator', 'Tindakan', 'Catatan'];
        $rows = $data->map(fn ($v) => [
            $v->created_at->format('Y-m-d H:i'),
            $v->user->name ?? '-',
            $v->tindakan,
            $v->catatan ?? '-',
        ])->toArray();

        return $this->csvResponse('log-verifikasi', $headers, $rows);
    }

    // ===== PROGRAM =====
    public function programPdf(Request $request)
    {
        $query = ProgramKud::withCount('pendaftaranProgram');
        $data = $query->latest()->get();

        $pdf = Pdf::loadView('exports.program-pdf', [
            'data' => $data,
            'title' => 'Data Program KUD',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('data-program-'.now()->format('Y-m-d').'.pdf');
    }

    public function programCsv(Request $request)
    {
        $data = ProgramKud::withCount('pendaftaranProgram')->latest()->get();

        $headers = ['Nama', 'Jenis', 'Aktif', 'Kuota', 'Pendaftar', 'Tanggal Mulai', 'Tanggal Selesai', 'Tanggal Dibuat'];
        $rows = $data->map(fn ($p) => [
            $p->nama,
            $p->jenis,
            $p->aktif ? 'Aktif' : 'Nonaktif',
            $p->kuota ?? '-',
            $p->pendaftaran_program_count,
            $p->tanggal_mulai ? $p->tanggal_mulai->format('Y-m-d') : '-',
            $p->tanggal_selesai ? $p->tanggal_selesai->format('Y-m-d') : '-',
            $p->created_at->format('Y-m-d'),
        ])->toArray();

        return $this->csvResponse('data-program', $headers, $rows);
    }

    // ===== LAPORAN =====
    public function laporanPdf(Request $request)
    {
        $pekebunPerStatus = Pekebun::selectRaw('status, count(*) as total')->groupBy('status')->get();
        $pendaftaranPerProgram = PendaftaranProgram::selectRaw('program_kud_id, count(*) as total')
            ->with('programKud:id,nama')
            ->groupBy('program_kud_id')->get();
        $totalTbsPerBulan = TbsSync::selectRaw("strftime('%Y-%m', tanggal) as bulan, SUM(jumlah_tbs) as total")
            ->groupBy('bulan')->orderBy('bulan')->get();

        $pdf = Pdf::loadView('exports.laporan-pdf', [
            'pekebunPerStatus' => $pekebunPerStatus,
            'pendaftaranPerProgram' => $pendaftaranPerProgram,
            'totalTbsPerBulan' => $totalTbsPerBulan,
            'title' => 'Laporan KUD',
            'date' => now()->translatedFormat('l, d F Y H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('laporan-kud-'.now()->format('Y-m-d').'.pdf');
    }

    public function laporanCsv(Request $request)
    {
        $pekebunPerStatus = Pekebun::selectRaw('status, count(*) as total')->groupBy('status')->get();
        $pendaftaranPerProgram = PendaftaranProgram::selectRaw('program_kud_id, count(*) as total')
            ->with('programKud:id,nama')
            ->groupBy('program_kud_id')->get();
        $totalTbsPerBulan = TbsSync::selectRaw("strftime('%Y-%m', tanggal) as bulan, SUM(jumlah_tbs) as total")
            ->groupBy('bulan')->orderBy('bulan')->get();

        $lines = [];
        $lines[] = '=== PEKEBUN PER STATUS ===';
        $lines[] = 'Status,Total';
        foreach ($pekebunPerStatus as $s) {
            $lines[] = "{$s->status},{$s->total}";
        }
        $lines[] = '';
        $lines[] = '=== PENDAFTARAN PER PROGRAM ===';
        $lines[] = 'Program,Total';
        foreach ($pendaftaranPerProgram as $p) {
            $lines[] = "{$p->programKud->nama},{$p->total}";
        }
        $lines[] = '';
        $lines[] = '=== TOTAL TBS PER BULAN ===';
        $lines[] = 'Bulan,Total TBS';
        foreach ($totalTbsPerBulan as $t) {
            $lines[] = "{$t->bulan},{$t->total}";
        }

        $csv = implode("\r\n", $lines);
        $filename = 'laporan-kud-'.now()->format('Y-m-d').'.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ===== HELPERS =====
    private function applyFilters(Request $request, $query)
    {
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('no_whatsapp', 'like', "%{$search}%");
            });
        }
        if ($status = $request->status) {
            $query->where('status', $status);
        }
    }

    private function csvResponse(string $prefix, array $headers, array $rows)
    {
        $filename = $prefix.'-'.now()->format('Y-m-d').'.csv';
        $lines = [];
        $lines[] = implode(',', array_map(fn ($h) => '"'.$h.'"', $headers));
        foreach ($rows as $row) {
            $lines[] = implode(',', array_map(fn ($v) => '"'.str_replace('"', '""', $v ?? '').'"', $row));
        }
        $csv = implode("\r\n", $lines);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
