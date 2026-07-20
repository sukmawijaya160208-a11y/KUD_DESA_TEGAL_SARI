<?php

use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
        $middleware->api(prepend: [
            HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->wantsJson();
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                if ($e instanceof ValidationException) {
                    return;
                }

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                $message = $status === 500 && ! config('app.debug')
                    ? 'Terjadi kesalahan pada server'
                    : $e->getMessage();

                $response = ['success' => false, 'message' => $message];

                if (config('app.debug')) {
                    $response['file'] = $e->getFile() . ':' . $e->getLine();
                }

                return response()->json($response, $status);
            }
        });
    })->create();
