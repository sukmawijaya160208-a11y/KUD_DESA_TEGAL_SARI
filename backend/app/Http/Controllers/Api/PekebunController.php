<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lahan;
use App\Models\PendaftaranProgram;
use App\Models\ProgramKud;
use App\Models\TbsSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PekebunController extends Controller
{
    public function profil()
    {
        $pekebun = request()->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }

        return response()->json($pekebun->load('lahan'));
    }

    public function updateProfil(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Data pekebun tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'nik' => 'sometimes|string|size:16|unique:pekebun,nik,'.$pekebun->id,
            'jenis_kelamin' => 'sometimes|in:LAKI-LAKI,PEREMPUAN',
            'no_kk' => 'sometimes|string',
            'tempat_lahir' => 'sometimes|string',
            'tanggal_lahir' => 'sometimes|date',
            'no_whatsapp' => 'sometimes|string',
            'alamat' => 'sometimes|string',
            'foto_pekebun' => 'nullable|string',
            'upload_ktp' => 'nullable|string',
            'upload_kk' => 'nullable|string',
        ]);

        $validated = array_map(fn ($v) => is_string($v) ? strip_tags($v) : $v, $validated);
        $pekebun->update($validated);

        return response()->json($pekebun->load('lahan'));
    }

    // === LAHAN ===
    public function lahanIndex()
    {
        $pekebun = request()->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }

        return response()->json(Lahan::where('pekebun_id', $pekebun->id)->get());
    }

    public function lahanStore(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        $validated = $request->validate([
            'alamat_lahan' => 'required|string',
            'jenis_surat' => 'required|in:SHM,SPPH,SKT',
            'nomor_surat' => 'required|string',
            'luas_lahan_m2' => 'required|numeric|min:0',
            'upload_surat_tanah' => 'nullable|string',
            'upload_surat_keterangan' => 'nullable|string',
            'titik_koordinat' => 'nullable|string',
            'foto_petani' => 'nullable|string',
            'foto_kebun' => 'nullable|string',
        ]);
        $validated['pekebun_id'] = $pekebun->id;
        $validated = array_map(fn ($v) => is_string($v) ? strip_tags($v) : $v, $validated);

        DB::beginTransaction();
        try {
            $lahan = Lahan::create($validated);
            DB::commit();

            return response()->json($lahan, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan lahan: '.$e->getMessage()], 500);
        }
    }

    public function lahanUpdate(Request $request, Lahan $lahan)
    {
        $validated = $request->validate([
            'alamat_lahan' => 'sometimes|string',
            'jenis_surat' => 'sometimes|in:SHM,SPPH,SKT',
            'nomor_surat' => 'sometimes|string',
            'luas_lahan_m2' => 'sometimes|numeric|min:0',
            'upload_surat_tanah' => 'nullable|string',
            'upload_surat_keterangan' => 'nullable|string',
            'titik_koordinat' => 'nullable|string',
            'foto_petani' => 'nullable|string',
            'foto_kebun' => 'nullable|string',
        ]);
        $validated = array_map(fn ($v) => is_string($v) ? strip_tags($v) : $v, $validated);

        DB::beginTransaction();
        try {
            $lahan->update($validated);
            DB::commit();

            return response()->json($lahan);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal memperbarui lahan: '.$e->getMessage()], 500);
        }
    }

    public function lahanDestroy(Lahan $lahan)
    {
        $lahan->delete();

        return response()->json(['message' => 'Lahan berhasil dihapus']);
    }

    // === PROGRAM ===
    public function programTersedia(Request $request)
    {
        $pekebun = request()->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($pekebun->status !== 'verified') {
            return response()->json(['message' => 'Profil Anda belum diverifikasi. Silakan tunggu verifikasi dari verifikator terlebih dahulu.'], 403);
        }
        $perPage = min((int) ($request->per_page ?? 20), 50);
        return response()->json(ProgramKud::where('aktif', true)->withCount('pendaftaranProgram')->paginate($perPage));
    }

    public function programTersediaById(ProgramKud $program)
    {
        $pekebun = request()->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($pekebun->status !== 'verified') {
            return response()->json(['message' => 'Profil Anda belum diverifikasi.'], 403);
        }
        if (! $program->aktif) {
            return response()->json(['message' => 'Program tidak tersedia'], 404);
        }
        return response()->json($program->loadCount('pendaftaranProgram'));
    }

    public function daftarProgram(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($pekebun->status !== 'verified') {
            return response()->json(['message' => 'Profil Anda belum diverifikasi. Silakan tunggu verifikasi dari verifikator terlebih dahulu.'], 403);
        }
        $validated = $request->validate([
            'program_kud_id' => 'required|exists:program_kud,id',
            'lahan_id' => 'nullable|exists:lahan,id',
            'setuju_surat_1' => 'required|boolean',
            'setuju_surat_2' => 'required|boolean',
            'setuju_surat_3' => 'required|boolean',
            'tanda_tangan_digital' => 'required|string',
        ]);

        $exists = PendaftaranProgram::where([
            'pekebun_id' => $pekebun->id,
            'program_kud_id' => $validated['program_kud_id'],
        ])->whereIn('status', ['pending', 'verified'])->first();

        if ($exists) {
            return response()->json(['message' => 'Anda sudah mendaftar program ini sebelumnya'], 400);
        }

        $suratErrors = [];
        if (! $validated['setuju_surat_1']) $suratErrors[] = 'Surat 1 belum disetujui';
        if (! $validated['setuju_surat_2']) $suratErrors[] = 'Surat 2 belum disetujui';
        if (! $validated['setuju_surat_3']) $suratErrors[] = 'Surat 3 belum disetujui';
        if (empty($validated['tanda_tangan_digital'])) $suratErrors[] = 'Tanda tangan digital belum diisi';
        if (! empty($suratErrors)) {
            return response()->json(['message' => implode(', ', $suratErrors)], 400);
        }

        DB::beginTransaction();
        try {
            $daftar = PendaftaranProgram::create([
                'pekebun_id' => $pekebun->id,
                'program_kud_id' => $validated['program_kud_id'],
                'lahan_id' => $validated['lahan_id'] ?? null,
                'setuju_surat_1' => $validated['setuju_surat_1'],
                'setuju_surat_2' => $validated['setuju_surat_2'],
                'setuju_surat_3' => $validated['setuju_surat_3'],
                'tanda_tangan_digital' => $validated['tanda_tangan_digital'],
            ]);

            DB::commit();

            return response()->json($daftar->load('programKud', 'lahan'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal mendaftar program: '.$e->getMessage()], 500);
        }
    }

    public function programSaya(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($pekebun->status !== 'verified') {
            return response()->json(['message' => 'Profil Anda belum diverifikasi.'], 403);
        }
        $perPage = min((int) ($request->per_page ?? 20), 50);

        return response()->json(
            PendaftaranProgram::where('pekebun_id', $pekebun->id)
                ->with('programKud', 'lahan')
                ->latest()
                ->paginate($perPage)
        );
    }

    // === TBS SYNC ===
    public function tbsIndex(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        $perPage = min((int) ($request->per_page ?? 20), 50);

        return response()->json(TbsSync::where('pekebun_id', $pekebun->id)->latest()->paginate($perPage));
    }

    public function tbsStore(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jumlah_tbs' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);
        $validated['pekebun_id'] = $pekebun->id;
        if (isset($validated['keterangan'])) {
            $validated['keterangan'] = strip_tags($validated['keterangan']);
        }

        DB::beginTransaction();
        try {
            $tbs = TbsSync::create($validated);
            DB::commit();

            return response()->json($tbs, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan data TBS: '.$e->getMessage()], 500);
        }
    }

    public function tbsUpdate(Request $request, TbsSync $tbsSync)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($tbsSync->pekebun_id !== $pekebun->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jumlah_tbs' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);
        if (isset($validated['keterangan'])) {
            $validated['keterangan'] = strip_tags($validated['keterangan']);
        }
        $tbsSync->update($validated);

        return response()->json($tbsSync);
    }

    public function tbsDestroy(Request $request, TbsSync $tbsSync)
    {
        $pekebun = $request->user()->pekebun;
        if (! $pekebun) {
            return response()->json(['message' => 'Lengkapi profil pekebun terlebih dahulu'], 400);
        }
        if ($tbsSync->pekebun_id !== $pekebun->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $tbsSync->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
