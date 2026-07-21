<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    private function storeFile($file, $folder)
    {
        if (! Storage::disk('public')->exists($folder)) {
            Storage::disk('public')->makeDirectory($folder);
        }

        $filename = md5(uniqid().random_int(0, 999999)).'.'.$file->getClientOriginalExtension();
        $file->storeAs($folder, $filename, 'public');

        return [
            'path' => "{$folder}/{$filename}",
            'url' => "/storage/{$folder}/{$filename}",
        ];
    }

    public function profil(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'profil');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function ktp(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'ktp');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function kk(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'kk');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function fotoPekebun(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'foto-pekebun');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function suratTanah(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'surat-tanah');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function suratKeterangan(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'surat-keterangan');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function logo(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);

        DB::beginTransaction();
        try {
            $result = $this->storeFile($request->file('file'), 'profil');

            Pengaturan::updateOrCreate(
                ['key' => 'logo_kud'],
                ['value' => $result['url']]
            );

            DB::commit();

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($result['path']) && Storage::disk('public')->exists($result['path'])) {
                Storage::disk('public')->delete($result['path']);
            }

            return response()->json(['message' => 'Upload logo gagal: '.$e->getMessage()], 500);
        }
    }

    public function fotoPetani(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'foto-petani');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function fotoKebun(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:5120']);
        try {
            $result = $this->storeFile($request->file('file'), 'foto-kebun');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function fotoPengembang(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png|max:2048']);
        try {
            $result = $this->storeFile($request->file('file'), 'foto-pengembang');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function dokumenProgram(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'jenis' => 'required|string|regex:/^[a-zA-Z0-9\-\_]+$/',
        ]);
        try {
            $folder = 'dokumen-program/'.$request->jenis;
            $result = $this->storeFile($request->file('file'), $folder);

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }

    public function videoTentangAplikasi(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:mp4,webm,mov|max:2048000',
        ]);
        try {
            $result = $this->storeFile($request->file('file'), 'video-tentang-aplikasi');

            return response()->json(['url' => $result['url']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload video gagal: '.$e->getMessage()], 500);
        }
    }

    public function chatUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,zip,mp3,wav,ogg,m4a,mp4,mov,webm|max:20480',
        ]);
        try {
            $result = $this->storeFile($request->file('file'), 'chat-attachments');
            $file = $request->file('file');

            return response()->json([
                'url' => $result['url'],
                'name' => $file->getClientOriginalName(),
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload gagal: '.$e->getMessage()], 500);
        }
    }
}
