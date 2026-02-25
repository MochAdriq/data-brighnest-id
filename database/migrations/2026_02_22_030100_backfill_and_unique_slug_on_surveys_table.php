<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('surveys') || !Schema::hasColumn('surveys', 'slug')) {
            return;
        }

        $used = [];
        $rows = DB::table('surveys')
            ->select(['id', 'title', 'slug'])
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            $base = Str::slug((string) ($row->slug ?: $row->title));
            if ($base === '') {
                $base = 'survey';
            }

            $candidate = $base;
            $suffix = 1;
            while (isset($used[$candidate])) {
                $candidate = "{$base}-{$suffix}";
                $suffix++;
            }

            $used[$candidate] = true;

            if ($row->slug !== $candidate) {
                DB::table('surveys')
                    ->where('id', $row->id)
                    ->update(['slug' => $candidate]);
            }
        }

        Schema::table('surveys', function (Blueprint $table) {
            $table->unique('slug', 'surveys_slug_unique_idx');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('surveys')) {
            return;
        }

        Schema::table('surveys', function (Blueprint $table) {
            $table->dropUnique('surveys_slug_unique_idx');
        });
    }
};
