<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pekebun;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'nama' => 'required|string|max:255',
                'nik' => 'required|string|size:16|unique:pekebun,nik',
                'no_kk' => 'required|string',
                'tempat_lahir' => 'required|string',
                'tanggal_lahir' => 'required|date',
                'no_whatsapp' => 'required|string',
                'alamat' => 'required|string',
            ]);

            if (empty($validated['email']) && empty($validated['phone'])) {
                throw ValidationException::withMessages([
                    'email' => ['Email atau nomor HP harus diisi.'],
                ]);
            }

            if (empty($validated['email']) && ! empty($validated['phone'])) {
                $validated['email'] = $validated['phone'] . '@kud.app';
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? ($validated['phone'] . '@kud.app'),
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => 'pekebun',
            ]);

            Pekebun::create([
                'user_id' => $user->id,
                'nama' => $validated['nama'],
                'nik' => $validated['nik'],
                'no_kk' => $validated['no_kk'],
                'tempat_lahir' => $validated['tempat_lahir'],
                'tanggal_lahir' => $validated['tanggal_lahir'],
                'no_whatsapp' => $validated['no_whatsapp'],
                'alamat' => $validated['alamat'],
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Registrasi berhasil',
                'user' => $user->load('pekebun'),
                'token' => $token,
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'password' => 'required|string',
        ]);

        if (empty($validated['email']) && empty($validated['phone'])) {
            throw ValidationException::withMessages([
                'email' => ['Email atau nomor HP harus diisi.'],
            ]);
        }

        $user = ! empty($validated['email'])
            ? User::where('email', $validated['email'])->first()
            : User::where('phone', $validated['phone'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email/nomor HP atau password salah.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/auth/google/callback?error=" . urlencode('Gagal autentikasi Google'));
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update(['google_id' => $googleUser->getId()]);
            } else {
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(Str::random(32)),
                    'role' => 'pekebun',
                ]);
            }
        }

        if ($user->role === 'pekebun' && ! $user->pekebun) {
            Pekebun::create([
                'user_id' => $user->id,
                'nama' => $user->name,
                'nik' => '-',
                'no_kk' => '-',
                'tempat_lahir' => '-',
                'tanggal_lahir' => now(),
                'no_whatsapp' => '-',
                'alamat' => '-',
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return redirect("{$frontendUrl}/auth/google/callback?token={$token}");
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'pekebun') {
            $user->load('pekebun.lahan');
        }

        return response()->json($user);
    }
}
