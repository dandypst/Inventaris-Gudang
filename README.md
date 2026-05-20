# SiGudang — Sistem Manajemen Gudang

Website manajemen keluar masuk barang dengan integrasi Firebase + Google Sheets, siap deploy ke Vercel.

---

## Stack
- **Frontend + API**: Next.js 14 (Pages Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Sync**: Google Sheets API v4
- **Hosting**: Vercel (free tier)

---

## SETUP STEP-BY-STEP

### 1. Firebase Setup

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru → aktifkan **Firestore Database** (mode production)
3. Aktifkan **Authentication** → Sign-in method → Email/Password → Enable
4. Buat akun admin pertama: Authentication → Users → Add user → isi email & password
5. Pergi ke **Project Settings** → General → scroll ke "Your apps" → Web app → copy config ke `.env.local`
6. Pergi ke **Project Settings** → Service accounts → Generate new private key → download JSON
   - Isi `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` dari JSON tersebut

#### Set role admin di Firestore:
Buka Firestore → tambahkan dokumen manual:
- Collection: `users`
- Document ID: UID user yang baru dibuat (lihat di Authentication → Users)
- Fields:
  ```
  uid: "UID_USER"
  email: "email@kamu.com"
  nama: "Nama Admin"
  role: "admin"
  createdAt: (timestamp sekarang)
  ```

#### Firestore Security Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 2. Google Sheets Setup

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru (atau gunakan project yang sama)
3. Enable **Google Sheets API**: APIs & Services → Library → cari "Google Sheets API" → Enable
4. Buat Service Account: APIs & Services → Credentials → Create Credentials → Service Account
   - Isi nama → Create → skip role → Done
5. Klik service account yang baru dibuat → Keys → Add Key → JSON → download
   - Isi `GOOGLE_SHEETS_CLIENT_EMAIL` dan `GOOGLE_SHEETS_PRIVATE_KEY` dari JSON ini
6. Buka Google Sheet kamu → copy **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`
   - Isi ke `GOOGLE_SHEETS_SPREADSHEET_ID`
7. **Share sheet ke service account email** (buka sheet → Share → paste email service account → Editor)
8. Buat sheet/tab bernama **"Transaksi"** di spreadsheet kamu

---

### 3. Install & Jalankan Lokal

```bash
# Clone atau download project ini
git clone https://github.com/USERNAME/gudang-app.git
cd gudang-app

# Install dependencies
npm install

# Buat file environment
cp .env.local.example .env.local
# Edit .env.local dan isi semua variabel

# Jalankan development server
npm run dev
# Buka http://localhost:3000
```

---

### 4. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login dan deploy
vercel

# Atau push ke GitHub dan connect di vercel.com
```

Di Vercel dashboard → Project → Settings → **Environment Variables** → tambahkan semua variabel dari `.env.local`

> ⚠️ PENTING: Untuk `FIREBASE_ADMIN_PRIVATE_KEY` dan `GOOGLE_SHEETS_PRIVATE_KEY`, paste nilai lengkapnya termasuk `-----BEGIN PRIVATE KEY-----` dll. Vercel akan handle escape character secara otomatis.

---

## STRUKTUR FILE

```
gudang-app/
├── pages/
│   ├── index.js              # Redirect otomatis
│   ├── login.js              # Halaman login
│   ├── dashboard.js          # Dashboard + chart
│   ├── stok.js               # Lihat semua stok
│   ├── history.js            # History transaksi + filter + export
│   ├── users.js              # Kelola user (admin only)
│   └── transaksi/
│       ├── masuk.js          # Form input barang masuk
│       └── keluar.js         # Form input barang keluar
│   └── api/
│       ├── transaksi.js      # API: GET/POST transaksi
│       ├── stok.js           # API: GET stok
│       ├── export.js         # API: Export Excel
│       └── users.js          # API: Kelola user (admin)
├── components/
│   ├── AuthContext.js        # Firebase Auth provider
│   ├── Layout.js             # Layout dengan auth guard
│   ├── Sidebar.js            # Navigasi sidebar
│   └── TransaksiForm.js      # Form reusable barang masuk/keluar
├── lib/
│   ├── firebase.js           # Firebase client config
│   ├── firebaseAdmin.js      # Firebase admin SDK
│   └── googleSheets.js       # Google Sheets helper
└── styles/
    └── globals.css           # Global styles
```

---

## FITUR

- ✅ Login multi-user dengan role (admin / operator)
- ✅ Input barang masuk & keluar
- ✅ Stok real-time otomatis terupdate
- ✅ History transaksi dengan filter tipe, tanggal, pencarian
- ✅ Export Excel (transaksi & stok)
- ✅ Sync otomatis ke Google Sheets setiap input
- ✅ Dashboard dengan chart aktivitas 7 hari
- ✅ Notifikasi stok hampir habis (< 10 unit)
- ✅ Kelola user oleh admin

---

## NOTES

- Operator hanya bisa input dan lihat data
- Admin bisa tambah user baru
- Jika Google Sheets gagal sync, transaksi tetap tersimpan di Firebase (tidak blocking)
- Sheet Google secara otomatis memiliki header kolom saat pertama kali ada transaksi
