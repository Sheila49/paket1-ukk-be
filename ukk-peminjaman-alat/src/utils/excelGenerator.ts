import ExcelJS from 'exceljs';

export const generateExcelLaporan = async (data: any[]): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Peminjaman');

  worksheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Kode Peminjaman', key: 'kode', width: 20 },
    { header: 'Peminjam', key: 'peminjam', width: 25 },
    { header: 'Alat', key: 'alat', width: 25 },
    { header: 'Jumlah', key: 'jumlah', width: 10 },
    { header: 'Tanggal Pengajuan', key: 'tgl_pengajuan', width: 18 },
    { header: 'Tanggal Kembali', key: 'tgl_kembali', width: 18 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2980B9' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  data.forEach((item, index) => {
    worksheet.addRow({
      no: index + 1,
      kode: item.kode_peminjaman,
      peminjam: item.peminjam?.nama_lengkap || '-',
      alat: item.alat?.nama_alat || '-',
      jumlah: item.jumlah_pinjam,
      tgl_pengajuan: new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID'),
      tgl_kembali: item.tanggal_kembali_rencana ? new Date(item.tanggal_kembali_rencana).toLocaleDateString('id-ID') : '-',
      status: item.status,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
