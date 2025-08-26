<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WoodInventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\WoodInventoryExport;
use Barryvdh\DomPDF\Facade\Pdf;

class WoodInventoryController extends Controller
{
    /**
     * Display a listing of the resource with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = WoodInventory::query();

        // Apply filters
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('jenis_kayu')) {
            $query->byJenisKayu($request->jenis_kayu);
        }

        if ($request->filled('lokasi')) {
            $query->byLokasi($request->lokasi);
        }

        if ($request->filled('tahun')) {
            $query->byTahun($request->tahun);
        }

        if ($request->filled('proses')) {
            $query->byProses($request->proses);
        }

        if ($request->filled('mutu')) {
            $query->where('mutu', 'like', "%{$request->mutu}%");
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_kontrak', 'like', "%{$search}%")
                  ->orWhere('kontrak', 'like', "%{$search}%")
                  ->orWhere('no_kapling', 'like', "%{$search}%")
                  ->orWhere('trs', 'like', "%{$search}%")
                  ->orWhere('skshh', 'like', "%{$search}%");
            });
        }

        // Date range filters
        if ($request->filled('tgl_pembelian_from')) {
            $query->where('tgl_pembelian', '>=', $request->tgl_pembelian_from);
        }

        if ($request->filled('tgl_pembelian_to')) {
            $query->where('tgl_pembelian', '<=', $request->tgl_pembelian_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'tgl_pembelian');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $inventories = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $inventories,
            'summary' => [
                'total_items' => $inventories->total(),
                'total_volume' => $query->sum('volume'),
                'total_value' => $query->sum(DB::raw('volume * kubik_price')),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'no_kontrak' => 'required|string|max:50',
            'kontrak' => 'required|string|max:200',
            'no_kapling' => 'required|string|max:50',
            'jenis_kayu' => 'required|string|max:100',
            'sort' => 'required|string|max:50',
            'panjang' => 'required|numeric|min:0',
            'diameter' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:1',
            'volume' => 'required|numeric|min:0',
            'mutu' => 'required|string|max:50',
            'status' => 'required|in:ready,in-process,rusak,reject',
            'trs' => 'required|string|max:100|unique:wood_inventories,trs',
            'tgl_pembelian' => 'required|date',
            'harga' => 'required|numeric|min:0',
            'asal_tpk' => 'required|string|max:200',
            'skshh' => 'required|string|max:100',
            'delivery_dari_perhutani' => 'boolean',
            'tanggal_sampai_bali' => 'nullable|date',
            'urutan_pengiriman' => 'required|integer|min:1',
            'lokasi_saat_ini' => 'required|string|max:200',
            'proses' => 'nullable|string|max:100',
            'tgl_dibelah' => 'nullable|date',
            'tgl_diambil_dari_tempat_belah' => 'nullable|date',
            'rencana_alokasi' => 'nullable|string|max:200',
            'kubik_price' => 'required|numeric|min:0',
            'tahun_pembelian' => 'required|integer|min:1900|max:' . date('Y'),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate composite key
        $exists = WoodInventory::where('no_kontrak', $request->no_kontrak)
            ->where('no_kapling', $request->no_kapling)
            ->where('skshh', $request->skshh)
            ->where('urutan_pengiriman', $request->urutan_pengiriman)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Data dengan kombinasi NO KONTRAK, NO KAPLING, SKSHH, dan URUTAN PENGIRIMAN sudah ada. Gunakan fungsi update untuk mengubah data.',
                'suggestion' => 'update_existing'
            ], 409);
        }

        try {
            $inventory = WoodInventory::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil disimpan',
                'data' => $inventory
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request): JsonResponse
    {
        $inventory = WoodInventory::where('no_kontrak', $request->no_kontrak)
            ->where('no_kapling', $request->no_kapling)
            ->where('skshh', $request->skshh)
            ->where('urutan_pengiriman', $request->urutan_pengiriman)
            ->first();

        if (!$inventory) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $inventory
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request): JsonResponse
    {
        $inventory = WoodInventory::where('no_kontrak', $request->route('no_kontrak'))
            ->where('no_kapling', $request->route('no_kapling'))
            ->where('skshh', $request->route('skshh'))
            ->where('urutan_pengiriman', $request->route('urutan_pengiriman'))
            ->first();

        if (!$inventory) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'kontrak' => 'sometimes|string|max:200',
            'jenis_kayu' => 'sometimes|string|max:100',
            'sort' => 'sometimes|string|max:50',
            'panjang' => 'sometimes|numeric|min:0',
            'diameter' => 'sometimes|numeric|min:0',
            'qty' => 'sometimes|integer|min:1',
            'volume' => 'sometimes|numeric|min:0',
            'mutu' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:ready,in-process,rusak,reject',
            'tgl_pembelian' => 'sometimes|date',
            'harga' => 'sometimes|numeric|min:0',
            'asal_tpk' => 'sometimes|string|max:200',
            'delivery_dari_perhutani' => 'sometimes|boolean',
            'tanggal_sampai_bali' => 'nullable|date',
            'lokasi_saat_ini' => 'sometimes|string|max:200',
            'proses' => 'nullable|string|max:100',
            'tgl_dibelah' => 'nullable|date',
            'tgl_diambil_dari_tempat_belah' => 'nullable|date',
            'rencana_alokasi' => 'nullable|string|max:200',
            'kubik_price' => 'sometimes|numeric|min:0',
            'tahun_pembelian' => 'sometimes|integer|min:1900|max:' . date('Y'),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $inventory->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diupdate',
                'data' => $inventory->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request): JsonResponse
    {
        $inventory = WoodInventory::where('no_kontrak', $request->route('no_kontrak'))
            ->where('no_kapling', $request->route('no_kapling'))
            ->where('skshh', $request->route('skshh'))
            ->where('urutan_pengiriman', $request->route('urutan_pengiriman'))
            ->first();

        if (!$inventory) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        try {
            $inventory->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export data to Excel
     */
    public function exportExcel(Request $request)
    {
        $query = WoodInventory::query();
        
        // Apply same filters as index method
        $this->applyFilters($query, $request);
        
        return Excel::download(new WoodInventoryExport($query->get()), 'wood_inventory_' . date('Y-m-d_H-i-s') . '.xlsx');
    }

    /**
     * Export data to PDF
     */
    public function exportPdf(Request $request)
    {
        $query = WoodInventory::query();
        
        // Apply same filters as index method
        $this->applyFilters($query, $request);
        
        $inventories = $query->get();
        
        $pdf = Pdf::loadView('exports.wood_inventory_pdf', compact('inventories'));
        
        return $pdf->download('wood_inventory_' . date('Y-m-d_H-i-s') . '.pdf');
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_items' => WoodInventory::count(),
            'total_volume' => WoodInventory::sum('volume'),
            'total_value' => WoodInventory::sum(DB::raw('volume * kubik_price')),
            'by_status' => WoodInventory::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'by_jenis_kayu' => WoodInventory::select('jenis_kayu', DB::raw('count(*) as count'))
                ->groupBy('jenis_kayu')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'recent_additions' => WoodInventory::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Apply filters to query
     */
    private function applyFilters($query, $request)
    {
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('jenis_kayu')) {
            $query->byJenisKayu($request->jenis_kayu);
        }

        if ($request->filled('lokasi')) {
            $query->byLokasi($request->lokasi);
        }

        if ($request->filled('tahun')) {
            $query->byTahun($request->tahun);
        }

        if ($request->filled('proses')) {
            $query->byProses($request->proses);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_kontrak', 'like', "%{$search}%")
                  ->orWhere('kontrak', 'like', "%{$search}%")
                  ->orWhere('no_kapling', 'like', "%{$search}%")
                  ->orWhere('trs', 'like', "%{$search}%")
                  ->orWhere('skshh', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tgl_pembelian_from')) {
            $query->where('tgl_pembelian', '>=', $request->tgl_pembelian_from);
        }

        if ($request->filled('tgl_pembelian_to')) {
            $query->where('tgl_pembelian', '<=', $request->tgl_pembelian_to);
        }
    }
}
