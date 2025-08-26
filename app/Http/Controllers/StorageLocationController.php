<?php

namespace App\Http\Controllers;

use App\Models\StorageLocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class StorageLocationController extends Controller
{
    /**
     * Display a listing of storage locations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = StorageLocation::query();

        // Apply filters
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('zone')) {
            $query->byZone($request->zone);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->has('available_capacity')) {
            $query->available($request->available_capacity);
        }

        // Apply search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'code');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $locations = $query->paginate($request->get('per_page', 15));

        return response()->json($locations);
    }

    /**
     * Store a newly created storage location.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:storage_locations,code',
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['warehouse', 'yard', 'processing', 'shipping', 'quarantine'])],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'capacity_cubic_meters' => 'nullable|numeric|min:0',
            'zone' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'coordinates' => 'nullable|array',
            'coordinates.lat' => 'nullable|numeric|between:-90,90',
            'coordinates.lng' => 'nullable|numeric|between:-180,180',
        ]);

        $location = StorageLocation::create($validated);

        return response()->json([
            'message' => 'Storage location created successfully',
            'data' => $location
        ], 201);
    }

    /**
     * Display the specified storage location.
     */
    public function show(StorageLocation $storageLocation): JsonResponse
    {
        $storageLocation->load('woodInventories');
        
        return response()->json([
            'data' => $storageLocation,
            'inventory_count' => $storageLocation->woodInventories->count(),
            'total_volume' => $storageLocation->woodInventories->sum('volume')
        ]);
    }

    /**
     * Update the specified storage location.
     */
    public function update(Request $request, StorageLocation $storageLocation): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('storage_locations', 'code')->ignore($storageLocation->id)],
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['warehouse', 'yard', 'processing', 'shipping', 'quarantine'])],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'capacity_cubic_meters' => 'nullable|numeric|min:0',
            'zone' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'coordinates' => 'nullable|array',
            'coordinates.lat' => 'nullable|numeric|between:-90,90',
            'coordinates.lng' => 'nullable|numeric|between:-180,180',
        ]);

        $storageLocation->update($validated);

        return response()->json([
            'message' => 'Storage location updated successfully',
            'data' => $storageLocation
        ]);
    }

    /**
     * Remove the specified storage location.
     */
    public function destroy(StorageLocation $storageLocation): JsonResponse
    {
        // Check if location has inventory
        if ($storageLocation->woodInventories()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete storage location with existing inventory items'
            ], 422);
        }

        $storageLocation->delete();

        return response()->json([
            'message' => 'Storage location deleted successfully'
        ]);
    }

    /**
     * Get storage location statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_locations' => StorageLocation::count(),
            'active_locations' => StorageLocation::active()->count(),
            'by_type' => StorageLocation::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'total_capacity' => StorageLocation::sum('capacity_cubic_meters'),
            'total_usage' => StorageLocation::sum('current_usage'),
            'utilization_by_location' => StorageLocation::active()
                ->whereNotNull('capacity_cubic_meters')
                ->get()
                ->map(function ($location) {
                    return [
                        'code' => $location->code,
                        'name' => $location->name,
                        'utilization_percentage' => $location->utilization_percentage,
                        'available_capacity' => $location->available_capacity
                    ];
                })
        ];

        return response()->json($stats);
    }

    /**
     * Update usage for all storage locations.
     */
    public function updateUsage(): JsonResponse
    {
        $locations = StorageLocation::all();
        
        foreach ($locations as $location) {
            $location->updateUsage();
        }

        return response()->json([
            'message' => 'Storage location usage updated successfully'
        ]);
    }

    /**
     * Get available locations for a given volume.
     */
    public function getAvailable(Request $request): JsonResponse
    {
        $request->validate([
            'volume' => 'required|numeric|min:0',
            'type' => 'nullable|string'
        ]);

        $query = StorageLocation::available($request->volume);

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $locations = $query->get();

        return response()->json([
            'data' => $locations,
            'count' => $locations->count()
        ]);
    }
}
