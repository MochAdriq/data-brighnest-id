import React from "react";
import { Link } from "@inertiajs/react";
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* 1. BRANDING */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
                            Data Brightnest
                            <span className="text-blue-500">.</span>
                        </h2>
                        <p className="text-sm leading-relaxed mb-6">
                            Pusat intelijen data daerah yang menyajikan wawasan
                            strategis untuk pembangunan berkelanjutan.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* 2. MENU CEPAT */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            Jelajahi
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("kilas-data")}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Kilas Data
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("fokus-utama")}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Fokus Utama
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("kabar-tepi")}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Kabar Tepi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. KATEGORI */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            Topik Data
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/category/ekonomi"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Ekonomi Makro
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/infrastruktur"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Infrastruktur
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/sosial"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Sosial & Kesra
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/category/pemerintahan"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Pemerintahan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 4. KONTAK */}
                    <div>
                        <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
                            Hubungi Kami
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                <span>
                                    Jl. Surya Kencana No. 99, Sukabumi, Jawa
                                    Barat
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                <span>hello@brightnest.id</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                <span>(0266) 123-4567</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* COPYRIGHT */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>
                        &copy; {new Date().getFullYear()} Data Brightnest id.
                        All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-white">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
