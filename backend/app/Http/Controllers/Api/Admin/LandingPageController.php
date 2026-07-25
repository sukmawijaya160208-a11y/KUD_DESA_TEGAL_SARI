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
            'meta_data' => 'nullable|json',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['meta_data']) && is_string($validated['meta_data'])) {
            $validated['meta_data'] = json_decode($validated['meta_data'], true);
        }

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
            return response()->json($item, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, LandingContent $landingContent)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'meta_data' => 'nullable|json',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['meta_data']) && is_string($validated['meta_data'])) {
            $validated['meta_data'] = json_decode($validated['meta_data'], true);
        }

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
            return response()->json($landingContent);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(LandingContent $landingContent)
    {
        DB::beginTransaction();
        try {
            $landingContent->delete();
            DB::commit();
            return response()->json(['message' => 'Data berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus data'], 500);
        }
    }
}
