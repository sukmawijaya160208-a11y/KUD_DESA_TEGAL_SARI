<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HargaTbs;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class HargaTbsController extends Controller
{
    private function formatResponse($data)
    {
        if ($data instanceof Collection) {
            return $data->map(fn ($item) => $item ? $this->formatItem($item) : $item);
        }

        return $this->formatItem($data);
    }

    private function formatItem($item)
    {
        if (! $item) {
            return $item;
        }
        $arr = $item->toArray();
        $arr['dari_tanggal'] = $item->dari_tanggal?->format('Y-m-d');
        $arr['sampai_tanggal'] = $item->sampai_tanggal?->format('Y-m-d');

        return $arr;
    }

    public function index(Request $request)
    {
        $perPage = min((int) ($request->per_page ?? 50), 100);
        return response()->json(
            $this->formatResponse(HargaTbs::orderBy('kelas')->latest('dari_tanggal')->paginate($perPage))
        );
    }

    public function latest()
    {
        $aktif = HargaTbs::aktif()
            ->latest('dari_tanggal')
            ->get()
            ->groupBy('kelas')
            ->map(fn ($items) => $items->first() ? $this->formatItem($items->first()) : null);

        return response()->json($aktif);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kelas' => 'required|in:A,B,C',
            'harga_per_kg' => 'required|numeric|min:0',
            'dari_tanggal' => 'required|date',
            'sampai_tanggal' => 'nullable|date|after_or_equal:dari_tanggal',
            'keterangan' => 'nullable|string',
        ]);

        $harga = HargaTbs::create($validated);

        return response()->json($this->formatItem($harga), 201);
    }

    public function update(Request $request, HargaTbs $hargaTb)
    {
        $validated = $request->validate([
            'kelas' => 'required|in:A,B,C',
            'harga_per_kg' => 'required|numeric|min:0',
            'dari_tanggal' => 'required|date',
            'sampai_tanggal' => 'nullable|date|after_or_equal:dari_tanggal',
            'keterangan' => 'nullable|string',
        ]);

        $hargaTb->update($validated);

        return response()->json($this->formatItem($hargaTb));
    }

    public function destroy(HargaTbs $hargaTb)
    {
        $hargaTb->delete();

        return response()->json(['message' => 'Harga berhasil dihapus']);
    }
}
