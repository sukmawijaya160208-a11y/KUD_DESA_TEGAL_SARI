<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LandingPageController extends Controller
{
    public function index(Request $request)
    {
        $query = LandingContent::orderBy('order');

        if ($section = $request->section) {
            $query->where('section_type', $section);
        }

        $data = $query->get()->map(function ($item) {
            if ($item->meta_data === null) {
                $item->meta_data = new \stdClass();
            }
            return $item;
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_type' => 'required|string|max:50',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'meta_data' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $meta = $validated['meta_data'] ?? [];
        if (is_string($meta)) {
            $decoded = json_decode($meta, true);
            $meta = is_array($decoded) ? $decoded : [];
        }
        $validated['meta_data'] = $meta;

        DB::beginTransaction();
        try {
            $validated['title'] = isset($validated['title']) ? strip_tags($validated['title']) : null;
            $validated['description'] = isset($validated['description']) ? strip_tags($validated['description']) : null;

            if (!isset($validated['order'])) {
                $maxOrder = LandingContent::where('section_type', $validated['section_type'])->max('order');
                $validated['order'] = ($maxOrder ?? -1) + 1;
            }

            $item = LandingContent::create($validated);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $item,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, LandingContent $landingContent)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'meta_data' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $meta = $validated['meta_data'] ?? null;
        if (is_string($meta)) {
            $decoded = json_decode($meta, true);
            $meta = is_array($decoded) ? $decoded : [];
        }
        $validated['meta_data'] = $meta;

        DB::beginTransaction();
        try {
            if (isset($validated['title'])) {
                $validated['title'] = strip_tags($validated['title']);
            }
            if (isset($validated['description'])) {
                $validated['description'] = strip_tags($validated['description']);
            }

            $landingContent->update($validated);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbarui',
                'data' => $landingContent->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(LandingContent $landingContent)
    {
        DB::beginTransaction();
        try {
            $landingContent->delete();
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data',
            ], 500);
        }
    }

    public function bulkToggle(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:landing_contents,id',
            'is_active' => 'required|boolean',
        ]);

        try {
            $count = LandingContent::whereIn('id', $request->ids)
                ->update(['is_active' => $request->is_active]);

            return response()->json([
                'success' => true,
                'message' => $count . ' data berhasil diperbarui',
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:landing_contents,id',
            'items.*.order' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->items as $item) {
                LandingContent::where('id', $item['id'])->update(['order' => $item['order']]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Urutan berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengatur ulang urutan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getHero()
    {
        $hero = LandingContent::where('section_type', 'hero')->first();

        if (!$hero) {
            return response()->json([
                'success' => true,
                'data' => [
                    'sub_judul' => '',
                    'judul_utama' => '',
                    'deskripsi' => '',
                    'catatan_hukum' => '',
                ],
            ]);
        }

        $meta = $hero->meta_data ?: [];

        return response()->json([
            'success' => true,
            'data' => [
                'sub_judul' => $meta['sub_judul'] ?? '',
                'judul_utama' => $hero->title ?? '',
                'deskripsi' => $meta['deskripsi'] ?? '',
                'catatan_hukum' => $meta['catatan_hukum'] ?? '',
                'ukuran_font' => $meta['ukuran_font'] ?? 'sedang',
            ],
        ]);
    }

    public function saveHero(Request $request)
    {
        $validated = $request->validate([
            'sub_judul' => 'nullable|string|max:255',
            'judul_utama' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'catatan_hukum' => 'nullable|string',
            'ukuran_font' => 'nullable|string|in:kecil,sedang,besar',
        ]);

        $hero = LandingContent::firstOrNew(['section_type' => 'hero']);
        $hero->title = strip_tags($validated['judul_utama'] ?? '');
        $hero->meta_data = [
            'sub_judul' => strip_tags($validated['sub_judul'] ?? ''),
            'deskripsi' => strip_tags($validated['deskripsi'] ?? ''),
            'catatan_hukum' => strip_tags($validated['catatan_hukum'] ?? ''),
            'ukuran_font' => $validated['ukuran_font'] ?? 'sedang',
        ];
        $hero->is_active = true;
        $hero->order = 0;
        $hero->save();

        return response()->json([
            'success' => true,
            'message' => 'Hero section berhasil disimpan',
            'data' => [
                'sub_judul' => $hero->meta_data['sub_judul'] ?? '',
                'judul_utama' => $hero->title ?? '',
                'deskripsi' => $hero->meta_data['deskripsi'] ?? '',
                'catatan_hukum' => $hero->meta_data['catatan_hukum'] ?? '',
                'ukuran_font' => $hero->meta_data['ukuran_font'] ?? 'sedang',
            ],
        ]);
    }

    public function publicIndex($section = null)
    {
        $query = LandingContent::where('is_active', true)->orderBy('order');

        if ($section) {
            $query->where('section_type', $section);
        }

        $data = $query->get()->map(function ($item) {
            $item->meta_data = $item->meta_data ?: new \stdClass();
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
