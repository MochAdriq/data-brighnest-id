Brightnest Hero Assets
======================

Folder ini dipakai untuk aset visual HERO homepage.

File yang dibaca komponen HERO saat ini:
1) /images/hero-background.webp
   - Gambar utama background HERO (gunakan gambar referensi Anda di sini).
   - Rekomendasi ukuran: 1920x1080 (landscape).
   - Format saat ini: WEBP.

2) /images/hero/hero-fallback.svg
   - Fallback jika hero-background.webp tidak ada.
   - Sudah disediakan default.

Cara pakai cepat:
1) Simpan gambar Anda sebagai:
   public/images/hero-background.webp
2) Hard refresh browser (Ctrl+F5).

Opsional:
- Jika Anda ingin pakai nama file lain, ubah constant `heroBackgroundImage`
  di file:
  resources/js/Components/sections/Hero.jsx
