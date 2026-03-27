<?php

namespace App\Services;

use App\Models\Survey;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OpenGraphImageService
{
    private const WIDTH = 1200;
    private const HEIGHT = 630;
    private const MIN_SOURCE_WIDTH = 1200;
    private const OUTPUT_QUALITY = 78;
    private const OUTPUT_DIRECTORY = 'og/surveys';

    public function ensureForSurvey(Survey $survey, bool $force = false): ?string
    {
        $existingPath = (string) ($survey->og_image_path ?? '');
        if (!$force && $this->pathExistsOnPublicDisk($existingPath)) {
            return $existingPath;
        }

        $newPath = $this->generateForSurvey($survey);
        if (!$newPath) {
            return $this->pathExistsOnPublicDisk($existingPath) ? $existingPath : null;
        }

        if ($existingPath !== '' && $existingPath !== $newPath) {
            $this->deleteFromPublicDisk($existingPath);
        }

        if ($survey->og_image_path !== $newPath || empty($survey->og_generated_at)) {
            $survey->forceFill([
                'og_image_path' => $newPath,
                'og_generated_at' => now(),
            ])->saveQuietly();
        }

        return $newPath;
    }

    public function hasValidOgImage(Survey $survey): bool
    {
        return $this->pathExistsOnPublicDisk((string) ($survey->og_image_path ?? ''));
    }

    public function resolveImageUrl(Survey $survey): string
    {
        $path = $this->ensureForSurvey($survey);

        if (!$path) {
            return $this->fallbackTemplateUrl($survey);
        }

        return $this->publicUrlFromPath($path);
    }

    public function deleteForSurvey(Survey $survey): void
    {
        $path = (string) ($survey->og_image_path ?? '');
        if ($path === '') {
            return;
        }

        $this->deleteFromPublicDisk($path);
    }

    public function fallbackTemplateUrl(Survey $survey): string
    {
        return asset($this->fallbackTemplateRelativePath($survey));
    }

    public function publicUrlFromPath(string $path): string
    {
        $url = Storage::disk('public')->url($path);

        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        return url($url);
    }

    private function generateForSurvey(Survey $survey): ?string
    {
        $fallbackPath = $this->fallbackTemplateAbsolutePath($survey);

        if (!function_exists('imagecreatetruecolor')) {
            return $this->storeTemplateOnly($survey, $fallbackPath);
        }

        $canvas = imagecreatetruecolor(self::WIDTH, self::HEIGHT);
        if (!$canvas) {
            return $this->storeTemplateOnly($survey, $fallbackPath);
        }

        $fill = imagecolorallocate($canvas, 7, 18, 40);
        imagefilledrectangle($canvas, 0, 0, self::WIDTH, self::HEIGHT, $fill);
        imagealphablending($canvas, true);
        imagesavealpha($canvas, true);

        $sourcePath = $this->resolveValidSourceImagePath($survey);
        $basePath = $sourcePath ?: $fallbackPath;

        $baseImage = $this->createImageResourceFromPath($basePath);
        if ($baseImage) {
            $this->copyAsCover($canvas, $baseImage);
            imagedestroy($baseImage);
        }

        // Overlay gelap agar preview konsisten dan watermark tetap terbaca.
        $this->applyDarkOverlay($canvas, $sourcePath ? 68 : 52);
        $this->overlayWatermark($canvas);

        if ($survey->resolvedPremiumTier() !== Survey::PREMIUM_TIER_FREE) {
            $this->overlayPremiumBadge($canvas);
        }

        $binary = $this->renderAsJpegBinary($canvas);
        imagedestroy($canvas);

        if ($binary === null) {
            return $this->storeTemplateOnly($survey, $fallbackPath);
        }

        $outputPath = $this->outputPathForSurvey($survey, 'jpg');
        if (!$this->putToPublicDisk($outputPath, $binary)) {
            return null;
        }

        return $outputPath;
    }

    private function resolveValidSourceImagePath(Survey $survey): ?string
    {
        $imagePath = trim((string) ($survey->image ?? ''));
        if ($imagePath === '') {
            return null;
        }

        $normalized = ltrim($imagePath, '/');
        $candidates = [
            public_path('storage/' . $normalized),
            storage_path('app/public/' . $normalized),
        ];

        try {
            $candidates[] = Storage::disk('public')->path($normalized);
        } catch (\Throwable) {
            // Abaikan candidate path dari disk jika environment tidak mendukung.
        }

        $checked = [];
        foreach ($candidates as $candidate) {
            if (!is_string($candidate) || $candidate === '' || isset($checked[$candidate])) {
                continue;
            }
            $checked[$candidate] = true;

            if (!is_file($candidate)) {
                continue;
            }

            $size = @getimagesize($candidate);
            if (!$size || !isset($size[0], $size[1])) {
                continue;
            }

            // Upload terlalu kecil fallback ke template OG agar preview tetap rapi.
            if ((int) $size[0] < self::MIN_SOURCE_WIDTH || (int) $size[1] <= 0) {
                continue;
            }

            return $candidate;
        }

        return null;
    }

    private function copyAsCover(\GdImage $canvas, \GdImage $source): void
    {
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            return;
        }

        $scale = max(self::WIDTH / $sourceWidth, self::HEIGHT / $sourceHeight);
        $targetWidth = (int) round($sourceWidth * $scale);
        $targetHeight = (int) round($sourceHeight * $scale);
        $targetX = (int) floor((self::WIDTH - $targetWidth) / 2);
        $targetY = (int) floor((self::HEIGHT - $targetHeight) / 2);

        imagecopyresampled(
            $canvas,
            $source,
            $targetX,
            $targetY,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $sourceWidth,
            $sourceHeight,
        );
    }

    private function applyDarkOverlay(\GdImage $canvas, int $alpha): void
    {
        $safeAlpha = max(0, min(127, $alpha));
        $overlay = imagecolorallocatealpha($canvas, 5, 14, 34, $safeAlpha);
        imagefilledrectangle($canvas, 0, 0, self::WIDTH, self::HEIGHT, $overlay);
    }

    private function overlayWatermark(\GdImage $canvas): void
    {
        $watermarkPath = public_path('images/og-templates/watermark-light.png');
        $watermark = $this->createImageResourceFromPath($watermarkPath);
        if (!$watermark) {
            return;
        }

        $sourceWidth = imagesx($watermark);
        $sourceHeight = imagesy($watermark);
        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            imagedestroy($watermark);
            return;
        }

        $targetWidth = 260;
        $targetHeight = (int) round(($sourceHeight / $sourceWidth) * $targetWidth);
        $targetX = self::WIDTH - $targetWidth - 36;
        $targetY = self::HEIGHT - $targetHeight - 28;

        imagecopyresampled(
            $canvas,
            $watermark,
            $targetX,
            $targetY,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $sourceWidth,
            $sourceHeight,
        );

        imagedestroy($watermark);
    }

    private function overlayPremiumBadge(\GdImage $canvas): void
    {
        $badgePath = public_path('images/og-templates/badge-premium.png');
        $badge = $this->createImageResourceFromPath($badgePath);
        if (!$badge) {
            return;
        }

        $sourceWidth = imagesx($badge);
        $sourceHeight = imagesy($badge);
        if ($sourceWidth <= 0 || $sourceHeight <= 0) {
            imagedestroy($badge);
            return;
        }

        $targetWidth = 230;
        $targetHeight = (int) round(($sourceHeight / $sourceWidth) * $targetWidth);
        $targetX = 28;
        $targetY = 24;

        imagecopyresampled(
            $canvas,
            $badge,
            $targetX,
            $targetY,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $sourceWidth,
            $sourceHeight,
        );

        imagedestroy($badge);
    }

    private function renderAsJpegBinary(\GdImage $canvas): ?string
    {
        ob_start();
        $result = imagejpeg($canvas, null, self::OUTPUT_QUALITY);
        $binary = ob_get_clean();

        if (!$result || !is_string($binary) || $binary === '') {
            return null;
        }

        return $binary;
    }

    private function storeTemplateOnly(Survey $survey, ?string $templatePath): ?string
    {
        if (!$templatePath || !is_file($templatePath)) {
            return null;
        }

        $binary = @file_get_contents($templatePath);
        if (!is_string($binary) || $binary === '') {
            return null;
        }

        $extension = strtolower(pathinfo($templatePath, PATHINFO_EXTENSION));
        if ($extension === '') {
            $extension = 'png';
        }

        $outputPath = $this->outputPathForSurvey($survey, $extension);

        if (!$this->putToPublicDisk($outputPath, $binary)) {
            return null;
        }

        return $outputPath;
    }

    private function outputPathForSurvey(Survey $survey, string $extension): string
    {
        $seed = implode('|', [
            (string) $survey->id,
            (string) $survey->slug,
            (string) $survey->type,
            (string) $survey->image,
            (string) $survey->premium_tier,
            (string) ($survey->updated_at?->timestamp ?? now()->timestamp),
        ]);

        $hash = substr(hash('sha256', $seed), 0, 12);
        $safeExtension = strtolower(trim($extension)) ?: 'jpg';

        return self::OUTPUT_DIRECTORY . '/' . $survey->id . '-' . $hash . '.' . $safeExtension;
    }

    private function fallbackTemplateRelativePath(Survey $survey): string
    {
        return $survey->type === 'series'
            ? 'images/og-templates/og-series-1200x630.png'
            : 'images/og-templates/og-fallback-1200x630.png';
    }

    private function fallbackTemplateAbsolutePath(Survey $survey): string
    {
        return public_path($this->fallbackTemplateRelativePath($survey));
    }

    private function createImageResourceFromPath(?string $path): ?\GdImage
    {
        if (!$path || !is_file($path)) {
            return null;
        }

        $imageInfo = @getimagesize($path);
        $type = (int) ($imageInfo[2] ?? 0);

        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path) ?: null,
            IMAGETYPE_PNG => @imagecreatefrompng($path) ?: null,
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp')
                ? (@imagecreatefromwebp($path) ?: null)
                : null,
            IMAGETYPE_GIF => @imagecreatefromgif($path) ?: null,
            default => null,
        };
    }

    private function putToPublicDisk(string $path, string $binary): bool
    {
        try {
            Storage::disk('public')->put($path, $binary, ['visibility' => 'public']);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function pathExistsOnPublicDisk(string $path): bool
    {
        if ($path === '') {
            return false;
        }

        try {
            return Storage::disk('public')->exists($path);
        } catch (\Throwable) {
            return false;
        }
    }

    private function deleteFromPublicDisk(string $path): void
    {
        if ($path === '') {
            return;
        }

        try {
            Storage::disk('public')->delete($path);
        } catch (\Throwable) {
            // Abaikan error pembersihan file lama.
        }
    }
}
