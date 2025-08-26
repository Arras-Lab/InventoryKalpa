<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StorageLocation;

class StorageLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'code' => 'WH-A1',
                'name' => 'Main Warehouse A1',
                'type' => 'warehouse',
                'description' => 'Primary storage warehouse for processed wood',
                'is_active' => true,
                'capacity_cubic_meters' => 1000.00,
                'current_usage' => 0.00,
                'zone' => 'North',
                'address' => 'Jl. Industri No. 1, Denpasar',
                'coordinates' => ['lat' => -8.6705, 'lng' => 115.2126],
            ],
            [
                'code' => 'WH-A2',
                'name' => 'Main Warehouse A2',
                'type' => 'warehouse',
                'description' => 'Secondary storage warehouse',
                'is_active' => true,
                'capacity_cubic_meters' => 800.00,
                'current_usage' => 0.00,
                'zone' => 'North',
                'address' => 'Jl. Industri No. 2, Denpasar',
                'coordinates' => ['lat' => -8.6708, 'lng' => 115.2130],
            ],
            [
                'code' => 'YRD-B1',
                'name' => 'Outdoor Yard B1',
                'type' => 'yard',
                'description' => 'Open storage yard for raw materials',
                'is_active' => true,
                'capacity_cubic_meters' => 2000.00,
                'current_usage' => 0.00,
                'zone' => 'South',
                'address' => 'Jl. Gudang No. 5, Denpasar',
                'coordinates' => ['lat' => -8.6715, 'lng' => 115.2140],
            ],
            [
                'code' => 'YRD-B2',
                'name' => 'Outdoor Yard B2',
                'type' => 'yard',
                'description' => 'Secondary outdoor storage area',
                'is_active' => true,
                'capacity_cubic_meters' => 1500.00,
                'current_usage' => 0.00,
                'zone' => 'South',
                'address' => 'Jl. Gudang No. 7, Denpasar',
                'coordinates' => ['lat' => -8.6720, 'lng' => 115.2145],
            ],
            [
                'code' => 'PROC-C1',
                'name' => 'Processing Area C1',
                'type' => 'processing',
                'description' => 'Main wood processing and cutting area',
                'is_active' => true,
                'capacity_cubic_meters' => 500.00,
                'current_usage' => 0.00,
                'zone' => 'Central',
                'address' => 'Jl. Produksi No. 3, Denpasar',
                'coordinates' => ['lat' => -8.6710, 'lng' => 115.2135],
            ],
            [
                'code' => 'SHIP-D1',
                'name' => 'Shipping Area D1',
                'type' => 'shipping',
                'description' => 'Loading dock and shipping preparation area',
                'is_active' => true,
                'capacity_cubic_meters' => 300.00,
                'current_usage' => 0.00,
                'zone' => 'East',
                'address' => 'Jl. Ekspor No. 1, Denpasar',
                'coordinates' => ['lat' => -8.6700, 'lng' => 115.2150],
            ],
            [
                'code' => 'QUA-E1',
                'name' => 'Quarantine Area E1',
                'type' => 'quarantine',
                'description' => 'Quarantine area for damaged or rejected materials',
                'is_active' => true,
                'capacity_cubic_meters' => 200.00,
                'current_usage' => 0.00,
                'zone' => 'West',
                'address' => 'Jl. Karantina No. 2, Denpasar',
                'coordinates' => ['lat' => -8.6725, 'lng' => 115.2120],
            ],
            [
                'code' => 'WH-TEMP',
                'name' => 'Temporary Storage',
                'type' => 'warehouse',
                'description' => 'Temporary storage for incoming materials',
                'is_active' => true,
                'capacity_cubic_meters' => null, // Unlimited capacity
                'current_usage' => 0.00,
                'zone' => 'Central',
                'address' => 'Jl. Sementara No. 1, Denpasar',
                'coordinates' => null,
            ],
        ];

        foreach ($locations as $location) {
            StorageLocation::create($location);
        }
    }
}
