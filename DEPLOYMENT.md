# Panduan Deployment ke Vercel

Berikut adalah langkah-langkah untuk men-deploy aplikasi KARTA CUP V ke Vercel:

## Persiapan

1. Pastikan Anda memiliki akun [Vercel](https://vercel.com)
2. Pastikan repositori kode Anda sudah di-push ke GitHub, GitLab, atau Bitbucket

## Langkah-langkah Deployment

### Metode 1: Menggunakan Dashboard Vercel

1. Login ke [dashboard Vercel](https://vercel.com/dashboard)
2. Klik tombol "Add New" dan pilih "Project"
3. Impor repositori Git Anda
4. Konfigurasi proyek:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Tambahkan variabel lingkungan:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_SHOW_WATERMARK` (set ke `false`)
6. Klik "Deploy"

### Metode 2: Menggunakan Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login ke Vercel:
   ```
   vercel login
   ```

3. Deploy aplikasi:
   ```
   npm run vercel-deploy
   ```
   atau
   ```
   vercel
   ```

4. Ikuti petunjuk interaktif:
   - Pilih scope (akun atau tim)
   - Konfirmasi nama proyek
   - Konfirmasi direktori root
   - Konfirmasi pengaturan build

5. Setelah deployment selesai, Anda akan mendapatkan URL untuk aplikasi yang sudah di-deploy

## Konfigurasi Domain Kustom

1. Di dashboard Vercel, buka proyek Anda
2. Klik tab "Domains"
3. Tambahkan domain kustom Anda
4. Ikuti petunjuk untuk mengkonfigurasi DNS

## Pembaruan Aplikasi

Setiap kali Anda melakukan push ke branch utama repositori Git Anda, Vercel akan otomatis men-deploy pembaruan aplikasi.

## Pemecahan Masalah

Jika Anda mengalami masalah dengan deployment:

1. Periksa log build di dashboard Vercel
2. Pastikan semua variabel lingkungan sudah dikonfigurasi dengan benar
3. Pastikan file `vercel.json` sudah benar
4. Coba deploy ulang dengan perintah `vercel --prod` 