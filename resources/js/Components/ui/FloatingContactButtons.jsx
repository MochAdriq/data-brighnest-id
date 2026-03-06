import { Mail, MessageCircle } from "lucide-react";

const CONTACT_INFO = {
    phone: "08133113110",
    whatsappNumber: "628133113110",
    email: "brightnestinstitute@gmail.com",
};

const whatsappMessage = encodeURIComponent(
    "Halo Brightnest Institute, saya ingin terhubung dengan customer service.",
);
const whatsappHref = `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${whatsappMessage}`;
const emailHref = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent("Customer Service Brightnest")}`;

export default function FloatingContactButtons() {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
            <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp Customer Service ${CONTACT_INFO.phone}`}
                title={`WhatsApp: ${CONTACT_INFO.phone}`}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
                <MessageCircle className="h-6 w-6" />
            </a>

            <a
                href={emailHref}
                aria-label={`Email Customer Service ${CONTACT_INFO.email}`}
                title={`Email: ${CONTACT_INFO.email}`}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
                <Mail className="h-6 w-6" />
            </a>
        </div>
    );
}
