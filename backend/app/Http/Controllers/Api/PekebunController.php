<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lahan;
use App\Models\PendaftaranProgram;
use App\Models\ProgramKud;
use App\Models\TbsSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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

        return response()->json(Lahan::where('pekebun_id', $pekebun->id)->get());
    }

    public function lahanStore(Request $request)
    {
        $pekebun = $request->user()->pekebun;
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
    public function programTersedia()
    {
        return response()->json(ProgramKud::where('aktif', true)->withCount('pendaftaranProgram')->get());
    }

    public function daftarProgram(Request $request)
    {
        $pekebun = $request->user()->pekebun;
        $validated = $request->validate([
            'program_kud_id' => 'required|exists:program_kud,id',
            'lahan_id' => 'nullable|exists:lahan,id',
            'data' => 'nullable|array',
        ]);

        $exists = PendaftaranProgram::where([
            'pekebun_id' => $pekebun->id,
            'program_kud_id' => $validated['program_kud_id'],
        ])->whereIn('status', ['pending', 'verified'])->first();

        if ($exists) {
            return response()->json(['message' => 'Anda sudah mendaftar program ini sebelumnya'], 400);
        }

        $program = ProgramKud::findOrFail($validated['program_kud_id']);
        $persyaratan = $program->persyaratan ?? [];

        if (! empty($persyaratan) && empty($validated['data']['dokumen'])) {
            return response()->json(['message' => 'Lengkapi semua persyaratan dokumen'], 400);
        }

        if (! empty($persyaratan)) {
            $uploaded = array_keys($validated['data']['dokumen'] ?? []);
            $missing = array_diff($persyaratan, $uploaded);
            if (! empty($missing)) {
                return response()->json(['message' => 'Dokumen belum lengkap: '.implode(', ', $missing)], 400);
            }
        }

        DB::beginTransaction();
        try {
            $daftar = PendaftaranProgram::create([
                'pekebun_id' => $pekebun->id,
                'program_kud_id' => $validated['program_kud_id'],
                'lahan_id' => $validated['lahan_id'] ?? null,
                'data' => $validated['data'] ?? null,
            ]);

            DB::commit();

            return response()->json($daftar->load('programKud', 'lahan'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // Hapus file dokumen yang terlanjur diupload ke storage
            if (! empty($validated['data']['dokumen'])) {
                foreach ($validated['data']['dokumen'] as $jenis => $urlPath) {
                    $relativePath = ltrim(parse_url($urlPath, PHP_URL_PATH), '/storage/');
                    if ($relativePath && Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
            }

            return response()->json(['message' => 'Gagal mendaftar program: '.$e->getMessage()], 500);
        }
    }

    public function programSaya()
    {
        $pekebun = request()->user()->pekebun;

        return response()->json(
            PendaftaranProgram::where('pekebun_id', $pekebun->id)
                ->with('programKud', 'lahan')
                ->latest()
                ->get()
        );
    }

    // === TBS SYNC ===
    public function tbsIndex()
    {
        $pekebun = request()->user()->pekebun;

        return response()->json(TbsSync::where('pekebun_id', $pekebun->id)->latest()->get());
    }

    public function tbsStore(Request $request)
    {
        $pekebun = $request->user()->pekebun;
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
        if ($tbsSync->pekebun_id !== $request->user()->pekebun->id) {
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
        if ($tbsSync->pekebun_id !== $request->user()->pekebun->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $tbsSync->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
