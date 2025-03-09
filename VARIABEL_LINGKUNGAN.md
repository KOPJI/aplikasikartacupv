# Panduan Pengaturan Variabel Lingkungan di Vercel

Dokumen ini menjelaskan cara mengatur variabel lingkungan untuk aplikasi KARTA CUP V di platform Vercel.

## Variabel Lingkungan yang Diperlukan

Aplikasi KARTA CUP V memerlukan variabel lingkungan berikut untuk terhubung ke Firebase:

| Variabel | Deskripsi | Contoh Nilai |
|----------|-----------|--------------|
| `VITE_FIREBASE_API_KEY` | API Key Firebase | `AIzaSyBX_qnWNYHIqN3YquQKmmM7lMNjK3O62Ls` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain autentikasi Firebase | `manajemen-turnamen.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID Proyek Firebase | `manajemen-turnamen` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket penyimpanan Firebase | `manajemen-turnamen.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID Pengirim Firebase | `873449207450` |
| `VITE_FIREBASE_APP_ID` | ID Aplikasi Firebase | `1:873449207450:web:a80175d6aeeb35211a9123` |
| `VITE_SHOW_WATERMARK` | Menampilkan watermark | `false` |

## Cara Mengatur Variabel Lingkungan di Vercel

### Metode 1: Melalui Dashboard Vercel

1. Login ke [dashboard Vercel](https://vercel.com/dashboard)
2. Pilih proyek KARTA CUP V
3. Klik tab "Settings"
4. Klik "Environment Variables" di sidebar
5. Tambahkan setiap variabel lingkungan dengan mengklik "Add New"
6. Masukkan nama variabel dan nilainya
7. Pilih environment yang sesuai (Production, Preview, Development)
8. Klik "Save"

![Contoh Pengaturan Variabel Lingkungan di Vercel](https://vercel.com/docs/concepts/projects/environment-variables/images/env-var-add-production.png)

### Metode 2: Melalui Vercel CLI

Anda dapat mengatur variabel lingkungan menggunakan Vercel CLI dengan perintah berikut:

```bash
vercel env add VITE_FIREBASE_API_KEY
```

Anda akan diminta untuk memasukkan nilai variabel dan memilih environment yang sesuai.

Atau, Anda dapat menambahkan semua variabel sekaligus dengan file `.env`:

```bash
vercel env pull .env.local  # Mengunduh variabel yang sudah ada
vercel env push .env        # Mengunggah variabel dari file .env
```

### Metode 3: Saat Deployment

Anda juga dapat menyediakan variabel lingkungan saat melakukan deployment:

```bash
vercel --env VITE_FIREBASE_API_KEY=your_api_key --env VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

Atau menggunakan file `.env`:

```bash
vercel --env-file .env
```

## Verifikasi Variabel Lingkungan

Untuk memverifikasi bahwa variabel lingkungan sudah dikonfigurasi dengan benar:

1. Deploy aplikasi ke Vercel
2. Buka aplikasi di browser
3. Buka konsol developer (F12)
4. Periksa apakah aplikasi dapat terhubung ke Firebase tanpa error

## Keamanan Variabel Lingkungan

Beberapa praktik keamanan terbaik untuk variabel lingkungan:

1. **Jangan pernah** menyimpan variabel lingkungan di repositori Git
2. Pastikan file `.env` sudah ditambahkan ke `.gitignore`
3. Gunakan file `.env.example` sebagai template tanpa nilai sebenarnya
4. Batasi akses ke dashboard Vercel hanya untuk anggota tim yang memerlukan
5. Gunakan variabel lingkungan yang berbeda untuk environment yang berbeda (development, staging, production)

## Pemecahan Masalah

Jika aplikasi tidak dapat terhubung ke Firebase setelah deployment:

1. Periksa apakah semua variabel lingkungan sudah dikonfigurasi dengan benar di Vercel
2. Pastikan nama variabel dimulai dengan `VITE_` agar dapat diakses oleh aplikasi Vite
3. Verifikasi bahwa nilai variabel lingkungan sudah benar
4. Periksa apakah proyek Firebase sudah dikonfigurasi untuk menerima koneksi dari domain Vercel
5. Coba deploy ulang aplikasi setelah mengubah variabel lingkungan

## Referensi

- [Dokumentasi Variabel Lingkungan Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Dokumentasi Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Dokumentasi Firebase Web](https://firebase.google.com/docs/web/setup) 