# Panduan Penggunaan Vercel CLI

Vercel CLI adalah alat command-line yang memungkinkan Anda men-deploy aplikasi ke Vercel langsung dari terminal. Berikut adalah panduan penggunaan Vercel CLI untuk men-deploy aplikasi KARTA CUP V.

## Instalasi Vercel CLI

```bash
npm install -g vercel
```

## Login ke Vercel

```bash
vercel login
```

Anda akan diminta untuk memasukkan alamat email yang terkait dengan akun Vercel Anda. Setelah memasukkan email, Anda akan menerima email konfirmasi. Klik tautan di email tersebut untuk menyelesaikan proses login.

## Deployment Aplikasi

### Deployment Pertama Kali

Untuk men-deploy aplikasi pertama kali, jalankan perintah berikut di direktori root proyek:

```bash
vercel
```

Anda akan diminta untuk menjawab beberapa pertanyaan:

1. **Set up and deploy?** Pilih `Y` (Yes)
2. **Which scope do you want to deploy to?** Pilih akun atau tim Anda
3. **Link to existing project?** Pilih `N` (No) jika ini adalah proyek baru
4. **What's your project's name?** Masukkan nama proyek (misalnya `karta-cup-v`)
5. **In which directory is your code located?** Tekan Enter untuk menggunakan direktori saat ini
6. **Want to override the settings?** Pilih `N` (No) untuk menggunakan pengaturan dari vercel.json

### Deployment dengan Environment Variables

Untuk men-deploy dengan variabel lingkungan, gunakan perintah:

```bash
vercel --env VITE_FIREBASE_API_KEY=your_api_key --env VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

Atau, Anda dapat menggunakan file .env:

```bash
vercel --env-file .env
```

### Deployment ke Production

Secara default, Vercel men-deploy ke lingkungan preview. Untuk men-deploy ke production, gunakan flag `--prod`:

```bash
vercel --prod
```

### Melihat Deployment

Untuk melihat daftar deployment:

```bash
vercel ls
```

### Menghapus Deployment

Untuk menghapus deployment:

```bash
vercel remove karta-cup-v
```

## Konfigurasi Domain Kustom

Untuk menambahkan domain kustom:

```bash
vercel domains add kartacup.com
```

## Pemecahan Masalah

### Melihat Log Deployment

```bash
vercel logs karta-cup-v
```

### Melihat Informasi Proyek

```bash
vercel project
```

### Memperbarui Konfigurasi Proyek

```bash
vercel project update
```

## Referensi

Untuk informasi lebih lanjut tentang Vercel CLI, kunjungi [dokumentasi resmi Vercel CLI](https://vercel.com/docs/cli). 