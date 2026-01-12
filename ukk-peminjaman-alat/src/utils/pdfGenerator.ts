import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFLaporan = async (data: any[]): Promise<Buffer> => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Laporan Peminjaman Alat', 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  const tableData = data.map((item, index) => [
    index + 1,
    item.kode_peminjaman,
    item.peminjam?.nama_lengkap || '-',
    item.alat?.nama_alat || '-',
    item.jumlah_pinjam,
    new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID'),
    item.tanggal_kembali_rencana ? new Date(item.tanggal_kembali_rencana).toLocaleDateString('id-ID') : '-',
    item.status,
  ]);

  autoTable(doc, {
    head: [['No', 'Kode', 'Peminjam', 'Alat', 'Jumlah', 'Tgl Pengajuan', 'Tgl Kembali', 'Status']],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  return Buffer.from(doc.output('arraybuffer'));
};
