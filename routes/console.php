<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use App\Models\Survey;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('media:prune-unused {--days=7}', function () {
    $days = max(1, (int) $this->option('days'));
    $cutoff = now()->subDays($days)->getTimestamp();
    $disk = Storage::disk('public');
    $files = $disk->files('media');

    $checked = 0;
    $deleted = 0;

    foreach ($files as $path) {
        $checked++;

        if ($disk->lastModified($path) > $cutoff) {
            continue;
        }

        $isReferenced = Survey::query()
            ->whereNotNull('content')
            ->where('content', 'like', "%/storage/{$path}%")
            ->exists();

        if (!$isReferenced) {
            $disk->delete($path);
            $deleted++;
        }
    }

    $this->info("Selesai prune media. Dicek: {$checked}, dihapus: {$deleted}, ambang: {$days} hari.");
})->purpose('Prune editor media files that are no longer referenced in surveys');
