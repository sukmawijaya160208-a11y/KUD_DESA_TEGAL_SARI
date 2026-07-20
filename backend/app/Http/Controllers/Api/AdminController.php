<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogMedia;
use App\Models\BlogPost;
use App\Models\Lahan;
use App\Models\Pekebun;
use App\Models\PendaftaranProgram;
use App\Models\Pengaturan;
use App\Models\ProgramKud;
use App\Models\TbsSync;
use App\Models\User;
use App\Models\VerifikasiLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_pekebun' => Pekebun::count(),
            'total_pekebun_pending' => Pekebun::where('status', 'pending')->count(),
            'total_pekebun_verified' => Pekebun::where('status', 'verified')->count(),
            'total_program' => ProgramKud::count(),
            'total_pendaftaran' => PendaftaranProgram::count(),
            'total_lahan' => Lahan::count(),
            'total_pendaftaran_pending' => PendaftaranProgram::where('status', 'pending')->count(),
            'total_tbs' => TbsSync::count(),
        ]);
    }

    // === PEKEBUN CRUD ===
    public function pekebunIndex(Request $request)
    {
        $query = Pekebun::with('user', 'lahan')->withCount('lahan');

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

        $sort = in_array($request->sort, ['nama', 'created_at', 'status']) ? $request->sort : 'created_at';
        $order = $request->order === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $order);

        $perPage = min((int) ($request->per_page ?? 15), 50);

        return response()->json($query->paginate($perPage));
    }

    public function pekebunStore(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required_without:user_id|string|email|max:255|unique:users,email',
            'password' => 'required_without:user_id|string|min:8',
            'user_id' => 'required_without:email|exists:users,id',
            'nama' => 'required|string|max:255',
            'nik' => 'required|string|size:16|unique:pekebun,nik',
            'no_kk' => 'required|string',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'no_whatsapp' => 'required|string',
            'alamat' => 'required|string',
            'status' => 'sometimes|in:pending,verified,rejected',
            'foto_pekebun' => 'nullable|string',
            'upload_ktp' => 'nullable|string',
            'upload_kk' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            if (! isset($validated['user_id'])) {
                $user = User::create([
                    'name' => $validated['nama'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'pekebun',
                ]);
                $validated['user_id'] = $user->id;
            }
            unset($validated['email'], $validated['password']);

            $validated = array_map(fn ($v) => is_string($v) ? strip_tags($v) : $v, $validated);
            $pekebun = Pekebun::create($validated);
            DB::commit();

            return response()->json($pekebun->load('user', 'lahan'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan pekebun: '.$e->getMessage()], 500);
        }
    }

    public function pekebunUpdate(Request $request, Pekebun $pekebun)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'nik' => 'sometimes|string|size:16|unique:pekebun,nik,'.$pekebun->id,
            'no_kk' => 'sometimes|string',
            'tempat_lahir' => 'sometimes|string',
            'tanggal_lahir' => 'sometimes|date',
            'no_whatsapp' => 'sometimes|string',
            'alamat' => 'sometimes|string',
            'status' => 'sometimes|in:pending,verified,rejected',
            'foto_pekebun' => 'nullable|string',
            'upload_ktp' => 'nullable|string',
            'upload_kk' => 'nullable|string',
        ]);
        $validated = array_map(fn ($v) => is_string($v) ? strip_tags($v) : $v, $validated);
        $pekebun->update($validated);

        return response()->json($pekebun->load('user'));
    }

    public function pekebunDestroy(Pekebun $pekebun)
    {
        $pekebun->user()->delete();
        $pekebun->delete();

        return response()->json(['message' => 'Data pekebun berhasil dihapus']);
    }

    // === PROGRAM KUD CRUD ===
    public function programIndex(Request $request)
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

    public function programStats()
    {
        return response()->json([
            'total' => ProgramKud::count(),
            'aktif' => ProgramKud::where('aktif', true)->count(),
            'nonaktif' => ProgramKud::where('aktif', false)->count(),
        ]);
    }

    public function programToggleAktif(Request $request, ProgramKud $programKud)
    {
        $validated = $request->validate(['aktif' => 'required|boolean']);
        $programKud->update(['aktif' => $validated['aktif']]);

        return response()->json($programKud->loadCount('pendaftaranProgram'));
    }

    public function programStore(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:PSR,Intensifikasi,Ekstensifikasi,Pelatihan SDMPKS,Beasiswa SDMPKS,Kemitraan',
            'deskripsi' => 'nullable|string',
            'foto' => 'nullable|array',
            'foto.*' => 'string',
            'persyaratan' => 'nullable|array',
            'persyaratan.*' => 'string',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'kuota' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $validated['nama'] = strip_tags($validated['nama']);
            $validated['deskripsi'] = isset($validated['deskripsi']) ? strip_tags($validated['deskripsi']) : null;
            $validated['persyaratan'] = isset($validated['persyaratan'])
                ? array_map(fn ($p) => strip_tags($p), $validated['persyaratan'])
                : null;

            $program = ProgramKud::create($validated);
            DB::commit();

            return response()->json($program, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan program: '.$e->getMessage()], 500);
        }
    }

    public function programUpdate(Request $request, ProgramKud $programKud)
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
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'kuota' => 'nullable|integer|min:0',
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

            $programKud->update($validated);
            DB::commit();

            return response()->json($programKud);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal memperbarui program: '.$e->getMessage()], 500);
        }
    }

    public function programDestroy(ProgramKud $programKud)
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

    // === PENGATURAN ===
    public function pengaturanIndex()
    {
        return response()->json(Pengaturan::pluck('value', 'key'));
    }

    public function pengaturanUpdate(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);
        Pengaturan::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $validated['value']]
        );

        return response()->json(['message' => 'Pengaturan berhasil disimpan']);
    }

    public function pengaturanDestroy($key)
    {
        Pengaturan::where('key', $key)->delete();

        return response()->json(['message' => 'Pengaturan berhasil dihapus']);
    }

    // === LAPORAN ===
    public function laporan()
    {
        return response()->json([
            'pekebun_per_status' => Pekebun::selectRaw('status, count(*) as total')
                ->groupBy('status')->get(),
            'pendaftaran_per_program' => PendaftaranProgram::selectRaw('program_kud_id, count(*) as total')
                ->with('programKud:id,nama')
                ->groupBy('program_kud_id')->get(),
            'total_tbs_per_bulan' => TbsSync::selectRaw("strftime('%Y-%m', tanggal) as bulan, SUM(jumlah_tbs) as total")
                ->groupBy('bulan')->orderBy('bulan')->get(),
        ]);
    }

    // === TBS ===
    public function tbsIndex(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 50), 100);
        return response()->json(TbsSync::with('pekebun.user')->latest()->paginate($perPage));
    }

    // === LAHAN ===
    public function lahanIndex(Request $request)
    {
        $query = Lahan::with('pekebun.user');

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('alamat_lahan', 'like', "%{$search}%")
                  ->orWhereHas('pekebun', fn ($qq) => $qq->where('nama', 'like', "%{$search}%"));
            });
        }
        if ($jenisSurat = $request->jenis_surat) {
            $query->where('jenis_surat', $jenisSurat);
        }

        $sort = in_array($request->sort, ['luas_lahan_m2', 'created_at', 'alamat_lahan']) ? $request->sort : 'created_at';
        $order = $request->order === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $order);

        $perPage = min((int) ($request->per_page ?? 15), 50);

        return response()->json($query->paginate($perPage));
    }

    public function lahanStats()
    {
        return response()->json([
            'total_lahan' => Lahan::count(),
            'total_luas_m2' => (float) Lahan::sum('luas_lahan_m2'),
            'total_pekebun_dengan_lahan' => Lahan::distinct('pekebun_id')->count('pekebun_id'),
        ]);
    }

    // === VERIFIKASI LOG ===
    public function verifikasiLogIndex()
    {
        return response()->json(
            VerifikasiLog::with('user')
                ->with('verifiable')
                ->latest()
                ->take(200)
                ->get()
        );
    }

    // === USERS ===
    public function usersIndex(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 50), 100);
        return response()->json(User::with('pekebun')->latest()->paginate($perPage));
    }

    public function usersStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,verifikator,pekebun',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function usersUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:admin,verifikator,pekebun',
        ]);
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        $user->update($validated);

        return response()->json($user);
    }

    public function usersDestroy(User $user)
    {
        if ($user->pekebun) {
            $user->pekebun->delete();
        }
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }

    public function usersImport(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|string|email|max:255',
            'users.*.password' => 'required|string|min:8',
            'users.*.role' => 'required|in:admin,verifikator,pekebun',
        ]);

        $created = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->users as $i => $item) {
                $row = $i + 2;
                try {
                    if (User::where('email', $item['email'])->exists()) {
                        $errors[] = "Baris {$row}: Email '{$item['email']}' sudah terdaftar";

                        continue;
                    }

                    $user = User::create([
                        'name' => strip_tags($item['name']),
                        'email' => $item['email'],
                        'password' => Hash::make($item['password']),
                        'role' => $item['role'],
                    ]);

                    if ($item['role'] === 'pekebun') {
                        $nik = $item['nik'] ?? null;
                        if ($nik && Pekebun::where('nik', $nik)->exists()) {
                            $errors[] = "Baris {$row}: NIK '{$nik}' sudah terdaftar";
                            $user->delete();

                            continue;
                        }

                        $pekebunData = [
                            'nama' => strip_tags($item['name']),
                            'nik' => $nik,
                            'no_kk' => $item['no_kk'] ?? null,
                            'no_whatsapp' => $item['no_whatsapp'] ?? null,
                            'tempat_lahir' => isset($item['tempat_lahir']) ? strip_tags($item['tempat_lahir']) : null,
                            'tanggal_lahir' => $item['tanggal_lahir'] ?? null,
                            'alamat' => isset($item['alamat']) ? strip_tags($item['alamat']) : null,
                            'status' => 'pending',
                        ];
                        $user->pekebun()->create($pekebunData);
                    }

                    $created++;
                } catch (\Exception $e) {
                    $errors[] = "Baris {$row}: ".$e->getMessage();
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal mengimpor: '.$e->getMessage()], 500);
        }

        $msg = "Berhasil mengimpor {$created} user";
        if (count($errors) > 0) {
            $msg .= ' dengan '.count($errors).' kesalahan';
        }

        return response()->json([
            'message' => $msg,
            'created' => $created,
            'errors' => $errors,
        ]);
    }

    // === PENDAFTARAN PROGRAM ===
    public function pendaftaranIndex(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 50), 100);
        return response()->json(
            PendaftaranProgram::with('pekebun.user', 'programKud', 'lahan')
                ->latest()
                ->paginate($perPage)
        );
    }

    public function pendaftaranVerifikasi(Request $request, PendaftaranProgram $pendaftaranProgram)
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
        $pekebun = $pendaftaranProgram->pekebun;
        if ($pekebun) {
            NotifikasiController::createForUser(
                $pekebun->user_id,
                "Pendaftaran Program: $statusLabel",
                "Pendaftaran {$pendaftaranProgram->programKud->nama} telah $statusLabel oleh admin.".($validated['catatan'] ? " Catatan: {$validated['catatan']}" : ''),
                '/pekebun/program'
            );
        }

        return response()->json(['message' => 'Verifikasi berhasil']);
    }

    public function pendaftaranDestroy(PendaftaranProgram $pendaftaranProgram)
    {
        DB::beginTransaction();
        try {
            $pendaftaranProgram->delete();
            DB::commit();

            return response()->json(['message' => 'Pendaftaran berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menghapus pendaftaran'], 500);
        }
    }

    private function sanitizeString($value)
    {
        return is_string($value) ? strip_tags($value) : $value;
    }

    // === TENTANG APLIKASI ===
    private function getPengaturan($key, $default = '')
    {
        return Pengaturan::where('key', $key)->value('value') ?? $default;
    }

    public function tentangAplikasiIndex()
    {
        return response()->json([
            'teks' => $this->getPengaturan('tentang_aplikasi'),
            'foto_pengembang' => $this->getPengaturan('foto_pengembang'),
            'developer_name' => $this->getPengaturan('developer_name', 'MUHAMMAD SUKMA WIJAYA S.KOM.SH'),
            'developer_role' => $this->getPengaturan('developer_role', 'Pengembang Aplikasi'),
            'kontak' => $this->getPengaturan('kontak', '0822-2728-3416'),
            'email' => $this->getPengaturan('email'),
            'instagram' => $this->getPengaturan('instagram'),
            'facebook' => $this->getPengaturan('facebook'),
            'alamat' => $this->getPengaturan('alamat'),
            'website' => $this->getPengaturan('website'),
            'bank' => $this->getPengaturan('bank', 'Allo Bank'),
            'rekening' => $this->getPengaturan('rekening', '082227283416'),
            'rekening_an' => $this->getPengaturan('rekening_an', 'DEDEK SULAIMAN'),
        ]);
    }

    public function tentangAplikasiUpdate(Request $request)
    {
        $fields = [
            'teks', 'foto_pengembang', 'developer_name', 'developer_role',
            'kontak', 'email', 'instagram', 'facebook', 'alamat', 'website',
            'bank', 'rekening', 'rekening_an',
        ];
        $rules = [];
        foreach ($fields as $f) {
            $rule = 'nullable|string';
            if ($f === 'email') {
                $rule = 'nullable|email';
            }
            if ($f === 'website') {
                $rule = 'nullable|url';
            }
            $rules[$f] = $rule;
        }
        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            foreach ($fields as $f) {
                if (array_key_exists($f, $validated)) {
                    $value = is_string($validated[$f]) ? strip_tags($validated[$f]) : $validated[$f];
                    Pengaturan::updateOrCreate(
                        ['key' => $f === 'teks' ? 'tentang_aplikasi' : $f],
                        ['value' => $value ?? '']
                    );
                }
            }
            DB::commit();

            return response()->json(['message' => 'Tentang aplikasi berhasil disimpan']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan: '.$e->getMessage()], 500);
        }
    }

    // === BLOG CRUD ===
    public function blogIndex(Request $request)
    {
        $query = BlogPost::withCount('media')->with('media', 'author');

        if ($search = $request->search) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($category = $request->category) {
            $query->where('category', $category);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sort = in_array($request->sort, ['title', 'created_at', 'published_at']) ? $request->sort : 'created_at';
        $order = $request->order === 'asc' ? 'asc' : 'desc';

        return response()->json($query->orderBy($sort, $order)->paginate(min((int) ($request->per_page ?? 15), 50)));
    }

    public function blogStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'category' => 'required|string|max:255',
            'status' => 'sometimes|in:draft,published',
            'featured' => 'sometimes|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        }
        $validated['content'] = strip_tags($validated['content']);
        $validated['created_by'] = $request->user()->id;

        DB::beginTransaction();
        try {
            $post = BlogPost::create($validated);

            if ($request->has('media_urls')) {
                foreach ($request->media_urls as $i => $url) {
                    BlogMedia::create([
                        'blog_post_id' => $post->id,
                        'type' => str_starts_with($url, '/storage/') ? 'image' : 'image',
                        'url' => $url,
                        'order' => $i,
                    ]);
                }
            }

            DB::commit();

            return response()->json($post->load('media'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Gagal menyimpan artikel: '.$e->getMessage()], 500);
        }
    }

    public function blogUpdate(Request $request, BlogPost $blogPost)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,'.$blogPost->id,
            'excerpt' => 'nullable|string',
            'content' => 'sometimes|string',
            'category' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:draft,published',
            'featured' => 'sometimes|boolean',
        ]);

        if (isset($validated['content'])) {
            $validated['content'] = strip_tags($validated['content']);
        }
        $validated['updated_by'] = $request->user()->id;

        $blogPost->update($validated);

        return response()->json($blogPost->load('media'));
    }

    public function blogDestroy(BlogPost $blogPost)
    {
        $blogPost->delete();

        return response()->json(['message' => 'Artikel berhasil dihapus']);
    }

    public function blogUploadMedia(Request $request, BlogPost $blogPost)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,mp4,webm,mov|max:20480',
            'caption' => 'nullable|string|max:255',
        ]);

        $folder = 'blog';
        $filename = 'blog_'.$blogPost->id.'_'.time().'_'.md5(uniqid()).'.'.$request->file('file')->getClientOriginalExtension();
        $request->file('file')->storeAs($folder, $filename, 'public');

        $type = str_starts_with($request->file('file')->getMimeType(), 'video/') ? 'video' : 'image';

        $media = BlogMedia::create([
            'blog_post_id' => $blogPost->id,
            'type' => $type,
            'url' => "/storage/{$folder}/{$filename}",
            'caption' => $request->caption,
            'order' => $blogPost->media()->count(),
        ]);

        return response()->json($media, 201);
    }

    public function blogDeleteMedia(BlogMedia $blogMedium)
    {
        $path = str_replace('/storage/', '', $blogMedium->url);
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }
        $blogMedium->delete();

        return response()->json(['message' => 'Media berhasil dihapus']);
    }

    public function blogToggleFeatured(Request $request, BlogPost $blogPost)
    {
        $validated = $request->validate(['featured' => 'required|boolean']);
        $blogPost->update(['featured' => $validated['featured']]);

        return response()->json($blogPost->load('media'));
    }

    // === BLOG CATEGORIES ===
    public function blogCategories()
    {
        return response()->json(
            BlogPost::selectRaw('category, count(*) as total')
                ->groupBy('category')
                ->orderBy('category')
                ->get()
        );
    }

    public function blogStoreCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_posts,category',
        ]);

        return response()->json(['name' => $validated['name'], 'total' => 0], 201);
    }

    public function blogDeleteCategory(string $name)
    {
        $count = BlogPost::where('category', $name)->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Kategori '{$name}' masih digunakan oleh {$count} artikel. Pindahkan dulu artikelnya.",
            ], 422);
        }

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    // === PROFILE PHOTO ===
    public function uploadProfilePhoto(Request $request)
    {
        $request->validate(['file' => 'required|image|mimes:jpg,jpeg,png|max:2048']);
        $user = $request->user();
        $filename = 'user_'.$user->id.'_'.time().'.'.$request->file('file')->getClientOriginalExtension();
        $request->file('file')->storeAs('profil', $filename, 'public');
        $url = "/storage/profil/{$filename}";
        $user->update(['foto_profil' => $url]);

        return response()->json(['url' => $url]);
    }
}
