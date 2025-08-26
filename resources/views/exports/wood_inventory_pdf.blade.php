<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Wood Inventory Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
            font-size: 8px;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .status-ready { color: #28a745; }
        .status-in-process { color: #ffc107; }
        .status-rusak { color: #dc3545; }
        .status-reject { color: #6c757d; }
        .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        .summary-item {
            display: inline-block;
            margin-right: 20px;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN INVENTORY PENGOLAHAN KAYU</h1>
        <p>Tanggal Cetak: {{ date('d/m/Y H:i:s') }}</p>
        <p>Total Data: {{ count($inventories) }} item</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>NO KONTRAK</th>
                <th>KONTRAK</th>
                <th>NO KAPLING</th>
                <th>JENIS KAYU</th>
                <th>SORT</th>
                <th>PANJANG</th>
                <th>DIAMETER</th>
                <th>QTY</th>
                <th>VOLUME</th>
                <th>MUTU</th>
                <th>STATUS</th>
                <th>TRS</th>
                <th>TGL BELI</th>
                <th>HARGA</th>
                <th>LOKASI</th>
                <th>PROSES</th>
                <th>TAHUN</th>
            </tr>
        </thead>
        <tbody>
            @foreach($inventories as $item)
            <tr>
                <td>{{ $item->no_kontrak }}</td>
                <td>{{ $item->kontrak }}</td>
                <td>{{ $item->no_kapling }}</td>
                <td>{{ $item->jenis_kayu }}</td>
                <td>{{ $item->sort }}</td>
                <td class="text-right">{{ $item->panjang }}</td>
                <td class="text-right">{{ $item->diameter }}</td>
                <td class="text-center">{{ $item->qty }}</td>
                <td class="text-right">{{ number_format($item->volume, 2) }}</td>
                <td>{{ $item->mutu }}</td>
                <td class="text-center status-{{ $item->status }}">{{ ucfirst($item->status) }}</td>
                <td>{{ $item->trs }}</td>
                <td class="text-center">{{ $item->tgl_pembelian ? $item->tgl_pembelian->format('d/m/Y') : '' }}</td>
                <td class="text-right">{{ number_format($item->harga, 0, ',', '.') }}</td>
                <td>{{ $item->lokasi_saat_ini }}</td>
                <td>{{ $item->proses }}</td>
                <td class="text-center">{{ $item->tahun_pembelian }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <h3>RINGKASAN</h3>
        <div class="summary-item">
            <strong>Total Item:</strong> {{ count($inventories) }}
        </div>
        <div class="summary-item">
            <strong>Total Volume:</strong> {{ number_format($inventories->sum('volume'), 2) }} m³
        </div>
        <div class="summary-item">
            <strong>Total Nilai:</strong> Rp {{ number_format($inventories->sum(function($item) { return $item->volume * $item->kubik_price; }), 0, ',', '.') }}
        </div>
    </div>
</body>
</html>
