export interface UserPayload {
  id: number;
  username: string;
  role: 'admin' | 'petugas' | 'peminjam';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface PeminjamanRequest {
  alat_id: number;
  jumlah_pinjam: number;
  tanggal_kembali_rencana: string;
  keperluan: string;
}

export interface PengembalianRequest {
  peminjaman_id: number;
  kondisi_alat: 'baik' | 'rusak ringan' | 'rusak berat';
  jumlah_dikembalikan: number;
  catatan?: string;
}
