<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KuestsController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommentController;

Route::prefix('/v1')->group(function () {

    Route::prefix('/auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']); // --
        Route::post('/login', [AuthController::class, 'login']); // --
    });

    Route::get('/user/username/{username}', [PerfilController::class, 'index']);

    Route::prefix('/kuests')->group(function () {
        Route::get('/', [KuestsController::class, 'index']); //
        Route::get('/{id_kuest}', [KuestsController::class, 'show']); //
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::prefix('/kuests')->group(function () {
            Route::post('/', [KuestsController::class, 'store']); //
            Route::put('/{id_kuest}', [KuestsController::class, 'update']);//
            Route::delete('/{id_kuest}', [KuestsController::class, 'destroy']); //
            Route::post('/{id_kuest}/like', [KuestsController::class, 'like']); //
            Route::post('/{id_kuest}/unlike', [KuestsController::class, 'unlike']); //

            Route::post('/{id_kuest}/comment', [CommentController::class, 'store']); //
            Route::get('/{id_kuest}/comment', [CommentController::class, 'index']); //
            Route::delete('/{id_comment}/comment', [CommentController::class, 'destroy']); //

        });

        Route::prefix('/user/me')->group(function () {
            Route::get('/', [PerfilController::class, 'me']); //
            Route::put('/update', [PerfilController::class, 'update']);
            Route::get('/avatar', [PerfilController::class, 'avatar']); //
        });

        Route::prefix('/user')->group(function () {
            Route::post('/{username}/follow', [UserController::class, 'follow']); //
            Route::post('/{username}/unfollow', [UserController::class, 'unfollow']); //
            Route::get('/{username}/followers', [UserController::class, 'followers']); //
            Route::get('/{username}/following', [UserController::class, 'following']); //
        });

        Route::prefix('/auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']); //
        });

        Route::prefix('/user/settings')->group(function () {
            Route::get('/theme', [SettingsController::class, 'getTheme']); //
            Route::post('/theme', [SettingsController::class, 'theme']); //
        });

    });
});
