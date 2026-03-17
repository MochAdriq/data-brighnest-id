import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import ArticleViewer from "@/Components/ArticleViewer";
import CommentSection from "@/Components/comments/CommentSection";
import CommentWidget from "@/Components/comments/CommentWidget";
import DetailListWidget from "@/Components/widgets/DetailListWidget";
import VerticalAdSlot from "@/Components/widgets/VerticalAdSlot";

export default function Show({
    article,
    chartData,
    premiumPricing,
    comments = [],
    commentWidget = null,
    detailWidgets = null,
}) {
    const isEditorialArticle =
        article.type === "story" || article.type === "news";
    const isResearchPublication = article.type === "publikasi_riset";

    const typeLabel = {
        series: { label: "Kilas Data", url: route("kilas-data") },
        story: { label: "Fokus Utama", url: route("fokus-utama") },
    news: { label: "Berita", url: route("berita") },
        publikasi_riset: {
            label: "Publikasi Riset",
            url: route("surveys.index", { type: "publikasi_riset" }),
        },
    };

    const currentParent =
        article.type && typeLabel[article.type]
            ? typeLabel[article.type]
            : { label: "Detail Data", url: "#" };

    const [widgetsLoading, setWidgetsLoading] = useState(
        isEditorialArticle && !detailWidgets,
    );

    useEffect(() => {
        if (!isEditorialArticle) {
            setWidgetsLoading(false);
            return;
        }

        if (detailWidgets) {
            setWidgetsLoading(false);
        }
    }, [isEditorialArticle, detailWidgets]);

    useEffect(() => {
        if (!isEditorialArticle) {
            return undefined;
        }

        const removeStart = router.on("start", () => {
            setWidgetsLoading(true);
        });

        const removeFinish = router.on("finish", () => {
            setWidgetsLoading(false);
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, [isEditorialArticle]);

    const widgetData = {
        hot_combined: detailWidgets?.hot_combined || [],
        latest: detailWidgets?.latest || [],
        window_days: detailWidgets?.window_days || 7,
        cache_ttl_minutes: detailWidgets?.cache_ttl_minutes || 5,
    };

    return (
        <PublicLayout
            pageLabel={article.title}
            parentPage={currentParent}
        >
            <Head title={article.title} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {article.type === "series" ? (
                    <ArticleViewer
                        article={article}
                        chartData={chartData}
                        premiumPricing={premiumPricing}
                    />
                ) : isEditorialArticle ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[160px_minmax(0,1fr)_320px] gap-4 sm:gap-6 items-start">
                        <aside className="hidden xl:block xl:sticky xl:top-24">
                            <VerticalAdSlot
                                title="Iklan Samping"
                                size="160x600"
                                ctaHref={route("premium.purchase", {
                                    survey: article.slug,
                                })}
                            />
                        </aside>

                        <div className="min-w-0 space-y-6">
                            <ArticleViewer
                                article={article}
                                chartData={chartData}
                                premiumPricing={premiumPricing}
                            />

                            <div className="xl:hidden">
                                <VerticalAdSlot
                                    title="Iklan Inline"
                                    size="320x100"
                                    slotHeightClass="h-24"
                                    ctaHref={route("premium.purchase", {
                                        survey: article.slug,
                                    })}
                                />
                            </div>

                            <CommentSection
                                article={article}
                                comments={comments}
                            />
                        </div>

                        <aside className="space-y-4">
                            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.12),transparent_50%)]" />
                                <div className="relative z-10">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                                        Widget Insight
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Hot topic dan konten terbaru
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Data widget diperbarui tiap{" "}
                                        {widgetData.cache_ttl_minutes} menit.
                                    </p>
                                </div>
                            </section>

                            <DetailListWidget
                                title={`Sedang Populer (${widgetData.window_days} hari)`}
                                items={widgetData.hot_combined}
                                emptyText="Belum ada konten hot."
                                tone="amber"
                                loading={widgetsLoading}
                            />
                            <DetailListWidget
                                title="Terbaru"
                                items={widgetData.latest}
                                emptyText="Belum ada konten terbaru."
                                tone="emerald"
                                loading={widgetsLoading}
                            />
                            <CommentWidget widget={commentWidget} />
                        </aside>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <ArticleViewer
                            article={article}
                            chartData={chartData}
                            premiumPricing={premiumPricing}
                        />
                        {isResearchPublication && (
                            <CommentSection
                                article={article}
                                comments={comments}
                            />
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
