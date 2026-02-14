import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography"; // <--- 1. TAMBAHKAN IMPORT INI

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
            // Warna Custom Boss tetap aman di sini
            colors: {
                primary: "#1d1f9a",
                secondary: "#F59E0B",
            },
        },
    },

    plugins: [forms, typography],
};
