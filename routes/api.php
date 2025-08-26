<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WoodInventoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\StorageLocationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Wood Inventory routes
    Route::prefix('wood-inventory')->group(function () {
        Route::get('/', [WoodInventoryController::class, 'index']);
        Route::post('/', [WoodInventoryController::class, 'store']);
        Route::get('/dashboard', [WoodInventoryController::class, 'dashboard']);
        Route::get('/export/excel', [WoodInventoryController::class, 'exportExcel']);
        Route::get('/export/pdf', [WoodInventoryController::class, 'exportPdf']);
        
        // Routes with composite key parameters
        Route::get('/{no_kontrak}/{no_kapling}/{skshh}/{urutan_pengiriman}', [WoodInventoryController::class, 'show'])
            ->where(['no_kontrak' => '.*', 'no_kapling' => '.*', 'skshh' => '.*', 'urutan_pengiriman' => '[0-9]+']);
        
        Route::put('/{no_kontrak}/{no_kapling}/{skshh}/{urutan_pengiriman}', [WoodInventoryController::class, 'update'])
            ->where(['no_kontrak' => '.*', 'no_kapling' => '.*', 'skshh' => '.*', 'urutan_pengiriman' => '[0-9]+']);
        
        Route::delete('/{no_kontrak}/{no_kapling}/{skshh}/{urutan_pengiriman}', [WoodInventoryController::class, 'destroy'])
            ->where(['no_kontrak' => '.*', 'no_kapling' => '.*', 'skshh' => '.*', 'urutan_pengiriman' => '[0-9]+']);
    });

    // Storage Location routes
    Route::prefix('storage-locations')->group(function () {
        Route::get('/', [StorageLocationController::class, 'index']);
        Route::post('/', [StorageLocationController::class, 'store']);
        Route::get('/statistics', [StorageLocationController::class, 'statistics']);
        Route::get('/available', [StorageLocationController::class, 'getAvailable']);
        Route::post('/update-usage', [StorageLocationController::class, 'updateUsage']);
        Route::get('/{storageLocation}', [StorageLocationController::class, 'show']);
        Route::put('/{storageLocation}', [StorageLocationController::class, 'update']);
        Route::delete('/{storageLocation}', [StorageLocationController::class, 'destroy']);
    });

    // Backup routes (admin only)
    Route::middleware('role:admin')->prefix('backups')->group(function () {
        Route::get('/', [BackupController::class, 'index']);
        Route::post('/', [BackupController::class, 'create']);
        Route::get('/statistics', [BackupController::class, 'statistics']);
        Route::get('/download', [BackupController::class, 'download']);
        Route::delete('/{filename}', [BackupController::class, 'destroy']);
        Route::post('/schedule', [BackupController::class, 'schedule']);
    });

    // User management routes (admin only)
    Route::middleware('role:admin')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });
});
