# Panduan Praktis Deployment KARTA CUP V ke Vercel

Dokumen ini berisi langkah-langkah praktis untuk men-deploy aplikasi KARTA CUP V ke platform Vercel menggunakan Vercel CLI.

## Persiapan Awal

### 1. Pastikan Semua File Konfigurasi Sudah Siap

Sebelum melakukan deployment, pastikan file-file berikut sudah ada dan dikonfigurasi dengan benar:

- `vercel.json` - Konfigurasi deployment Vercel
- `.env` - Variabel lingkungan untuk Firebase
- `package.json` - Konfigurasi proyek dan script

### 2. Instalasi Vercel CLI

```bash
npm install -g vercel
```

### 3. Login ke Akun Vercel

```bash
vercel login
```

## Langkah-Langkah Deployment

### Metode 1: Deployment Cepat

Untuk deployment cepat dengan semua konfigurasi default dari file vercel.json:

```bash
vercel --prod
```

### Metode 2: Deployment dengan Variabel Lingkungan

Untuk memastikan variabel lingkungan Firebase terkonfigurasi dengan benar:

```bash
vercel --env-file .env --prod
```

### Metode 3: Deployment dengan Konfigurasi Manual

Jika Anda ingin mengkonfigurasi ulang proyek:

```bash
vercel
```

Kemudian ikuti petunjuk interaktif dan masukkan informasi berikut:
- Nama proyek: `karta-cup-v`
- Framework preset: `vite`
- Build command: `npm run build`
- Output directory: `dist`
- Development command: `npm run dev`

## Contoh Kasus Penggunaan

### Kasus 1: Deployment Pertama Kali

```bash
# Login ke Vercel
vercel login

# Deploy dengan konfigurasi dari file .env
vercel --env-file .env --prod
```

### Kasus 2: Update Aplikasi Setelah Perubahan Kode

```bash
# Commit perubahan ke Git
git add .
git commit -m "Update fitur XYZ"
git push

# Deploy ulang ke Vercel
vercel --prod
```

### Kasus 3: Menambahkan Domain Kustom

```bash
# Tambahkan domain kustom
vercel domains add kartacup.com

# Verifikasi domain
vercel domains verify kartacup.com
```

## Pemecahan Masalah Umum

### Masalah 1: Build Gagal

Jika build gagal, periksa log error:

```bash
vercel logs
```

Solusi umum:
- Pastikan semua dependensi terinstal dengan benar
- Periksa sintaks kode TypeScript
- Pastikan variabel lingkungan Firebase sudah benar

### Masalah 2: Routing Tidak Berfungsi

Jika routing tidak berfungsi setelah deployment, pastikan file `vercel.json` memiliki konfigurasi rewrites yang benar:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Masalah 3: Firebase Tidak Terhubung

Jika aplikasi tidak dapat terhubung ke Firebase, periksa:
- Variabel lingkungan sudah dikonfigurasi dengan benar di dashboard Vercel
- Aturan keamanan Firebase memperbolehkan akses dari domain Vercel

## Perintah Vercel CLI yang Berguna

```bash
# Melihat informasi proyek
vercel project

# Melihat daftar deployment
vercel ls

# Melihat log deployment
vercel logs

# Menghapus deployment
vercel remove karta-cup-v

# Mengunduh variabel lingkungan
vercel env pull
```

## Referensi

- [Dokumentasi Resmi Vercel](https://vercel.com/docs)
- [Dokumentasi Vercel CLI](https://vercel.com/docs/cli)
- [Dokumentasi Vite](https://vitejs.dev/guide/)
- [Dokumentasi Firebase](https://firebase.google.com/docs) 