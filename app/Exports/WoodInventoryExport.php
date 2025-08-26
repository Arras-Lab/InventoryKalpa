<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WoodInventoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $inventories;

    public function __construct($inventories)
    {
        $this->inventories = $inventories;
    }

    public function collection()
    {
        return $this->inventories;
    }

    public function headings(): array
    {
        return [
            'NO KONTRAK',
            'KONTRAK',
            'NO KAPLING',
            'JENIS KAYU',
            'SORT',
            'PANJANG (m)',
            'DIAMETER (cm)',
            'QTY',
            'VOLUME (m³)',
            'MUTU',
            'STATUS',
            'TRS',
            'TGL PEMBELIAN',
            'HARGA (Rp)',
            'ASAL TPK',
            'SKSHH',
            'DELIVERY PERHUTANI',
            'TGL SAMPAI BALI',
            'URUTAN PENGIRIMAN',
            'LOKASI SAAT INI',
            'PROSES',
            'TGL DIBELAH',
            'TGL DIAMBIL',
            'RENCANA ALOKASI',
            'KUBIK PRICE (Rp)',
            'TAHUN PEMBELIAN',
            'TOTAL VALUE (Rp)',
        ];
    }

    public function map($inventory): array
    {
        return [
            $inventory->no_kontrak,
            $inventory->kontrak,
            $inventory->no_kapling,
            $inventory->jenis_kayu,
            $inventory->sort,
            $inventory->panjang,
            $inventory->diameter,
            $inventory->qty,
            $inventory->volume,
            $inventory->mutu,
            ucfirst($inventory->status),
            $inventory->trs,
            $inventory->tgl_pembelian ? $inventory->tgl_pembelian->format('d/m/Y') : '',
            number_format($inventory->harga, 0, ',', '.'),
            $inventory->asal_tpk,
            $inventory->skshh,
            $inventory->delivery_dari_perhutani ? 'Ya' : 'Tidak',
            $inventory->tanggal_sampai_bali ? $inventory->tanggal_sampai_bali->format('d/m/Y') : '',
            $inventory->urutan_pengiriman,
            $inventory->lokasi_saat_ini,
            $inventory->proses,
            $inventory->tgl_dibelah ? $inventory->tgl_dibelah->format('d/m/Y') : '',
            $inventory->tgl_diambil_dari_tempat_belah ? $inventory->tgl_diambil_dari_tempat_belah->format('d/m/Y') : '',
            $inventory->rencana_alokasi,
            number_format($inventory->kubik_price, 0, ',', '.'),
            $inventory->tahun_pembelian,
            number_format($inventory->total_value, 0, ',', '.'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15, // NO KONTRAK
            'B' => 25, // KONTRAK
            'C' => 15, // NO KAPLING
            'D' => 20, // JENIS KAYU
            'E' => 10, // SORT
            'F' => 12, // PANJANG
            'G' => 12, // DIAMETER
            'H' => 8,  // QTY
            'I' => 12, // VOLUME
            'J' => 12, // MUTU
            'K' => 12, // STATUS
            'L' => 15, // TRS
            'M' => 15, // TGL PEMBELIAN
            'N' => 15, // HARGA
            'O' => 20, // ASAL TPK
            'P' => 20, // SKSHH
            'Q' => 15, // DELIVERY PERHUTANI
            'R' => 15, // TGL SAMPAI BALI
            'S' => 15, // URUTAN PENGIRIMAN
            'T' => 20, // LOKASI SAAT INI
            'U' => 15, // PROSES
            'V' => 15, // TGL DIBELAH
            'W' => 15, // TGL DIAMBIL
            'X' => 20, // RENCANA ALOKASI
            'Y' => 15, // KUBIK PRICE
            'Z' => 15, // TAHUN PEMBELIAN
            'AA' => 15, // TOTAL VALUE
        ];
    }
}
