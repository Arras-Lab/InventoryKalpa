<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Get list of available backups
     */
    public function index(): JsonResponse
    {
        $backupPath = storage_path('app/backups');
        
        if (!is_dir($backupPath)) {
            return response()->json(['data' => []]);
        }

        $files = glob($backupPath . '/wood_inventory_backup_*.sql*');
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $backups[] = [
                'filename' => $filename,
                'path' => $file,
                'size' => $this->formatBytes(filesize($file)),
                'created_at' => Carbon::createFromTimestamp(filemtime($file))->toISOString(),
                'is_compressed' => str_ends_with($filename, '.gz')
            ];
        }

        // Sort by creation date (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json(['data' => $backups]);
    }

    /**
     * Create a new database backup
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'compress' => 'boolean',
            'path' => 'nullable|string'
        ]);

        try {
            $options = [];
            
            if ($request->boolean('compress')) {
                $options['--compress'] = true;
            }
            
            if ($request->has('path')) {
                $options['--path'] = $request->path;
            }

            Artisan::call('db:backup', $options);
            $output = Artisan::output();

            return response()->json([
                'message' => 'Database backup created successfully',
                'output' => $output
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create backup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a backup file
     */
    public function download(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $filename = $request->query('filename');
        $backupPath = storage_path('app/backups');
        $filePath = $backupPath . DIRECTORY_SEPARATOR . $filename;

        if (!file_exists($filePath) || !str_starts_with(basename($filePath), 'wood_inventory_backup_')) {
            abort(404, 'Backup file not found');
        }

        return response()->download($filePath);
    }

    /**
     * Delete a backup file
     */
    public function destroy(Request $request): JsonResponse
    {
        $filename = $request->route('filename');
        $backupPath = storage_path('app/backups');
        $filePath = $backupPath . DIRECTORY_SEPARATOR . $filename;

        if (!file_exists($filePath) || !str_starts_with(basename($filePath), 'wood_inventory_backup_')) {
            return response()->json(['message' => 'Backup file not found'], 404);
        }

        if (unlink($filePath)) {
            return response()->json(['message' => 'Backup deleted successfully']);
        }

        return response()->json(['message' => 'Failed to delete backup'], 500);
    }

    /**
     * Get backup statistics
     */
    public function statistics(): JsonResponse
    {
        $backupPath = storage_path('app/backups');
        
        if (!is_dir($backupPath)) {
            return response()->json([
                'total_backups' => 0,
                'total_size' => 0,
                'latest_backup' => null,
                'disk_usage' => '0 B'
            ]);
        }

        $files = glob($backupPath . '/wood_inventory_backup_*.sql*');
        $totalSize = 0;
        $latestBackup = null;
        $latestTime = 0;

        foreach ($files as $file) {
            $size = filesize($file);
            $totalSize += $size;
            
            $mtime = filemtime($file);
            if ($mtime > $latestTime) {
                $latestTime = $mtime;
                $latestBackup = [
                    'filename' => basename($file),
                    'size' => $this->formatBytes($size),
                    'created_at' => Carbon::createFromTimestamp($mtime)->toISOString()
                ];
            }
        }

        return response()->json([
            'total_backups' => count($files),
            'total_size' => $totalSize,
            'latest_backup' => $latestBackup,
            'disk_usage' => $this->formatBytes($totalSize)
        ]);
    }

    /**
     * Schedule automatic backups
     */
    public function schedule(Request $request): JsonResponse
    {
        $request->validate([
            'frequency' => 'required|in:daily,weekly,monthly',
            'time' => 'required|date_format:H:i',
            'compress' => 'boolean',
            'enabled' => 'boolean'
        ]);

        // This would typically be stored in a settings table or config
        // For now, we'll return a success response
        return response()->json([
            'message' => 'Backup schedule updated successfully',
            'schedule' => $request->all()
        ]);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
