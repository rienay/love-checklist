# Panduan Deploy Kuesioner Hubungan ke Vercel 🚀

Aplikasi ini sudah dikonfigurasi secara lengkap untuk berjalan di **Vercel** menggunakan arsitektur Serverless (`vercel.json` dan `api/index.js`).

---

## 🛠️ Pilihan Cara Deploy

### Cara 1: Menggunakan GitHub & Vercel Web (Paling Mudah & Direkomendasikan)
1. **Inisialisasi Git & Push ke GitHub**:
   Buka terminal di folder ini (`d:\web\4`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit relationship questionnaire"
   ```
2. Buat repository baru di [GitHub](https://github.com/new) (bisa private).
3. Sambungkan dan push:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
4. Buka [Vercel Dashboard](https://vercel.com/new).
5. Klik **Import** pada repository tersebut.
6. Langsung klik tombol **Deploy** (Semua pengaturan build sudah otomatis terdeteksi dari `vercel.json`).

---

### Cara 2: Menggunakan Vercel CLI
Jika kamu ingin deploy langsung dari terminal tanpa push ke GitHub:
1. Buka terminal di folder `d:\web\4`:
   ```bash
   npx vercel
   ```
2. Login ke akun Vercel kamu jika diminta.
3. Tekan Enter untuk menyetujui opsi default.
4. Untuk deploy ke production:
   ```bash
   npx vercel --prod
   ```

---

## 💾 Catatan Penting Penyimpanan Data di Vercel (Serverless)

Vercel bersifat **Serverless** (komputasi awan tanpa harddisk permanen). Aplikasi ini sudah disiapkan dengan 3 lapis pengamanan data:

1. **Notifikasi WhatsApp Instan (Bawaan)**:
   - Begitu pacarmu klik kirim, muncul tombol **"Kabari Pasangan via WhatsApp"** dengan ringkasan lengkap yang langsung dikirimkan ke chatmu.
2. **Penyimpanan Cloud Permanen Gratis (Vercel KV / Upstash)**:
   - Jika ingin data tersimpan permanen di dashboard Vercel secara online:
     1. Di Vercel Dashboard project kamu, buka tab **Storage**.
     2. Klik **Create Database** -> Pilih **KV (Upstash Redis)** (100% Gratis).
     3. Hubungkan ke project kamu (*Connect to Project*).
     4. Variabel `KV_REST_API_URL` & `KV_REST_API_TOKEN` akan terpasang otomatis. Aplikasi akan otomatis beralih menyimpan seluruh submission ke cloud!
3. **Notifikasi Discord / Telegram / Webhook (Opsional)**:
   - Kamu bisa menambahkan Environment Variable `WEBHOOK_URL` di Settings Vercel jika ingin notifikasi otomatis masuk setiap kali pacarmu selesai mengisi.
