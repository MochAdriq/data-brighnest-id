<?php

namespace App\Support;

use App\Models\Survey;
use App\Services\OpenGraphImageService;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

class OpenGraphMetaResolver
{
    public function __construct(
        private readonly OpenGraphImageService $imageService,
    ) {
    }

    public function resolve(Request $request): array
    {
        $appName = config('app.name', 'Brightnest Institute');
        $baseMeta = $this->defaultMeta($request, $appName);

        $routeName = $request->route()?->getName();
        if ($routeName !== 'surveys.show') {
            return $baseMeta;
        }

        $survey = $this->resolveSurveyFromRoute($request->route());
        if (!$survey) {
            return $baseMeta;
        }

        return array_merge($baseMeta, $this->surveyMeta($survey, $request, $appName));
    }

    private function defaultMeta(Request $request, string $appName): array
    {
        return [
            'title' => $appName . ' - Pusat Data Daerah',
            'description' => 'Telusuri data hasil survei, analisis hingga kajian strategis dalam satu platform terpadu untuk memahami dinamika ekonomi, masyarakat, dan kebijakan.',
            'url' => $request->fullUrl(),
            'type' => 'website',
            'image' => asset('images/og-templates/og-fallback-1200x630.png'),
            'image_alt' => $appName,
            'image_width' => 1200,
            'image_height' => 630,
            'site_name' => $appName,
            'locale' => 'id_ID',
            'robots' => 'index,follow,max-image-preview:large',
            'twitter_card' => 'summary_large_image',
        ];
    }

    private function surveyMeta(Survey $survey, Request $request, string $appName): array
    {
        $contentTypeLabel = $this->typeLabel($survey->type);
        $headline = trim((string) ($survey->title ?? ''));
        if ($headline === '') {
            $headline = $contentTypeLabel;
        }

        $isPremium = $survey->resolvedPremiumTier() !== Survey::PREMIUM_TIER_FREE;
        $description = $this->resolveDescription($survey, $isPremium);
        $imageUrl = $this->imageService->resolveImageUrl($survey);

        $meta = [
            'title' => $headline . ' | ' . $appName,
            'description' => $description,
            'url' => $request->fullUrl(),
            'type' => 'article',
            'image' => $imageUrl,
            'image_alt' => $headline,
            'image_width' => 1200,
            'image_height' => 630,
            'site_name' => $appName,
            'locale' => 'id_ID',
            'robots' => 'index,follow,max-image-preview:large',
            'twitter_card' => 'summary_large_image',
            'article_section' => $contentTypeLabel,
            'article_published_time' => $survey->created_at?->toIso8601String(),
            'article_modified_time' => $survey->updated_at?->toIso8601String(),
            'article_tags' => $this->normalizeTags($survey->tags),
        ];

        if ($isPremium) {
            $meta['article:premium'] = 'true';
        }

        return $meta;
    }

    private function resolveDescription(Survey $survey, bool $isPremium): string
    {
        $lead = trim((string) ($survey->lead ?? ''));
        $notes = trim((string) ($survey->notes ?? ''));
        $firstParagraph = $this->extractFirstParagraph((string) ($survey->content ?? ''));

        $description = $lead;
        if ($description === '' && $survey->type === 'series') {
            $description = $notes;
        }
        if ($description === '') {
            $description = $lead !== '' ? $lead : $firstParagraph;
        }
        if ($description === '') {
            $description = $notes;
        }
        if ($description === '') {
            $description = 'Konten terbaru Brightnest Institute tersedia untuk dibaca dan dibagikan.';
        }

        if (!$isPremium) {
            return $description;
        }

        return 'Teaser premium: ' . $description;
    }

    private function extractFirstParagraph(string $html): string
    {
        $trimmed = trim($html);
        if ($trimmed === '') {
            return '';
        }

        if (preg_match('/<p\b[^>]*>(.*?)<\/p>/is', $trimmed, $matches) === 1) {
            return trim(strip_tags((string) ($matches[1] ?? '')));
        }

        return trim(strip_tags($trimmed));
    }

    private function normalizeTags(mixed $tags): array
    {
        if (!is_array($tags)) {
            return [];
        }

        return collect($tags)
            ->filter(fn ($tag) => is_string($tag) && trim($tag) !== '')
            ->map(fn (string $tag) => trim($tag))
            ->values()
            ->all();
    }

    private function typeLabel(?string $type): string
    {
        return match ($type) {
            'series' => 'Kilas Data',
            'story' => 'Fokus Utama',
            'news' => 'Berita',
            'publikasi_riset' => 'Publikasi Riset',
            default => 'Artikel',
        };
    }

    private function resolveSurveyFromRoute(?Route $route): ?Survey
    {
        if (!$route) {
            return null;
        }

        $parameter = $route->parameter('survey');
        if ($parameter instanceof Survey) {
            return $parameter;
        }

        if (!is_string($parameter) || trim($parameter) === '') {
            return null;
        }

        return Survey::query()
            ->where('slug', trim($parameter))
            ->first();
    }
}
