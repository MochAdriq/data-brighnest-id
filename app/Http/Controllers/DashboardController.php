<?php

namespace App\Http\Controllers;

use App\Models\ArticlePurchaseRequest;
use App\Models\Subscription;
use App\Models\Survey;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $this->resolveSurveyFilters($request);

        if ($user->hasRole('super_admin')) {
            return $this->superAdminDashboard($user, $filters);
        }

        if ($user->hasRole('publisher')) {
            return $this->publisherDashboard($user, $filters);
        }

        if ($user->hasRole('editor')) {
            return $this->editorDashboard($filters);
        }

        return redirect()->route('home');
    }

    private function superAdminDashboard($user, array $filters)
    {
        $surveyQuery = Survey::query();
        $this->applySurveyFilters($surveyQuery, $filters);

        $surveys = $surveyQuery
            ->orderBy('created_at', $filters['sort'])
            ->paginate(10)
            ->withQueryString();
        $pendingSubscriptions = Subscription::with('user:id,name,email')
            ->where('status', 'pending')
            ->latest()
            ->take(6)
            ->get();
        $pendingArticleRequests = ArticlePurchaseRequest::with(['user:id,name,email', 'survey:id,title,slug,type'])
            ->where('status', 'pending')
            ->latest()
            ->take(6)
            ->get();

        $pendingSubscriptionCount = Subscription::where('status', 'pending')->count();
        $pendingArticleCount = ArticlePurchaseRequest::where('status', 'pending')->count();
        $pendingTotal = $pendingSubscriptionCount + $pendingArticleCount;
        $latestUserSubscription = $user->subscriptions()->latest()->first();
        $activeUserSubscription = $user->subscriptions()
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->latest('ends_at')
            ->first();

        return Inertia::render('Dashboard', [
            'surveys' => $surveys,
            'filters' => $filters,
            'filterOptions' => [
                'types' => ['series', 'story', 'news', 'publikasi_riset'],
                'categories' => Survey::query()
                    ->select('category')
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->orderBy('category')
                    ->pluck('category')
                    ->values(),
            ],
            'latestUserSubscription' => $latestUserSubscription,
            'activeUserSubscription' => $activeUserSubscription,
            'pendingSubscriptions' => $pendingSubscriptions,
            'pendingSubscriptionsCount' => $pendingSubscriptionCount,
            'pendingArticleRequests' => $pendingArticleRequests,
            'pendingArticleRequestsCount' => $pendingArticleCount,
            'pendingPremiumVerificationsCount' => $pendingTotal,
        ]);
    }

    private function publisherDashboard($user, array $filters)
    {
        $surveyQuery = Survey::where('user_id', $user->id);
        $this->applySurveyFilters($surveyQuery, $filters);

        $surveys = $surveyQuery
            ->orderBy('created_at', $filters['sort'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Publisher/Dashboard', [
            'surveys' => $surveys,
            'filters' => $filters,
            'filterOptions' => [
                'types' => ['series', 'story', 'news', 'publikasi_riset'],
                'categories' => Survey::query()
                    ->select('category')
                    ->where('user_id', $user->id)
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->orderBy('category')
                    ->pluck('category')
                    ->values(),
            ],
        ]);
    }

    private function editorDashboard(array $filters)
    {
        $storiesQuery = Survey::whereIn('type', ['story', 'news']);
        $this->applySurveyFilters($storiesQuery, $filters, ['story', 'news']);

        $recentStories = $storiesQuery
            ->orderBy('created_at', $filters['sort'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Editor/Dashboard', [
            'recentStories' => $recentStories,
            'filters' => $filters,
            'filterOptions' => [
                'types' => ['story', 'news'],
                'categories' => Survey::query()
                    ->select('category')
                    ->whereIn('type', ['story', 'news'])
                    ->whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->orderBy('category')
                    ->pluck('category')
                    ->values(),
            ],
        ]);
    }

    private function resolveSurveyFilters(Request $request): array
    {
        $sort = strtolower((string) $request->query('sort', 'desc'));
        $type = strtolower((string) $request->query('type', ''));
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));

        return [
            'q' => $q,
            'type' => in_array($type, ['series', 'story', 'news', 'publikasi_riset'], true) ? $type : '',
            'category' => $category,
            'sort' => in_array($sort, ['asc', 'desc'], true) ? $sort : 'desc',
        ];
    }

    private function applySurveyFilters(Builder $query, array $filters, array $allowedTypes = ['series', 'story', 'news', 'publikasi_riset']): void
    {
        if (!empty($filters['q'])) {
            $keyword = $filters['q'];
            $query->where(function (Builder $sub) use ($keyword) {
                $sub->where('title', 'like', "%{$keyword}%")
                    ->orWhere('lead', 'like', "%{$keyword}%")
                    ->orWhere('notes', 'like', "%{$keyword}%")
                    ->orWhere('category', 'like', "%{$keyword}%");
            });
        }

        if (!empty($filters['type']) && in_array($filters['type'], $allowedTypes, true)) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
    }
}
