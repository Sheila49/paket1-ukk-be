export class DendaService {
  // ✅ Konfigurasi denda
  private static readonly DENDA_PER_HARI = parseInt(process.env.DENDA_PER_HARI || '10000');
  private static readonly DENDA_KERUSAKAN_RINGAN = parseInt(process.env.DENDA_KERUSAKAN_RINGAN || '50000');
  private static readonly DENDA_KERUSAKAN_BERAT = parseInt(process.env.DENDA_KERUSAKAN_BERAT || '200000');
  private static readonly MAX_DENDA = parseInt(process.env.MAX_DENDA || '1000000');

  /**
   * Hitung denda keterlambatan
   * Rumus: (Tanggal Kembali Aktual - Tanggal Kembali Rencana) × Rp 10.000/hari
   */
  static hitungDenda(
    tanggalKembaliRencana: Date | string, 
    tanggalKembaliAktual: Date | string = new Date()
  ): { keterlambatan: number; denda: number; detail: string } {
    
    const rencana = new Date(tanggalKembaliRencana);
    const aktual = new Date(tanggalKembaliAktual);
    
    // Reset waktu ke 00:00:00 untuk perhitungan hari
    rencana.setHours(0, 0, 0, 0);
    aktual.setHours(0, 0, 0, 0);
    
    const diffTime = aktual.getTime() - rencana.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const keterlambatan = Math.max(0, diffDays);
    const dendaKeterlambatan = keterlambatan * this.DENDA_PER_HARI;
    
    // Cap max denda
    const denda = Math.min(dendaKeterlambatan, this.MAX_DENDA);
    
    const detail = this.generateDetailDenda(keterlambatan, denda);
    
    console.log(`[DendaService] Rencana: ${rencana.toISOString()}, Aktual: ${aktual.toISOString()}`);
    console.log(`[DendaService] Keterlambatan: ${keterlambatan} hari, Denda: Rp ${denda.toLocaleString('id-ID')}`);
    
    return { 
      keterlambatan, 
      denda,
      detail
    };
  }

  /**
   * Hitung denda kerusakan alat
   */
  static hitungDendaKerusakan(
    kondisiAlat: 'baik' | 'rusak ringan' | 'rusak berat',
    nilaiAlat?: number
  ): { denda: number; detail: string } {
    
    let denda = 0;
    let detail = '';

    switch (kondisiAlat.toLowerCase()) {
      case 'baik':
        denda = 0;
        detail = 'Tidak ada denda kerusakan';
        break;
        
      case 'rusak ringan':
        denda = this.DENDA_KERUSAKAN_RINGAN;
        detail = `Denda kerusakan ringan: Rp ${denda.toLocaleString('id-ID')}`;
        break;
        
      case 'rusak berat':
        // Jika nilai alat diketahui, gunakan 50% dari nilai alat atau fixed rate
        if (nilaiAlat && nilaiAlat > 0) {
          const dendaPersentase = Math.floor(nilaiAlat * 0.5);
          denda = Math.max(this.DENDA_KERUSAKAN_BERAT, dendaPersentase);
        } else {
          denda = this.DENDA_KERUSAKAN_BERAT;
        }
        detail = `Denda kerusakan berat: Rp ${denda.toLocaleString('id-ID')} (akan diverifikasi petugas)`;
        break;
        
      default:
        denda = 0;
        detail = 'Kondisi tidak valid';
    }

    console.log(`[DendaService] Kondisi: ${kondisiAlat}, Denda Kerusakan: Rp ${denda.toLocaleString('id-ID')}`);
    
    return { denda, detail };
  }

  /**
   * Hitung total denda (keterlambatan + kerusakan)
   */
  static hitungTotalDenda(
    tanggalKembaliRencana: Date | string,
    tanggalKembaliAktual: Date | string,
    kondisiAlat: 'baik' | 'rusak ringan' | 'rusak berat',
    nilaiAlat?: number
  ): {
    keterlambatan: number;
    dendaKeterlambatan: number;
    dendaKerusakan: number;
    totalDenda: number;
    breakdown: string[];
  } {
    
    const { keterlambatan, denda: dendaKeterlambatan } = this.hitungDenda(
      tanggalKembaliRencana,
      tanggalKembaliAktual
    );
    
    const { denda: dendaKerusakan } = this.hitungDendaKerusakan(kondisiAlat, nilaiAlat);
    
    const totalDenda = dendaKeterlambatan + dendaKerusakan;
    
    const breakdown: string[] = [];
    
    if (keterlambatan > 0) {
      breakdown.push(`Keterlambatan ${keterlambatan} hari: Rp ${dendaKeterlambatan.toLocaleString('id-ID')}`);
    }
    
    if (dendaKerusakan > 0) {
      breakdown.push(`Kerusakan (${kondisiAlat}): Rp ${dendaKerusakan.toLocaleString('id-ID')}`);
    }
    
    if (breakdown.length === 0) {
      breakdown.push('Tidak ada denda');
    }
    
    console.log(`[DendaService] Total Denda: Rp ${totalDenda.toLocaleString('id-ID')}`);
    console.log(`[DendaService] Breakdown:`, breakdown);
    
    return {
      keterlambatan,
      dendaKeterlambatan,
      dendaKerusakan,
      totalDenda,
      breakdown
    };
  }

  /**
   * Generate detail text untuk denda
   */
  private static generateDetailDenda(keterlambatan: number, denda: number): string {
    if (keterlambatan === 0) {
      return 'Dikembalikan tepat waktu';
    }
    
    if (keterlambatan === 1) {
      return `Terlambat 1 hari - Denda: Rp ${denda.toLocaleString('id-ID')}`;
    }
    
    return `Terlambat ${keterlambatan} hari - Denda: Rp ${denda.toLocaleString('id-ID')} (${this.DENDA_PER_HARI.toLocaleString('id-ID')}/hari)`;
  }

  /**
   * Format denda ke Rupiah
   */
  static formatRupiah(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }

  /**
   * Cek apakah ada denda
   */
  static hasDenda(denda: number): boolean {
    return denda > 0;
  }

  /**
   * Get status pembayaran denda
   */
  static getStatusDenda(denda: number, sudahBayar: boolean = false): {
    status: 'lunas' | 'belum_bayar' | 'tidak_ada';
    message: string;
    color: 'green' | 'red' | 'gray';
  } {
    if (denda === 0) {
      return {
        status: 'tidak_ada',
        message: 'Tidak ada denda',
        color: 'gray'
      };
    }
    
    if (sudahBayar) {
      return {
        status: 'lunas',
        message: 'Denda sudah lunas',
        color: 'green'
      };
    }
    
    return {
      status: 'belum_bayar',
      message: `Belum bayar: ${this.formatRupiah(denda)}`,
      color: 'red'
    };
  }

  /**
   * Estimasi denda untuk preview (frontend)
   */
  static estimasiDenda(
    tanggalKembaliRencana: Date | string,
    kondisiAlat: 'baik' | 'rusak ringan' | 'rusak berat' = 'baik'
  ): {
    estimasiKeterlambatan: number;
    estimasiDendaKeterlambatan: number;
    estimasiDendaKerusakan: number;
    estimasiTotal: number;
    warning: string | null;
  } {
    const today = new Date();
    const { keterlambatan, denda } = this.hitungDenda(tanggalKembaliRencana, today);
    const { denda: dendaKerusakan } = this.hitungDendaKerusakan(kondisiAlat);
    
    const total = denda + dendaKerusakan;
    
    let warning: string | null = null;
    
    if (keterlambatan > 0) {
      warning = `⚠️ Anda terlambat ${keterlambatan} hari! Segera kembalikan untuk menghindari denda tambahan.`;
    } else if (keterlambatan === 0) {
      warning = `✅ Anda masih dalam batas waktu pengembalian.`;
    }
    
    if (dendaKerusakan > 0 && kondisiAlat === 'rusak berat') {
      warning = (warning || '') + ` Denda kerusakan berat akan diverifikasi oleh petugas.`;
    }
    
    return {
      estimasiKeterlambatan: keterlambatan,
      estimasiDendaKeterlambatan: denda,
      estimasiDendaKerusakan: dendaKerusakan,
      estimasiTotal: total,
      warning
    };
  }
}