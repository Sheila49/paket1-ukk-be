export class DendaService {
  static hitungDenda(tanggalKembaliRencana: Date, tanggalKembaliAktual: Date): { keterlambatan: number; denda: number } {
    const dendaPerHari = parseInt(process.env.DENDA_PER_HARI || '5000');
    
    const rencana = new Date(tanggalKembaliRencana);
    const aktual = new Date(tanggalKembaliAktual);
    
    const diffTime = aktual.getTime() - rencana.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const keterlambatan = Math.max(0, diffDays);
    const denda = keterlambatan * dendaPerHari;
    
    return { keterlambatan, denda };
  }
}
