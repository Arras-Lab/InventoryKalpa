<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup {--path=} {--compress}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database backup...');

        $dbName = config('database.connections.mysql.database');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');
        $dbHost = config('database.connections.mysql.host');
        $dbPort = config('database.connections.mysql.port', 3306);

        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename = "wood_inventory_backup_{$timestamp}.sql";
        
        $customPath = $this->option('path');
        $backupPath = $customPath ? $customPath : storage_path('app/backups');
        
        // Create backup directory if it doesn't exist
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $fullPath = $backupPath . DIRECTORY_SEPARATOR . $filename;

        // Create mysqldump command
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s --port=%d --single-transaction --routines --triggers %s > %s',
            escapeshellarg($dbUser),
            escapeshellarg($dbPass),
            escapeshellarg($dbHost),
            $dbPort,
            escapeshellarg($dbName),
            escapeshellarg($fullPath)
        );

        // Execute backup command
        $output = null;
        $returnVar = null;
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $this->error('Database backup failed!');
            return 1;
        }

        // Compress backup if requested
        if ($this->option('compress')) {
            $compressedPath = $fullPath . '.gz';
            exec("gzip {$fullPath}", $output, $returnVar);
            
            if ($returnVar === 0) {
                $fullPath = $compressedPath;
                $filename .= '.gz';
                $this->info('Backup compressed successfully.');
            }
        }

        // Clean old backups (keep last 30 days)
        $this->cleanOldBackups($backupPath);

        $fileSize = $this->formatBytes(filesize($fullPath));
        
        $this->info("Database backup completed successfully!");
        $this->info("File: {$filename}");
        $this->info("Path: {$fullPath}");
        $this->info("Size: {$fileSize}");

        return 0;
    }

    /**
     * Clean old backup files
     */
    private function cleanOldBackups($backupPath)
    {
        $files = glob($backupPath . '/wood_inventory_backup_*.sql*');
        $cutoffTime = Carbon::now()->subDays(30)->timestamp;

        foreach ($files as $file) {
            if (filemtime($file) < $cutoffTime) {
                unlink($file);
                $this->info("Deleted old backup: " . basename($file));
            }
        }
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
