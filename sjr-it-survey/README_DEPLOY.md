# IT Voice SJR — Panduan Instalasi & Deploy ke Netlify

Website survei kepuasan layanan IT PT Sumbawa Jutaraya (SJR) dengan formulir karyawan, dashboard admin, serta **database PostgreSQL bawaan Netlify**. Tidak memakai PHP, MySQL, Supabase, atau server terpisah.

## Fitur

- Form survei 4 tahap yang responsif di smartphone/laptop.
- 16 indikator layanan dibagi menjadi 5 aspek; skala 1–5 atau N/A.
- Penilaian CSAT keseluruhan dan dukungan IT terhadap pekerjaan.
- Nama responden opsional (bisa anonim); departemen dan lokasi kerja.
- Kritik, kendala, saran, dan pilihan prioritas improvement.
- Backend Netlify Functions dan tabel PostgreSQL dengan migration otomatis.
- Dashboard admin berpassword; CSAT, rata-rata, distribusi, tren bulanan, skor per aspek, per pertanyaan, dan prioritas perbaikan.
- Filter departemen, lokasi, dan bulan; ekspor CSV yang kompatibel dengan Excel.

## 1. Deploy (disarankan melalui GitHub)

1. Ekstrak file ZIP. Pastikan folder `sjr-it-survey` berisi `package.json`, `netlify.toml`, `public/`, dan `netlify/`.
2. Buat repository baru di https://github.com/new dan upload **isi** folder proyek ke root repository (jangan hanya `public`).
3. Masuk ke https://app.netlify.com/start, pilih **Import an existing project → GitHub**, lalu pilih repository.
4. Konfigurasi build biasanya otomatis dari `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
   - Node.js: 22
5. Pilih Deploy. Netlify memasang dependency `@netlify/database`, menyiapkan PostgreSQL, lalu menerapkan migration SQL pada `netlify/database/migrations/` saat penerbitan deploy.
6. Di dashboard Netlify, masuk **Data & Storage → Database** untuk memastikan database terbentuk dan tabel `it_sjr_responses` tersedia.

> Alternatif cepat: ketika **sudah login** ke Netlify, coba seret folder proyek hasil ekstrak ke https://app.netlify.com/drop. Netlify Drop yang login mendukung build dari source. Jika Functions/Database tidak terdeteksi atau migrasi tidak dijalankan, gunakan metode GitHub di atas untuk deployment lengkap.

## 2. Konfigurasi sandi dashboard admin (WAJIB)

Masuk ke Netlify → pilih project → **Project configuration → Environment variables**. Tambahkan dua variabel berikut:

| Nama | Nilai |
|---|---|
| `ADMIN_PASSWORD` | Kata sandi admin pilihan Anda, minimal 12 karakter, sebaiknya >16 karakter unik |
| `ADMIN_SESSION_SECRET` | String acak minimal 32 karakter, disarankan 64 karakter heksadesimal |

Buat secret yang aman dengan Node.js (di CMD / PowerShell):

```shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Jangan taruh nilai sandi atau secret di file JavaScript / repository / ZIP. Setelah menyimpan environment variables, lakukan **Trigger deploy → Deploy site** agar Functions memuat konfigurasi baru. Jangan membagikan kata sandi admin.

## 3. Link akses

Setelah deploy, Netlify memberikan domain asli seperti `https://NAMA-SITE.netlify.app`.

- Link responden: `https://NAMA-SITE.netlify.app/`
- Link pengelola: `https://NAMA-SITE.netlify.app/admin.html`

`NAMA-SITE` hanya contoh; ganti dengan domain yang benar dari dashboard Netlify. Domain bisa Anda ubah lewat **Domain management → Options → Edit site name**.

## 4. Penggunaan

1. Bagikan link responden atau jadikan QR code kepada karyawan melalui grup kerja.
2. Karyawan mengisi profil kerja, 16 pertanyaan, penilaian keseluruhan, dan masukan lalu menekan **Kirim Penilaian**.
3. Setiap jawaban disimpan ke tabel PostgreSQL `it_sjr_responses`.
4. IT masuk ke `/admin.html`, login dan lihat data.
5. Atur filter departemen/lokasi/bulan, kemudian tekan **Export CSV**. CSV terbuka di Excel. File menggunakan UTF-8 BOM dan sudah mengurangi risiko formula injection.

## 5. Perhitungan

- **CSAT (%)** = `(jumlah responden yang memberi nilai keseluruhan 4 atau 5 / total responden yang valid) × 100%`.
- **Rata-rata keseluruhan** = `(jumlah nilai keseluruhan / total responden)` skala 1–5.
- **Skor per aspek / per pertanyaan** = rata-rata nilai 1–5 **dengan N/A dikeluarkan**.
- **Tren bulanan** = persentase CSAT setiap bulan, berdasarkan waktu WITA (Asia/Makassar).
- Filter pada dashboard diterapkan oleh server, bukan hanya tampilan frontend.
- Dashboard maksimal memuat 3.000 jawaban terbaru sesuai filter untuk menjaga kinerja. Tabel di layar menampilkan 60 baris pertama; ekspor CSV memuat semua jawaban yang dimuat (maksimal 3.000).

## 6. Keamanan & privasi

- Form tidak memerlukan NRP, nomor telepon, atau email.
- Nama bersifat sukarela. Data disimpan di database Netlify milik project.
- Endpoint admin memerlukan cookie sesi yang ditandatangani HMAC, HTTP-only, Secure, dan memiliki masa aktif 8 jam.
- SQL menggunakan parameter (bukan interpolasi mentah) untuk mengurangi SQL injection.
- Kolom komentar ditampilkan dengan HTML escaping, ekspor CSV menggunakan perlindungan dasar formula injection.
- Server menyediakan pemeriksaan payload dan honeypot anti-bot dasar; untuk survei skala besar, konfigurasi perlindungan spam/rate limit di Netlify Firewall disarankan.
- Lakukan audit izin akses Netlify dan backup data berkala sebelum membagikan survei perusahaan.

## 7. Troubleshooting

**Form tampil, tetapi tombol Kirim gagal**
- Pastikan deploy dari folder proyek lengkap, bukan hanya folder `public`.
- Pastikan daftar Functions berisi `submit` dan `admin` serta migration selesai.
- Periksa **Deploy logs** dan **Functions logs** di Netlify.

**Dashboard admin mengatakan belum dikonfigurasi**
- `ADMIN_PASSWORD` dan `ADMIN_SESSION_SECRET` belum diisi, terlalu pendek, atau deploy belum diulang.

**Database belum terbentuk**
- Pastikan Netlify mendeteksi package `@netlify/database` saat build dan bahwa project memakai paket akun credit-based yang mendukung Netlify Database.
- Periksa tab **Data & Storage → Database** dan deploy logs. Jika perlu, deploy via GitHub, bukan hanya upload isi `public`.

**Perubahan pertanyaan**
- Ubah `public/assets/questions.js`. Pastikan ID pertanyaan lama tetap ada jika ingin data lama tetap konsisten. Menambah pertanyaan memerlukan perhatian pada validasi backend yang memakai daftar ID bersama.

**Ingin ubah identitas/logo**
- Logo SJR di paket ini berupa **monogram desain**, bukan file logo resmi perusahaan. Ganti `public/assets/favicon.svg` dan elemen `.brand-symbol` bila ingin memakai logo resmi.

## Struktur proyek

```text
sjr-it-survey/
├── public/
│   ├── index.html             # halaman kuesioner
│   ├── admin.html             # dashboard admin
│   └── assets/
│       ├── styles.css
│       ├── questions.js        # 16 pertanyaan, lokasi, departemen, pilihan
│       ├── app.js
│       ├── admin.js
│       └── favicon.svg
├── netlify/
│   ├── functions/
│   │   ├── submit.mjs          # API penyimpanan jawaban
│   │   └── admin.mjs           # API login + dashboard
│   └── database/migrations/
│       └── 20261103000100_create_it_survey.sql
├── scripts/check.mjs
├── netlify.toml
├── package.json
└── README_DEPLOY.md
```

## Biaya

Netlify punya paket gratis berbasis kuota kredit, tetapi pemakaian Netlify Database, Functions, bandwidth, dan deploy bisa menghabiskan kredit. Periksa harga/kuota akun Anda sebelum menggunakannya sebagai sistem produksi. Informasi terbaru: https://www.netlify.com/pricing/

**Catatan:** ZIP berisi source, bukan link website publik. URL resmi baru akan muncul setelah Anda melakukan deploy pada akun Netlify Anda.
