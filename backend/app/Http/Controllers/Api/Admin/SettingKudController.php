<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SettingKud;
use Illuminate\Http\Request;

class SettingKudController extends Controller
{
    public function index()
    {
        $setting = SettingKud::first() ?? SettingKud::create([]);
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nama_kud' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|string',
            'nama_ketua' => 'nullable|string|max:255',
            'nama_sekretaris' => 'nullable|string|max:255',
            'nama_bendahara' => 'nullable|string|max:255',
            'tahun_anggaran' => 'nullable|string|max:10',
            'website' => 'nullable|string|max:255',
            'kartu_warna_primary' => 'nullable|string|max:20',
            'kartu_warna_secondary' => 'nullable|string|max:20',
            'kartu_background' => 'nullable|string',
            'tanda_tangan_kartu' => 'nullable|boolean',
        ]);

        $setting = SettingKud::first() ?? new SettingKud;
        $setting->fill($validated);
        $setting->save();

        return response()->json($setting);
    }
}
