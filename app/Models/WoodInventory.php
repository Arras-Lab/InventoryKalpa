<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class WoodInventory extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'wood_inventories';
    
    // Composite primary key
    protected $primaryKey = ['no_kontrak', 'no_kapling', 'skshh', 'urutan_pengiriman'];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'no_kontrak',
        'kontrak',
        'no_kapling',
        'jenis_kayu',
        'sort',
        'panjang',
        'diameter',
        'qty',
        'volume',
        'mutu',
        'status',
        'trs',
        'tgl_pembelian',
        'harga',
        'asal_tpk',
        'skshh',
        'delivery_dari_perhutani',
        'tanggal_sampai_bali',
        'urutan_pengiriman',
        'lokasi_saat_ini',
        'proses',
        'tgl_dibelah',
        'tgl_diambil_dari_tempat_belah',
        'rencana_alokasi',
        'kubik_price',
        'tahun_pembelian',
    ];

    protected $casts = [
        'tgl_pembelian' => 'date',
        'tanggal_sampai_bali' => 'date',
        'tgl_dibelah' => 'date',
        'tgl_diambil_dari_tempat_belah' => 'date',
        'delivery_dari_perhutani' => 'boolean',
        'panjang' => 'decimal:2',
        'diameter' => 'decimal:2',
        'volume' => 'decimal:4',
        'harga' => 'decimal:2',
        'kubik_price' => 'decimal:2',
        'qty' => 'integer',
        'urutan_pengiriman' => 'integer',
        'tahun_pembelian' => 'integer',
    ];

    // Override the getKeyName method for composite keys
    public function getKeyName()
    {
        return $this->primaryKey;
    }

    // Override setKeysForSaveQuery for composite keys
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    // Override getKeyForSaveQuery for composite keys
    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }

    // Activity log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'no_kontrak', 'kontrak', 'no_kapling', 'jenis_kayu', 'sort',
                'panjang', 'diameter', 'qty', 'volume', 'mutu', 'status',
                'trs', 'tgl_pembelian', 'harga', 'asal_tpk', 'skshh',
                'delivery_dari_perhutani', 'tanggal_sampai_bali', 'urutan_pengiriman',
                'lokasi_saat_ini', 'proses', 'tgl_dibelah', 'tgl_diambil_dari_tempat_belah',
                'rencana_alokasi', 'kubik_price', 'tahun_pembelian'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function storageLocation()
    {
        return $this->belongsTo(StorageLocation::class, 'lokasi_saat_ini', 'code');
    }

    // Scopes for filtering
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByJenisKayu($query, $jenisKayu)
    {
        return $query->where('jenis_kayu', 'like', "%{$jenisKayu}%");
    }

    public function scopeByLokasi($query, $lokasi)
    {
        return $query->where('lokasi_saat_ini', 'like', "%{$lokasi}%");
    }

    public function scopeByTahun($query, $tahun)
    {
        return $query->where('tahun_pembelian', $tahun);
    }

    public function scopeByProses($query, $proses)
    {
        return $query->where('proses', 'like', "%{$proses}%");
    }

    // Calculate total value
    public function getTotalValueAttribute()
    {
        return $this->volume * $this->kubik_price;
    }

    // Status constants
    const STATUS_READY = 'ready';
    const STATUS_IN_PROCESS = 'in-process';
    const STATUS_RUSAK = 'rusak';
    const STATUS_REJECT = 'reject';

    public static function getStatusOptions()
    {
        return [
            self::STATUS_READY => 'Ready',
            self::STATUS_IN_PROCESS => 'In Process',
            self::STATUS_RUSAK => 'Rusak',
            self::STATUS_REJECT => 'Reject',
        ];
    }
}
