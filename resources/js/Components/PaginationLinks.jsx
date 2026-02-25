import { Link } from "@inertiajs/react";

export default function PaginationLinks({ links = [] }) {
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-wrap justify-end gap-2">
            {links.map((link, index) => (
                <Link
                    key={`${link.url ?? "null"}-${index}`}
                    href={link.url || "#"}
                    preserveScroll
                    className={`px-3 py-2 text-sm rounded-lg border transition ${
                        link.active
                            ? "bg-slate-900 text-white border-slate-900"
                            : link.url
                              ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              : "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
