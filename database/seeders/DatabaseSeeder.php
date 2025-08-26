<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\WoodInventory;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo users
        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@woodinventory.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'Manajer Operasional',
                'email' => 'manajer@woodinventory.com',
                'password' => Hash::make('password123'),
                'role' => 'manajer',
                'is_active' => true,
            ],
            [
                'name' => 'Operator Inventory',
                'email' => 'operator@woodinventory.com',
                'password' => Hash::make('password123'),
                'role' => 'operator',
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        // Create sample wood inventory data
        $sampleData = [
            [
                'no_kontrak' => 'KTR-2024-001',
                'kontrak' => 'Kontrak Pengadaan Kayu Jati 2024',
                'no_kapling' => 'KPL-001',
                'jenis_kayu' => 'Jati',
                'sort' => 'A1',
                'panjang' => 4.00,
                'diameter' => 25.50,
                'qty' => 10,
                'volume' => 2.0358,
                'mutu' => 'Super',
                'status' => 'ready',
                'trs' => 'TRS-2024-001',
                'tgl_pembelian' => '2024-01-15',
                'harga' => 15000000.00,
                'asal_tpk' => 'TPK Perhutani Jawa Tengah',
                'skshh' => 'SKSHH-2024-001-JT',
                'delivery_dari_perhutani' => true,
                'tanggal_sampai_bali' => '2024-01-20',
                'urutan_pengiriman' => 1,
                'lokasi_saat_ini' => 'Gudang A - Rak 1',
                'proses' => 'pengeringan',
                'tgl_dibelah' => '2024-01-25',
                'tgl_diambil_dari_tempat_belah' => '2024-01-30',
                'rencana_alokasi' => 'Furniture Premium',
                'kubik_price' => 7500000.00,
                'tahun_pembelian' => 2024,
            ],
            [
                'no_kontrak' => 'KTR-2024-002',
                'kontrak' => 'Kontrak Pengadaan Kayu Mahoni 2024',
                'no_kapling' => 'KPL-002',
                'jenis_kayu' => 'Mahoni',
                'sort' => 'B1',
                'panjang' => 3.50,
                'diameter' => 20.00,
                'qty' => 15,
                'volume' => 1.6485,
                'mutu' => 'Grade A',
                'status' => 'in-process',
                'trs' => 'TRS-2024-002',
                'tgl_pembelian' => '2024-02-01',
                'harga' => 8000000.00,
                'asal_tpk' => 'TPK Perhutani Jawa Barat',
                'skshh' => 'SKSHH-2024-002-JB',
                'delivery_dari_perhutani' => true,
                'tanggal_sampai_bali' => '2024-02-05',
                'urutan_pengiriman' => 1,
                'lokasi_saat_ini' => 'Area Proses - Zona B',
                'proses' => 'pemotongan',
                'tgl_dibelah' => null,
                'tgl_diambil_dari_tempat_belah' => null,
                'rencana_alokasi' => 'Konstruksi Bangunan',
                'kubik_price' => 4500000.00,
                'tahun_pembelian' => 2024,
            ],
            [
                'no_kontrak' => 'KTR-2024-003',
                'kontrak' => 'Kontrak Pengadaan Kayu Sengon 2024',
                'no_kapling' => 'KPL-003',
                'jenis_kayu' => 'Sengon',
                'sort' => 'C1',
                'panjang' => 3.00,
                'diameter' => 15.00,
                'qty' => 25,
                'volume' => 1.3254,
                'mutu' => 'Grade B',
                'status' => 'ready',
                'trs' => 'TRS-2024-003',
                'tgl_pembelian' => '2024-02-15',
                'harga' => 3500000.00,
                'asal_tpk' => 'TPK Swasta Lampung',
                'skshh' => 'SKSHH-2024-003-LP',
                'delivery_dari_perhutani' => false,
                'tanggal_sampai_bali' => '2024-02-20',
                'urutan_pengiriman' => 1,
                'lokasi_saat_ini' => 'Gudang B - Rak 3',
                'proses' => null,
                'tgl_dibelah' => null,
                'tgl_diambil_dari_tempat_belah' => null,
                'rencana_alokasi' => 'Pallet dan Kemasan',
                'kubik_price' => 2500000.00,
                'tahun_pembelian' => 2024,
            ],
            [
                'no_kontrak' => 'KTR-2024-001',
                'kontrak' => 'Kontrak Pengadaan Kayu Jati 2024',
                'no_kapling' => 'KPL-002',
                'jenis_kayu' => 'Jati',
                'sort' => 'A2',
                'panjang' => 3.80,
                'diameter' => 22.00,
                'qty' => 8,
                'volume' => 1.4486,
                'mutu' => 'Grade A',
                'status' => 'rusak',
                'trs' => 'TRS-2024-004',
                'tgl_pembelian' => '2024-01-15',
                'harga' => 12000000.00,
                'asal_tpk' => 'TPK Perhutani Jawa Tengah',
                'skshh' => 'SKSHH-2024-001-JT',
                'delivery_dari_perhutani' => true,
                'tanggal_sampai_bali' => '2024-01-20',
                'urutan_pengiriman' => 2,
                'lokasi_saat_ini' => 'Area Karantina',
                'proses' => 'inspeksi',
                'tgl_dibelah' => null,
                'tgl_diambil_dari_tempat_belah' => null,
                'rencana_alokasi' => 'Perbaikan/Recycle',
                'kubik_price' => 7500000.00,
                'tahun_pembelian' => 2024,
            ],
            [
                'no_kontrak' => 'KTR-2024-004',
                'kontrak' => 'Kontrak Pengadaan Kayu Meranti 2024',
                'no_kapling' => 'KPL-001',
                'jenis_kayu' => 'Meranti',
                'sort' => 'B2',
                'panjang' => 4.20,
                'diameter' => 28.00,
                'qty' => 12,
                'volume' => 2.7493,
                'mutu' => 'Super',
                'status' => 'ready',
                'trs' => 'TRS-2024-005',
                'tgl_pembelian' => '2024-03-01',
                'harga' => 18000000.00,
                'asal_tpk' => 'TPK Kalimantan Timur',
                'skshh' => 'SKSHH-2024-004-KT',
                'delivery_dari_perhutani' => false,
                'tanggal_sampai_bali' => '2024-03-08',
                'urutan_pengiriman' => 1,
                'lokasi_saat_ini' => 'Gudang Premium - Rak 1',
                'proses' => 'pengeringan',
                'tgl_dibelah' => '2024-03-10',
                'tgl_diambil_dari_tempat_belah' => '2024-03-15',
                'rencana_alokasi' => 'Export Quality Furniture',
                'kubik_price' => 6500000.00,
                'tahun_pembelian' => 2024,
            ],
        ];

        foreach ($sampleData as $data) {
            WoodInventory::firstOrCreate(
                [
                    'no_kontrak' => $data['no_kontrak'],
                    'no_kapling' => $data['no_kapling'],
                    'skshh' => $data['skshh'],
                    'urutan_pengiriman' => $data['urutan_pengiriman'],
                ],
                $data
            );
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Demo users created:');
        $this->command->info('- Admin: admin@woodinventory.com / password123');
        $this->command->info('- Manajer: manajer@woodinventory.com / password123');
        $this->command->info('- Operator: operator@woodinventory.com / password123');
    }
}
