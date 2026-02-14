import React from "react";
import { Link } from "@inertiajs/react";
import { Flame } from "lucide-react";

const MostPopularWidget = ({ articles = [] }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center space-x-2 mb-6">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="font-bold text-slate-900">Sedang Populer</h3>
            </div>
            <div className="space-y-6">
                {articles.length > 0 ? (
                    articles.map((post, index) => (
                        <Link
                            key={post.id}
                            // PERBAIKAN: Gunakan ID dan route 'surveys.show'
                            href={route("surveys.show", post.id)}
                            className="flex gap-4 group cursor-pointer"
                        >
                            <span className="text-3xl font-bold text-gray-200 group-hover:text-blue-600 transition-colors">
                                {index + 1}
                            </span>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                    {post.title}
                                </h4>
                                <span className="text-xs text-gray-400">
                                    {/* Mockup view count kalau di db null */}
                                    {post.views || 0} kali dibaca
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        Belum ada data populer.
                    </p>
                )}
            </div>
        </div>
    );
};

export default MostPopularWidget;
