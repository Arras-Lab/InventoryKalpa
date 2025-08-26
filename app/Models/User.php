<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_OPERATOR = 'operator';
    const ROLE_MANAJER = 'manajer';

    public static function getRoleOptions()
    {
        return [
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_OPERATOR => 'Operator',
            self::ROLE_MANAJER => 'Manajer',
        ];
    }

    // Check if user has admin role
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    // Check if user has manager role
    public function isManajer()
    {
        return $this->role === self::ROLE_MANAJER;
    }

    // Check if user has operator role
    public function isOperator()
    {
        return $this->role === self::ROLE_OPERATOR;
    }

    // Check if user is active
    public function isActive()
    {
        return $this->is_active;
    }
}
