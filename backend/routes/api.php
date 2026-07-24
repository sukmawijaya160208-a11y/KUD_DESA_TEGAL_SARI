<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\HargaTbsController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PekebunController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\VerifikatorController;
use Illuminate\Support\Facades\Route;

// === PUBLIC ===
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:3,1');
Route::post('/auth/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:3,1');

// Public (no auth needed)
Route::get('/pengaturan', [AdminController::class, 'pengaturanIndex']);
Route::get('/tentang-aplikasi', [AdminController::class, 'tentangAplikasiIndex']);
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/featured', [BlogController::class, 'featured']);
Route::get('/blog/categories', [BlogController::class, 'categories']);
Route::get('/blog/popular', [BlogController::class, 'popular']);
Route::post('/blog/{slug}/view', [BlogController::class, 'incrementViews']);
Route::get('/blog/{slug}/related', [BlogController::class, 'related']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);
Route::get('/program', [AdminController::class, 'programPublic']);

// === AUTHENTICATED ===
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/upload-profil', [AdminController::class, 'uploadProfilePhoto']);

    // Upload (rate limited: 10 per minute)
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/upload/profil', [UploadController::class, 'profil']);
        Route::post('/upload/ktp', [UploadController::class, 'ktp']);
        Route::post('/upload/kk', [UploadController::class, 'kk']);
        Route::post('/upload/foto-pekebun', [UploadController::class, 'fotoPekebun']);
        Route::post('/upload/surat-tanah', [UploadController::class, 'suratTanah']);
        Route::post('/upload/surat-keterangan', [UploadController::class, 'suratKeterangan']);
        Route::post('/upload/logo', [UploadController::class, 'logo']);
        Route::post('/upload/foto-petani', [UploadController::class, 'fotoPetani']);
        Route::post('/upload/foto-kebun', [UploadController::class, 'fotoKebun']);
        Route::post('/upload/foto-pengembang', [UploadController::class, 'fotoPengembang']);
        Route::post('/upload/dokumen-program', [UploadController::class, 'dokumenProgram']);
        Route::post('/upload/video-tentang-aplikasi', [UploadController::class, 'videoTentangAplikasi']);
        Route::post('/upload/chat', [UploadController::class, 'chatUpload']);
    });

    // Notifikasi
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::get('/notifikasi/count', [NotifikasiController::class, 'countUnread']);
    Route::put('/notifikasi/{notifikasi}/read', [NotifikasiController::class, 'markAsRead']);
    Route::put('/notifikasi/read-all', [NotifikasiController::class, 'markAllAsRead']);

    // Public Harga TBS (all authenticated roles, read-only)
    Route::get('/harga-tbs', [HargaTbsController::class, 'index']);
    Route::get('/harga-tbs/latest', [HargaTbsController::class, 'latest']);

    // Chat (all authenticated roles)
    Route::get('/chat/users', [ChatController::class, 'users']);
    Route::get('/chat/conversations', [ChatController::class, 'conversations']);
    Route::post('/chat/conversations', [ChatController::class, 'store']);
    Route::get('/chat/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/conversations/{conversation}/messages', [ChatController::class, 'send']);
    Route::put('/chat/conversations/{conversation}/read', [ChatController::class, 'markAsRead']);
    Route::delete('/chat/conversations/{conversation}/messages/{message}', [ChatController::class, 'destroy']);

    // Calls
    Route::post('/calls', [CallController::class, 'initiate']);
    Route::get('/calls/pending', [CallController::class, 'pending']);
    Route::get('/calls/active', [CallController::class, 'active']);
    Route::post('/calls/{call}/accept', [CallController::class, 'accept']);
    Route::post('/calls/{call}/reject', [CallController::class, 'reject']);
    Route::post('/calls/{call}/end', [CallController::class, 'end']);
    Route::get('/conversations/{conversation}/calls', [CallController::class, 'history']);

    // === ADMIN ===
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        // Pekebun
        Route::get('/pekebun', [AdminController::class, 'pekebunIndex']);
        Route::post('/pekebun', [AdminController::class, 'pekebunStore']);
        Route::put('/pekebun/{pekebun}', [AdminController::class, 'pekebunUpdate']);
        Route::delete('/pekebun/{pekebun}', [AdminController::class, 'pekebunDestroy']);
        // Program
        Route::get('/program/stats', [AdminController::class, 'programStats']);
        Route::get('/program', [AdminController::class, 'programIndex']);
        Route::post('/program', [AdminController::class, 'programStore']);
        Route::put('/program/{programKud}', [AdminController::class, 'programUpdate']);
        Route::put('/program/{programKud}/toggle-aktif', [AdminController::class, 'programToggleAktif']);
        Route::delete('/program/{programKud}', [AdminController::class, 'programDestroy']);
        // Pengaturan
        Route::get('/pengaturan', [AdminController::class, 'pengaturanIndex']);
        Route::put('/pengaturan', [AdminController::class, 'pengaturanUpdate']);
        Route::delete('/pengaturan/{key}', [AdminController::class, 'pengaturanDestroy']);
        // Laporan
        Route::get('/laporan', [AdminController::class, 'laporan']);
        // TBS
        Route::get('/tbs', [AdminController::class, 'tbsIndex']);
        // Harga TBS
        Route::get('/harga-tbs', [HargaTbsController::class, 'index']);
        Route::post('/harga-tbs', [HargaTbsController::class, 'store']);
        Route::put('/harga-tbs/{hargaTb}', [HargaTbsController::class, 'update']);
        Route::delete('/harga-tbs/{hargaTb}', [HargaTbsController::class, 'destroy']);
        // Lahan
        Route::get('/lahan/stats', [AdminController::class, 'lahanStats']);
        Route::get('/lahan', [AdminController::class, 'lahanIndex']);
        // Verifikasi Log
        Route::get('/verifikasi-log', [AdminController::class, 'verifikasiLogIndex']);
        // Users
        Route::get('/users', [AdminController::class, 'usersIndex']);
        Route::post('/users', [AdminController::class, 'usersStore']);
        Route::post('/users/import', [AdminController::class, 'usersImport']);
        Route::put('/users/{user}', [AdminController::class, 'usersUpdate']);
        Route::delete('/users/{user}', [AdminController::class, 'usersDestroy']);
        // Pendaftaran Program
        Route::get('/pendaftaran', [AdminController::class, 'pendaftaranIndex']);
        Route::put('/pendaftaran/{pendaftaranProgram}/verifikasi', [AdminController::class, 'pendaftaranVerifikasi']);
        Route::delete('/pendaftaran/{pendaftaranProgram}', [AdminController::class, 'pendaftaranDestroy']);
        // Video list
        Route::get('/videos/list', [AdminController::class, 'videoList']);
        // Tentang Aplikasi
        Route::put('/tentang-aplikasi', [AdminController::class, 'tentangAplikasiUpdate']);
        // Blog
        Route::get('/blog', [AdminController::class, 'blogIndex']);
        Route::post('/blog', [AdminController::class, 'blogStore']);
        Route::put('/blog/{blogPost}', [AdminController::class, 'blogUpdate']);
        Route::delete('/blog/{blogPost}', [AdminController::class, 'blogDestroy']);
        Route::post('/blog/{blogPost}/media', [AdminController::class, 'blogUploadMedia']);
        Route::delete('/blog/media/{blogMedium}', [AdminController::class, 'blogDeleteMedia']);
        Route::put('/blog/{blogPost}/toggle-featured', [AdminController::class, 'blogToggleFeatured']);
        Route::get('/blog/categories/list', [AdminController::class, 'blogCategories']);
        Route::post('/blog/categories', [AdminController::class, 'blogStoreCategory']);
        Route::delete('/blog/categories/{name}', [AdminController::class, 'blogDeleteCategory']);

        // Backup & Restore
        Route::get('/backup', [BackupController::class, 'backup']);
        Route::post('/restore', [BackupController::class, 'restore']);
        Route::post('/reset-data', [BackupController::class, 'resetData']);

        // === EXPORT ===
        Route::prefix('export')->group(function () {
            Route::get('/pekebun/pdf', [ExportController::class, 'pekebunPdf']);
            Route::get('/pekebun/csv', [ExportController::class, 'pekebunCsv']);
            Route::get('/users/pdf', [ExportController::class, 'usersPdf']);
            Route::get('/users/csv', [ExportController::class, 'usersCsv']);
            Route::get('/lahan/pdf', [ExportController::class, 'lahanPdf']);
            Route::get('/lahan/csv', [ExportController::class, 'lahanCsv']);
            Route::get('/pendaftaran/pdf', [ExportController::class, 'pendaftaranPdf']);
            Route::get('/pendaftaran/csv', [ExportController::class, 'pendaftaranCsv']);
            Route::get('/verifikasi-log/pdf', [ExportController::class, 'verifikasiLogPdf']);
            Route::get('/verifikasi-log/csv', [ExportController::class, 'verifikasiLogCsv']);
            Route::get('/program/pdf', [ExportController::class, 'programPdf']);
            Route::get('/program/csv', [ExportController::class, 'programCsv']);
            Route::get('/laporan/pdf', [ExportController::class, 'laporanPdf']);
            Route::get('/laporan/csv', [ExportController::class, 'laporanCsv']);
        });
    });

    // === VERIFIKATOR ===
    Route::middleware('role:verifikator')->prefix('verifikator')->group(function () {
        Route::get('/pengajuan-pekebun', [VerifikatorController::class, 'pengajuanPekebun']);
        Route::put('/pekebun/{pekebun}/verifikasi', [VerifikatorController::class, 'verifikasiPekebun']);
        Route::get('/pengajuan-program', [VerifikatorController::class, 'pengajuanProgram']);
        Route::put('/program/{pendaftaranProgram}/verifikasi', [VerifikatorController::class, 'verifikasiProgram']);
        Route::get('/riwayat', [VerifikatorController::class, 'riwayat']);
        Route::get('/stats/pekebun', [VerifikatorController::class, 'statsPekebun']);
        Route::get('/stats/program', [VerifikatorController::class, 'statsProgram']);
        Route::get('/stats/riwayat', [VerifikatorController::class, 'statsRiwayat']);
        Route::delete('/riwayat/{verifikasiLog}', [VerifikatorController::class, 'riwayatDestroy']);
    });

    // === PEKEBUN ===
    Route::middleware('role:pekebun')->prefix('pekebun')->group(function () {
        Route::get('/profil', [PekebunController::class, 'profil']);
        Route::put('/profil', [PekebunController::class, 'updateProfil']);
        Route::get('/lahan', [PekebunController::class, 'lahanIndex']);
        Route::post('/lahan', [PekebunController::class, 'lahanStore']);
        Route::put('/lahan/{lahan}', [PekebunController::class, 'lahanUpdate']);
        Route::delete('/lahan/{lahan}', [PekebunController::class, 'lahanDestroy']);
        Route::get('/program-tersedia', [PekebunController::class, 'programTersedia']);
        Route::get('/program-tersedia/{program}', [PekebunController::class, 'programTersediaById']);
        Route::post('/daftar-program', [PekebunController::class, 'daftarProgram']);
        Route::get('/program-saya', [PekebunController::class, 'programSaya']);
        Route::get('/tbs', [PekebunController::class, 'tbsIndex']);
        Route::post('/tbs', [PekebunController::class, 'tbsStore']);
        Route::put('/tbs/{tbsSync}', [PekebunController::class, 'tbsUpdate']);
        Route::delete('/tbs/{tbsSync}', [PekebunController::class, 'tbsDestroy']);
    });
});
