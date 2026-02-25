import React from "react";
import { MessageCircleHeart } from "lucide-react";

export default function CommentWidget({ widget }) {
    if (!widget) return null;

    return (
        <aside className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(59,130,246,0.12),transparent_50%)]" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircleHeart className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Widget Komentar</h4>
                </div>

                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs uppercase tracking-wider text-blue-600 mb-1">
                        Total Komentar
                    </p>
                    <p className="text-2xl font-extrabold text-blue-800">
                        {widget.total_comments || 0}
                    </p>
                </div>

                <div className="space-y-3">
                    {(widget.latest_comments || []).length > 0 ? (
                        widget.latest_comments.map((item, idx) => (
                            <div
                                key={`${item.user_name}-${idx}`}
                                className="rounded-lg border border-slate-100 p-3 bg-slate-50/70"
                            >
                                <p className="text-xs text-slate-500 mb-1">
                                    {item.user_name} - {new Date(item.created_at).toLocaleDateString("id-ID")}
                                </p>
                                <p className="text-sm text-slate-700">
                                    {item.preview}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500">
                            Belum ada komentar terbaru.
                        </p>
                    )}
                </div>
            </div>
        </aside>
    );
}
