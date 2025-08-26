<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class StorageLocation extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'code',
        'name',
        'type',
        'description',
        'is_active',
        'capacity_cubic_meters',
        'current_usage',
        'zone',
        'address',
        'coordinates',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'capacity_cubic_meters' => 'decimal:2',
        'current_usage' => 'decimal:2',
        'coordinates' => 'array',
    ];

    // Activity log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'code', 'name', 'type', 'description', 'is_active',
                'capacity_cubic_meters', 'current_usage', 'zone', 'address'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function woodInventories()
    {
        return $this->hasMany(WoodInventory::class, 'lokasi_saat_ini', 'code');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByZone($query, $zone)
    {
        return $query->where('zone', $zone);
    }

    public function scopeAvailable($query, $requiredCapacity = 0)
    {
        return $query->where('is_active', true)
                    ->whereRaw('(capacity_cubic_meters - current_usage) >= ?', [$requiredCapacity]);
    }

    // Accessors
    public function getAvailableCapacityAttribute()
    {
        if (is_null($this->capacity_cubic_meters)) {
            return null;
        }
        return $this->capacity_cubic_meters - $this->current_usage;
    }

    public function getUtilizationPercentageAttribute()
    {
        if (is_null($this->capacity_cubic_meters) || $this->capacity_cubic_meters == 0) {
            return 0;
        }
        return round(($this->current_usage / $this->capacity_cubic_meters) * 100, 2);
    }

    // Type constants
    const TYPE_WAREHOUSE = 'warehouse';
    const TYPE_YARD = 'yard';
    const TYPE_PROCESSING = 'processing';
    const TYPE_SHIPPING = 'shipping';
    const TYPE_QUARANTINE = 'quarantine';

    public static function getTypeOptions()
    {
        return [
            self::TYPE_WAREHOUSE => 'Warehouse',
            self::TYPE_YARD => 'Yard',
            self::TYPE_PROCESSING => 'Processing Area',
            self::TYPE_SHIPPING => 'Shipping Area',
            self::TYPE_QUARANTINE => 'Quarantine',
        ];
    }

    // Methods
    public function updateUsage()
    {
        $totalVolume = $this->woodInventories()->sum('volume');
        $this->update(['current_usage' => $totalVolume]);
        return $this;
    }

    public function canAccommodate($volume)
    {
        if (is_null($this->capacity_cubic_meters)) {
            return true; // Unlimited capacity
        }
        return ($this->current_usage + $volume) <= $this->capacity_cubic_meters;
    }
}
