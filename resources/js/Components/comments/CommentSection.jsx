import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import { MessageCircle, Send } from "lucide-react";

export default function CommentSection({ article, comments = [] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        body: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("surveys.comments.store", article.slug || article.id), {
            preserveScroll: true,
            onSuccess: () => reset("body"),
        });
    };

    return (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">
                    Komentar ({comments.length})
                </h3>
            </div>

            {auth?.user ? (
                <form onSubmit={submit} className="mb-8 space-y-3">
                    <textarea
                        rows="4"
                        value={data.body}
                        onChange={(e) => setData("body", e.target.value)}
                        className="w-full rounded-xl border-slate-300 focus:ring-blue-500"
                        placeholder="Tulis komentar Anda..."
                    />
                    {errors.body && (
                        <p className="text-xs text-red-600">{errors.body}</p>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Send className="w-4 h-4" />
                        {processing ? "Mengirim..." : "Kirim Komentar"}
                    </button>
                </form>
            ) : (
                <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Login terlebih dahulu untuk mengirim komentar.
                </div>
            )}

            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <article
                            key={comment.id}
                            className="rounded-xl border border-slate-100 p-4 bg-slate-50/70"
                        >
                            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">
                                    {comment.user?.name || "Pengguna"}
                                </span>
                                <span>
                                    {new Date(comment.created_at).toLocaleString(
                                        "id-ID",
                                    )}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {comment.body}
                            </p>
                        </article>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">
                        Belum ada komentar. Jadilah yang pertama berkomentar.
                    </p>
                )}
            </div>
        </section>
    );
}
