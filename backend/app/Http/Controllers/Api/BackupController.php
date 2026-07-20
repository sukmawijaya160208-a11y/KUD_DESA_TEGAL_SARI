<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BackupController extends Controller
{
    protected array $tables = [
        'pengaturan',
        'users',
        'pekebun',
        'program_kud',
        'lahan',
        'harga_tbs',
        'pendaftaran_program',
        'tbs_sync',
        'verifikasi_log',
                'notifikasi',
    ];

    public function backup()
    {
        $data = [];
        foreach ($this->tables as $table) {
            $data[$table] = DB::table($table)->get();
        }

        $backup = [
            'metadata' => [
                'version' => '1.0',
                'exported_at' => now()->toIso8601String(),
                'app_name' => config('app.name'),
                'total_records' => collect($data)->map->count()->sum(),
                'tables' => $this->tables,
            ],
            'data' => $data,
        ];

        return response()->json($backup);
    }

    public function restore(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'data.pengaturan' => 'sometimes|array',
            'data.users' => 'sometimes|array',
            'data.pekebun' => 'sometimes|array',
            'data.program_kud' => 'sometimes|array',
            'data.lahan' => 'sometimes|array',
            'data.harga_tbs' => 'sometimes|array',
            'data.pendaftaran_program' => 'sometimes|array',
            'data.tbs_sync' => 'sometimes|array',
            'data.verifikasi_log' => 'sometimes|array',
            'data.notifikasi' => 'sometimes|array',
        ]);

        $data = $request->data;
        $restored = [];
        $total = 0;

        DB::statement('PRAGMA foreign_keys = OFF');
        DB::beginTransaction();

        try {
            foreach ($this->tables as $table) {
                if (! isset($data[$table]) || count($data[$table]) < 1) {
                    continue;
                }

                DB::table($table)->truncate();

                $records = collect($data[$table])->map(fn ($r) => (array) $r);

                foreach ($records->chunk(100) as $chunk) {
                    DB::table($table)->insert($chunk->toArray());
                }

                $count = count($data[$table]);
                $restored[$table] = $count;
                $total += $count;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            DB::statement('PRAGMA foreign_keys = ON');

            return response()->json(['message' => 'Gagal restore: '.$e->getMessage()], 500);
        }

        DB::statement('PRAGMA foreign_keys = ON');

        $msg = 'Restore berhasil. '.$total.' record dipulihkan.';

        return response()->json([
            'message' => $msg,
            'total' => $total,
            'restored' => $restored,
        ]);
    }

    public function resetData(Request $request)
    {
        $request->validate([
            'confirmation' => 'required|string|in:RESET',
        ]);

        $deleted = [];

        DB::statement('PRAGMA foreign_keys = OFF');
        DB::beginTransaction();

        try {
            $deleteOrder = [
        'notifikasi',
                'verifikasi_log',
                'pendaftaran_program',
                'tbs_sync',
                'lahan',
                'harga_tbs',
                'program_kud',
                'pekebun',
            ];

            foreach ($deleteOrder as $table) {
                $count = DB::table($table)->count();
                if ($count > 0) {
                    DB::table($table)->delete();
                    $deleted[$table] = $count;
                }
            }

            $nonAdminCount = User::where('role', '!=', 'admin')->count();
            if ($nonAdminCount > 0) {
                User::where('role', '!=', 'admin')->delete();
                $deleted['users (non-admin)'] = $nonAdminCount;
            }

            $sequenceTables = array_merge($deleteOrder, ['users']);
            foreach ($sequenceTables as $table) {
                DB::statement("DELETE FROM sqlite_sequence WHERE name='{$table}'");
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            DB::statement('PRAGMA foreign_keys = ON');

            return response()->json(['message' => 'Gagal reset: '.$e->getMessage()], 500);
        }

        DB::statement('PRAGMA foreign_keys = ON');

        $totalDeleted = collect($deleted)->sum();

        return response()->json([
            'message' => 'Reset data berhasil. '.$totalDeleted.' record dihapus.',
            'total_deleted' => $totalDeleted,
            'deleted' => $deleted,
            'kept' => [
                'users (admin)' => User::where('role', 'admin')->count(),
                'pengaturan' => Pengaturan::count(),
            ],
        ]);
    }
}
