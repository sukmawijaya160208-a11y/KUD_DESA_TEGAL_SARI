<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProgramKud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramKudController extends Controller
{
    public function index(Request $request)
    {
        $query = ProgramKud::withCount('pendaftaranProgram');

        if ($search = $request->search) {
            $query->where('nama', 'like', "%{$search}%");
        }
        if ($jenis = $request->jenis) {
            $query->where('jenis', $jenis);
        }
        if ($request->has('aktif')) {
            $query->where('aktif', filter_var($request->aktif, FILTER_VALIDATE_BOOLEAN));
        }

        $sort = in_array($request->sort, ['nama', 'jenis', 'created_at', 'tanggal_mulai', 'tanggal_selesai']) ? $request->sort : 'created_at';
        $order = $request->order === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $order);

        $perPage = min((int) ($request->per_page ?? 10), 50);
        $programs = $query->paginate($perPage);

        $programs->load([
            'pendaftaranProgram' => function ($q) {
                $q->with('pekebun.user')->latest()->take(5);
            }
        ]);

        return response()->json($programs);
    }

    public function stats()
    {
        return response()->json([
            'total' => ProgramKud::count(),
            'aktif' => ProgramKud::where('aktif', true)->count(),
            'nonaktif' => ProgramKud::where('aktif', false)->count(),
        ]);
    }

    public function toggleAktif(Request $request, ProgramKud $programKud)
    {
        $validated = $request->validate(['aktif' => 'required|boolean']);
        $programKud->update(['aktif' => $validated['aktif']]);

        return response()->json($programKud->loadCount('pendaftaranProgram'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:PSR,Intensifikasi,Ekstensifikasi,Pelatihan SDMPKS,Beasiswa SDMPKS,Kemitraan',
            'deskripsi' => 'nullable|string',
            'foto' => 'nullable|array',
            'foto.*' => 'string',
            'persyaratan' => 'nullable|array',
            'persyaratan.*' => 'string',
            'manfaat' => 'nullable|array',
            'manfaat.*' => 'string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'kuota' => 'nullable|integer|min:0',
            'aktifkan_surat' => 'sometimes|boolean',
            'surat_1_judul' => 'nullable|string',
            'surat_1_isi' => 'nullable|string',
            'surat_2_judul' => 'nullable|string',
            'surat_2_isi' => 'nullable|string',
            'surat_3_judul' => 'nullable|string',
            'surat_3_isi' => 'nullable|string',
            'tanda_tangan_kades_tegal_sari' => 'nullable|string',
            'tanda_tangan_kades_marga_puspita' => 'nullable|string',
            'tanda_tangan_kades_campur_sari' => 'nullable|string',
            'tanda_tangan_ketua_kud' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $validated['nama'] = strip_tags($validated['nama']);
            $validated['deskripsi'] = isset($validated['deskripsi']) ? strip_tags($validated['deskripsi']) : null;
            $validated['persyaratan'] = isset($validated['persyaratan'])
                ? array_map(fn ($p) => strip_tags($p), $validated['persyaratan'])
                : null;
            $validated['manfaat'] = isset($validated['manfaat'])
                ? array_map(fn ($m) => strip_tags($m), $validated['manfaat'])
                : null;

            $program = ProgramKud::create($validated);
            DB::commit();

            return response()->json($program, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan program: '.$e->getMessage()], 500);
        }
    }

    public function update(Request $request, ProgramKud $programKud)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'jenis' => 'sometimes|in:PSR,Intensifikasi,Ekstensifikasi,Pelatihan SDMPKS,Beasiswa SDMPKS,Kemitraan',
            'deskripsi' => 'nullable|string',
            'aktif' => 'sometimes|boolean',
            'foto' => 'nullable|array',
            'foto.*' => 'string',
            'persyaratan' => 'nullable|array',
            'persyaratan.*' => 'string',
            'manfaat' => 'nullable|array',
            'manfaat.*' => 'string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'kuota' => 'nullable|integer|min:0',
            'aktifkan_surat' => 'sometimes|boolean',
            'surat_1_judul' => 'nullable|string',
            'surat_1_isi' => 'nullable|string',
            'surat_2_judul' => 'nullable|string',
            'surat_2_isi' => 'nullable|string',
            'surat_3_judul' => 'nullable|string',
            'surat_3_isi' => 'nullable|string',
            'tanda_tangan_kades_tegal_sari' => 'nullable|string',
            'tanda_tangan_kades_marga_puspita' => 'nullable|string',
            'tanda_tangan_kades_campur_sari' => 'nullable|string',
            'tanda_tangan_ketua_kud' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['nama'])) {
                $validated['nama'] = strip_tags($validated['nama']);
            }
            if (isset($validated['deskripsi'])) {
                $validated['deskripsi'] = strip_tags($validated['deskripsi']);
            }
            if (isset($validated['persyaratan'])) {
                $validated['persyaratan'] = array_map(fn ($p) => strip_tags($p), $validated['persyaratan']);
            }
            if (isset($validated['manfaat'])) {
                $validated['manfaat'] = array_map(fn ($m) => strip_tags($m), $validated['manfaat']);
            }

            $programKud->update($validated);
            DB::commit();

            return response()->json($programKud);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal memperbarui program: '.$e->getMessage()], 500);
        }
    }

    public function destroy(ProgramKud $programKud)
    {
        DB::beginTransaction();
        try {
            $programKud->pendaftaranProgram()->delete();
            $programKud->delete();
            DB::commit();

            return response()->json(['message' => 'Program berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menghapus program'], 500);
        }
    }
}
