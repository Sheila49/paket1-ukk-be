# Aplikasi Peminjaman Alat - Backend API

Backend untuk UKK RPL 2025/2026 - Sistem Peminjaman Alat dengan 3 level user.

## 🎯 Fitur Utama

### Admin
- CRUD User
- CRUD Alat
- CRUD Kategori
- CRUD Data Peminjaman
- CRUD Pengembalian
- View Log Aktivitas
- Cetak Laporan (PDF/Excel)

### Petugas
- Menyetujui/Menolak Peminjaman
- Memantau Pengembalian
- View Log Aktivitas

### Peminjam
- Lihat Daftar Alat
- Ajukan Peminjaman
- Kembalikan Alat

## 🛠️ Teknologi

- Node.js + Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Bcrypt
- Joi Validation
- jsPDF & ExcelJS

## 📦 Instalasi

1. Clone repository
```bash
git clone 
cd ukk-peminjaman-alat
```

2. Install dependencies
```bash
npm install
```

3. Setup database dengan pgAdmin
```
a. Buka pgAdmin
b. Klik kanan pada "Databases" → Create → Database
c. Nama database: peminjaman_alat_db
d. Klik Save

e. Klik kanan pada database "peminjaman_alat_db" → Query Tool
f. Buka file database/schema.sql
g. Copy semua isi file, paste ke Query Tool
h. Klik Execute/Run (F5) untuk menjalankan semua query
i. Database siap digunakan!
```

4. Konfigurasi environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi pgAdmin Anda:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=peminjaman_alat_db
# DB_USER=postgres (atau username pgAdmin Anda)
# DB_PASSWORD=your_pgadmin_password
```

5. Jalankan aplikasi
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔐 Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| petugas1 | petugas123 | petugas |
| peminjam1 | peminjam123 | peminjam |

## 📡 API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

### Users (Admin only)
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Alat (Admin only for CUD, All for R)
- GET `/api/alat` - Get all alat
- GET `/api/alat/:id` - Get alat by ID
- POST `/api/alat` - Create alat
- PUT `/api/alat/:id` - Update alat
- DELETE `/api/alat/:id` - Delete alat

### Kategori (Admin only for CUD, All for R)
- GET `/api/kategori` - Get all kategori
- POST `/api/kategori` - Create kategori
- PUT `/api/kategori/:id` - Update kategori
- DELETE `/api/kategori/:id` - Delete kategori

### Peminjaman
- GET `/api/peminjaman` - Get all peminjaman
- GET `/api/peminjaman/:id` - Get peminjaman by ID
- POST `/api/peminjaman` - Ajukan peminjaman (Peminjam)
- PUT `/api/peminjaman/:id/approve` - Setujui peminjaman (Petugas)
- PUT `/api/peminjaman/:id/reject` - Tolak peminjaman (Petugas)

### Pengembalian
- POST `/api/pengembalian` - Kembalikan alat
- GET `/api/pengembalian` - Get all pengembalian
- GET `/api/pengembalian/:id` - Get pengembalian by ID

### Log Aktivitas (Admin only)
- GET `/api/log` - Get all logs

### Laporan (Admin only)
- GET `/api/laporan/peminjaman/pdf` - Download laporan PDF
- GET `/api/laporan/peminjaman/excel` - Download laporan Excel

## 🧪 Testing

Test cases tersedia di `tests/test-cases.md`

## 📊 ERD

ERD diagram tersedia di `docs/ERD.png`

## 📖 Dokumentasi

- Flowchart: `docs/FLOWCHART.md`
- API Documentation: `docs/API_DOCUMENTATION.md`

## 🔒 Security Features

- JWT Authentication
- Password hashing dengan bcrypt
- Role-based access control
- Input validation dengan Joi
- Rate limiting
- Helmet.js untuk security headers

## ⚡ Performance Optimization

- Database indexing
- Query optimization dengan limit
- Efficient data fetching
- Connection pooling

## 📝 License

ISC
