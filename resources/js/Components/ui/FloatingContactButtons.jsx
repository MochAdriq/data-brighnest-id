import { Mail } from "lucide-react";

const CONTACT_INFO = {
    phone: "08133113110",
    whatsappNumber: "628133113110",
    email: "brightnestinstitute@gmail.com",
};

const whatsappMessage = encodeURIComponent(
    "Halo Brightnest Institute, saya ingin terhubung dengan customer service.",
);
const whatsappHref = `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${whatsappMessage}`;
const emailHref = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent("Customer Service Brightnest Institute")}`;

function WhatsAppIcon(props) {
    return (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M13.601 2.326A7.854 7.854 0 0 0 8 0C3.582 0 0 3.582 0 8a7.9 7.9 0 0 0 1.172 4.204L0 16l3.899-1.13A7.94 7.94 0 0 0 8 16c4.418 0 8-3.582 8-8 0-2.136-.832-4.146-2.399-5.674zM8 14.5a6.47 6.47 0 0 1-3.301-.904l-.236-.141-2.313.67.672-2.255-.154-.232A6.48 6.48 0 0 1 1.5 8C1.5 4.416 4.416 1.5 8 1.5c1.729 0 3.352.673 4.571 1.897A6.456 6.456 0 0 1 14.5 8c0 3.584-2.916 6.5-6.5 6.5zm3.426-4.145c-.187-.094-1.11-.547-1.282-.61-.172-.062-.297-.094-.422.094-.125.187-.484.61-.594.734-.109.125-.219.14-.406.047-.187-.094-.79-.291-1.504-.927-.556-.496-.931-1.11-1.04-1.297-.109-.187-.012-.288.082-.382.084-.083.187-.219.281-.328.094-.109.125-.187.187-.312.063-.125.031-.234-.015-.328-.047-.094-.422-1.016-.578-1.391-.152-.365-.307-.315-.422-.321-.109-.005-.234-.007-.359-.007a.69.69 0 0 0-.5.234c-.172.187-.656.64-.656 1.562 0 .922.672 1.813.765 1.938.094.125 1.322 2.02 3.203 2.833.447.193.795.308 1.067.394.448.142.856.122 1.179.074.36-.054 1.11-.453 1.265-.89.156-.437.156-.812.109-.89-.047-.078-.172-.125-.359-.219z" />
        </svg>
    );
}

export default function FloatingContactButtons() {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
            <div className="group flex items-center justify-end gap-2">
                <span className="pointer-events-none translate-x-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100">
                    WhatsApp: {CONTACT_INFO.phone}
                </span>
                <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp Customer Service ${CONTACT_INFO.phone}`}
                    title={`WhatsApp: ${CONTACT_INFO.phone}`}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                >
                    <WhatsAppIcon className="h-6 w-6" />
                </a>
            </div>

            <div className="group flex items-center justify-end gap-2">
                <span className="pointer-events-none translate-x-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100">
                    Email: {CONTACT_INFO.email}
                </span>
                <a
                    href={emailHref}
                    aria-label={`Email Customer Service ${CONTACT_INFO.email}`}
                    title={`Email: ${CONTACT_INFO.email}`}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                    <Mail className="h-6 w-6" />
                </a>
            </div>
        </div>
    );
}
