# IT Voice SJR — Vercel

Website kuesioner IT SJR dengan tampilan sama seperti versi awal. Form: `/` dan dashboard admin: `/admin.html`.

## Deploy dari GitHub ke Vercel
1. Buat **repository GitHub baru** (atau hapus isi repository lama sebelum mengunggah). Upload **isi folder ini langsung ke root repository**: `api`, `public`, `package.json`, `vercel.json`. Jangan membungkusnya dalam folder `sjr-it-survey`.
2. Vercel → Add New → Project → Import Git Repository → pilih repo. Framework Preset: **Other**. Root Directory: `./`. Build Command: kosong / Override OFF. Output Directory: kosong / Override OFF. Klik Deploy.
3. Pada proyek Vercel → **Storage** (atau tab Marketplace/Storage sesuai UI) → **Create Database / Blob** → pilih **Vercel Blob**, buat store, lalu **Connect** ke project. Token `BLOB_READ_WRITE_TOKEN` harus terpasang sebagai Environment Variable proyek (biasanya otomatis setelah connect). Store **private** dibutuhkan agar isi survei tidak dapat diakses publik.
4. Settings → Environment Variables: tambah `ADMIN_PASSWORD` (minimal 12 karakter) dan `ADMIN_SESSION_SECRET` (minimal 32 karakter acak). Pastikan scope Production; simpan.
5. Deployments → Redeploy deployment terbaru, dengan Environment Variables yang baru. Setelah sukses, buka URL utama dan `/admin.html`.
6. Uji: isi satu survei contoh → kirim → login admin → pastikan hasil muncul → ekspor CSV.

**Catatan:** jika pembuatan Vercel Blob tidak tersedia pada akun/region/plan, hubungkan layanan database eksternal sebelum menerima jawaban nyata. Tidak ada data yang disimpan pada browser atau filesystem ephemeral Vercel. Biaya dan kuota Blob tergantung paket Vercel.

## Keamanan
- Jangan commit `.env` atau password admin ke GitHub.
- Jawaban disimpan sebagai objek Blob privat, bukan PostgreSQL.
- Endpoint `/api/admin` memerlukan cookie login bertanda tangan; nama responden opsional.
- Untuk penggunaan skala besar, tambahkan rate limiting dan proteksi spam di depan endpoint survei.
