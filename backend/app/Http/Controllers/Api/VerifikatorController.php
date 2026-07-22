<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pekebun;
use App\Models\PendaftaranProgram;
use App\Models\VerifikasiLog;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\NotifikasiController;

class VerifikatorController extends Controller
{
    public function pengajuanPekebun(Request $request)
    {
        $query = Pekebun::with('user', 'lahan');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nama', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%")
                  ->orWhere('no_whatsapp', 'like', "%{$s}%");
            });
        }

        $perPage = min((int) $request->perPage ?: 10, 100);

        return response()->json($query->latest()->paginate($perPage));
    }

    public function verifikasiPekebun(Request $request, Pekebun $pekebun)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'catatan' => 'nullable|string',
        ]);

        $pekebun->update([
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'catatan_verifikasi' => isset($validated['catatan']) ? strip_tags($validated['catatan']) : null,
        ]);

        VerifikasiLog::create([
            'verifiable_type' => Pekebun::class,
            'verifiable_id' => $pekebun->id,
            'user_id' => $request->user()->id,
            'tindakan' => $validated['status'] === 'verified' ? 'terima' : 'tolak',
            'catatan' => $validated['catatan'] ?? null,
        ]);

        $statusLabel = $validated['status'] === 'verified' ? 'Disetujui' : 'Ditolak';
        NotifikasiController::createForUser(
            $pekebun->user_id,
            "Verifikasi Profil: $statusLabel",
            "Status profil Anda telah $statusLabel oleh verifikator.".($validated['catatan'] ? " Catatan: {$validated['catatan']}" : ''),
            '/pekebun/profil'
        );

        return response()->json(['message' => 'Verifikasi berhasil']);
    }

    public function pengajuanProgram(Request $request)
    {
        $query = PendaftaranProgram::with('pekebun.user', 'pekebun.lahan', 'programKud', 'lahan');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'pending');
        }

        if ($request->filled('program_id')) {
            $query->where('program_kud_id', $request->program_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('pekebun', function ($q2) use ($s) {
                    $q2->where('nama', 'like', "%{$s}%");
                })->orWhereHas('programKud', function ($q2) use ($s) {
                    $q2->where('nama', 'like', "%{$s}%");
                });
            });
        }

        $perPage = min((int) $request->perPage ?: 10, 100);

        return response()->json($query->latest()->paginate($perPage));
    }

    public function verifikasiProgram(Request $request, PendaftaranProgram $pendaftaranProgram)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'catatan' => 'nullable|string',
        ]);

        $pendaftaranProgram->update([
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'catatan_verifikasi' => isset($validated['catatan']) ? strip_tags($validated['catatan']) : null,
        ]);

        VerifikasiLog::create([
            'verifiable_type' => PendaftaranProgram::class,
            'verifiable_id' => $pendaftaranProgram->id,
            'user_id' => $request->user()->id,
            'tindakan' => $validated['status'] === 'verified' ? 'terima' : 'tolak',
            'catatan' => $validated['catatan'] ?? null,
        ]);

        $statusLabel = $validated['status'] === 'verified' ? 'Disetujui' : 'Ditolak';
        $pekebunId = $pendaftaranProgram->pekebun_id;
        $pekebun = Pekebun::find($pekebunId);
        if ($pekebun) {
            NotifikasiController::createForUser(
                $pekebun->user_id,
                "Verifikasi Program: $statusLabel",
                "Pendaftaran program {$pendaftaranProgram->programKud->nama} telah $statusLabel.".($validated['catatan'] ? " Catatan: {$validated['catatan']}" : ''),
                '/pekebun/program'
            );
        }

        return response()->json(['message' => 'Verifikasi berhasil']);
    }

    public function riwayat(Request $request)
    {
        $query = VerifikasiLog::with(['user', 'verifiable']);

        if ($request->filled('tindakan')) {
            $query->where('tindakan', $request->tindakan);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('catatan', 'like', "%{$s}%")
                  ->orWhereHas('user', function ($q2) use ($s) {
                      $q2->where('name', 'like', "%{$s}%");
                  })
                  ->orWhereHasMorph('verifiable', ['App\Models\Pekebun'], function ($q3) use ($s) {
                      $q3->where('nama', 'like', "%{$s}%");
                  })
                  ->orWhereHasMorph('verifiable', ['App\Models\PendaftaranProgram'], function ($q4) use ($s) {
                      $q4->whereHas('programKud', function ($q5) use ($s) {
                          $q5->where('nama', 'like', "%{$s}%");
                      });
                  });
            });
        }

        $perPage = min((int) $request->perPage ?: 10, 100);

        return response()->json($query->latest()->paginate($perPage));
    }

    public function statsPekebun()
    {
        return response()->json([
            'total' => Pekebun::count(),
            'pending' => Pekebun::where('status', 'pending')->count(),
            'verified' => Pekebun::where('status', 'verified')->count(),
            'rejected' => Pekebun::where('status', 'rejected')->count(),
        ]);
    }

    public function statsProgram()
    {
        return response()->json([
            'total' => PendaftaranProgram::count(),
            'pending' => PendaftaranProgram::where('status', 'pending')->count(),
            'verified' => PendaftaranProgram::where('status', 'verified')->count(),
            'rejected' => PendaftaranProgram::where('status', 'rejected')->count(),
        ]);
    }

    public function riwayatDestroy(VerifikasiLog $verifikasiLog)
    {
        $verifikasiLog->delete();

        return response()->json(['message' => 'Log berhasil dihapus']);
    }

    public function statsRiwayat()
    {
        return response()->json([
            'total' => VerifikasiLog::count(),
            'terima' => VerifikasiLog::where('tindakan', 'terima')->count(),
            'tolak' => VerifikasiLog::where('tindakan', 'tolak')->count(),
        ]);
    }
}
