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
        Schema::create('storage_locations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Location code (e.g., WH-A1, YRD-B2)
            $table->string('name'); // Location name
            $table->enum('type', ['warehouse', 'yard', 'processing', 'shipping', 'quarantine'])->default('warehouse');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('capacity_cubic_meters', 10, 2)->nullable(); // Storage capacity
            $table->decimal('current_usage', 10, 2)->default(0); // Current usage
            $table->string('zone')->nullable(); // Zone or area
            $table->string('address')->nullable(); // Physical address
            $table->json('coordinates')->nullable(); // GPS coordinates
            $table->timestamps();
            
            $table->index(['type', 'is_active']);
            $table->index('zone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_locations');
    }
};
