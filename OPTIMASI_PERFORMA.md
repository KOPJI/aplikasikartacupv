# Panduan Optimasi Performa KARTA CUP V di Vercel

Dokumen ini berisi tips dan praktik terbaik untuk mengoptimalkan performa aplikasi KARTA CUP V setelah di-deploy ke Vercel.

## Optimasi Build

### 1. Minifikasi dan Bundling

Vite secara otomatis melakukan minifikasi dan bundling kode JavaScript dan CSS. Pastikan konfigurasi build di `vite.config.ts` sudah optimal:

```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore']
        }
      }
    }
  }
});
```

### 2. Tree Shaking

Pastikan kode menggunakan import yang spesifik untuk memungkinkan tree shaking yang efektif:

```typescript
// Baik - memungkinkan tree shaking
import { collection, getDocs } from 'firebase/firestore';

// Kurang baik - mengimpor seluruh modul
import * as firestore from 'firebase/firestore';
```

### 3. Code Splitting

Gunakan lazy loading untuk komponen yang tidak diperlukan pada load awal:

```typescript
import { lazy, Suspense } from 'react';

const BaganGugur = lazy(() => import('./components/BaganGugur'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BaganGugur />
    </Suspense>
  );
}
```

## Optimasi Aset

### 1. Optimasi Gambar

Gunakan format gambar modern seperti WebP dan pastikan ukuran gambar sudah dioptimalkan:

```html
<picture>
  <source srcset="/logo.webp" type="image/webp">
  <img src="/logo.png" alt="Logo KARTA CUP V">
</picture>
```

### 2. Preloading dan Prefetching

Tambahkan preload untuk aset penting:

```html
<link rel="preload" href="/fonts/poppins.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. Lazy Loading Gambar

Gunakan atribut loading="lazy" untuk gambar yang tidak terlihat pada viewport awal:

```html
<img src="/tim-logo.png" loading="lazy" alt="Logo Tim">
```

## Optimasi Firebase

### 1. Batasi Ukuran Query

Batasi jumlah dokumen yang diambil dari Firestore:

```typescript
const getTeamsFromFirestore = async () => {
  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### 2. Gunakan Caching

Implementasikan caching untuk data yang jarang berubah:

```typescript
const cachedData = {};

const getTeamsWithCache = async () => {
  if (cachedData.teams && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
    return cachedData.teams;
  }
  
  const teams = await getTeamsFromFirestore();
  cachedData.teams = teams;
  cachedData.timestamp = Date.now();
  return teams;
};
```

### 3. Gunakan Offline Persistence

Aktifkan offline persistence untuk Firestore:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Firebase persistence error:', err);
  });
```

## Optimasi Caching di Vercel

### 1. Konfigurasi Cache-Control

Konfigurasi header Cache-Control di `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Gunakan Vercel Edge Cache

Aktifkan Vercel Edge Cache untuk API routes jika diperlukan:

```typescript
export const config = {
  runtime: 'edge'
};
```

## Monitoring Performa

### 1. Lighthouse

Gunakan Google Lighthouse untuk menganalisis performa aplikasi:

1. Buka Chrome DevTools
2. Pilih tab "Lighthouse"
3. Klik "Generate report"

### 2. Web Vitals

Pantau Web Vitals seperti LCP, FID, dan CLS:

```typescript
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Kirim ke layanan analytics
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

### 3. Vercel Analytics

Aktifkan Vercel Analytics di dashboard Vercel:

1. Buka proyek di dashboard Vercel
2. Klik tab "Analytics"
3. Klik "Enable Analytics"

## Praktik Terbaik Tambahan

1. **Gunakan CDN untuk Aset Statis**: Vercel secara otomatis menggunakan CDN global
2. **Implementasikan Service Worker**: Untuk pengalaman offline dan caching tambahan
3. **Optimalkan Font Loading**: Gunakan `font-display: swap` dan preload font
4. **Hindari Render Blocking Resources**: Pindahkan script non-kritis ke akhir body
5. **Implementasikan Skeleton Loading**: Untuk meningkatkan perceived performance

## Referensi

- [Dokumentasi Optimasi Vercel](https://vercel.com/docs/concepts/edge-network/caching)
- [Panduan Performa Web.dev](https://web.dev/fast/)
- [Dokumentasi Optimasi Firebase](https://firebase.google.com/docs/firestore/best-practices)
- [Dokumentasi Vite Build Optimization](https://vitejs.dev/guide/build.html) 