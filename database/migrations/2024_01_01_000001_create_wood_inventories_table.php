<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wood_inventories', function (Blueprint $table) {
            // Primary Key Components
            $table->string('no_kontrak', 50);
            $table->string('no_kapling', 50);
            $table->string('skshh', 100);
            $table->integer('urutan_pengiriman');
            
            // Contract and Basic Info
            $table->string('kontrak', 200);
            $table->string('jenis_kayu', 100);
            $table->string('sort', 50);
            
            // Measurements
            $table->decimal('panjang', 10, 2);
            $table->decimal('diameter', 10, 2);
            $table->integer('qty');
            $table->decimal('volume', 12, 4);
            
            // Quality and Status
            $table->string('mutu', 50);
            $table->enum('status', ['ready', 'in-process', 'rusak', 'reject'])->default('ready');
            
            // Transaction Info
            $table->string('trs', 100)->unique(); // Transaction code
            $table->date('tgl_pembelian');
            $table->decimal('harga', 15, 2);
            $table->year('tahun_pembelian');
            
            // Source and Delivery
            $table->string('asal_tpk', 200);
            $table->boolean('delivery_dari_perhutani')->default(false);
            $table->date('tanggal_sampai_bali')->nullable();
            
            // Location and Process
            $table->string('lokasi_saat_ini', 200);
            $table->string('proses', 100)->nullable();
            $table->date('tgl_dibelah')->nullable();
            $table->date('tgl_diambil_dari_tempat_belah')->nullable();
            
            // Planning and Pricing
            $table->string('rencana_alokasi', 200)->nullable();
            $table->decimal('kubik_price', 15, 2);
            
            // Timestamps
            $table->timestamps();
            
            // Composite Primary Key
            $table->primary(['no_kontrak', 'no_kapling', 'skshh', 'urutan_pengiriman']);
            
            // Indexes for better performance
            $table->index(['status']);
            $table->index(['jenis_kayu']);
            $table->index(['lokasi_saat_ini']);
            $table->index(['tahun_pembelian']);
            $table->index(['tgl_pembelian']);
            $table->index(['proses']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wood_inventories');
    }
};
