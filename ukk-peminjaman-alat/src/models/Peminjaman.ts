import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Alat from './Alat';

interface PeminjamanAttributes {
  id: number;
  kode_peminjaman: string;
  user_id: number;
  alat_id: number;
  jumlah_pinjam: number;
  tanggal_pengajuan?: Date;
  tanggal_pinjam?: Date;
  tanggal_kembali_rencana: Date;
  keperluan?: string;
  status: 'diajukan' | 'disetujui' | 'ditolak' | 'dipinjam' | 'dikembalikan';
  disetujui_oleh?: number;
  tanggal_persetujuan?: Date;
  catatan_persetujuan?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PeminjamanCreationAttributes extends Optional<PeminjamanAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

class Peminjaman extends Model<PeminjamanAttributes, PeminjamanCreationAttributes> implements PeminjamanAttributes {
  public id!: number;
  public kode_peminjaman!: string;
  public user_id!: number;
  public alat_id!: number;
  public jumlah_pinjam!: number;
  public tanggal_pengajuan!: Date;
  public tanggal_pinjam?: Date;
  public tanggal_kembali_rencana!: Date;
  public keperluan?: string;
  public status!: 'diajukan' | 'disetujui' | 'ditolak' | 'dipinjam' | 'dikembalikan';
  public disetujui_oleh?: number;
  public tanggal_persetujuan?: Date;
  public catatan_persetujuan?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  alat: any;
}

Peminjaman.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kode_peminjaman: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    alat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'alat',
        key: 'id',
      },
    },
    jumlah_pinjam: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_pengajuan: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tanggal_kembali_rencana: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    keperluan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('diajukan', 'disetujui', 'ditolak', 'dipinjam', 'dikembalikan'),
      defaultValue: 'diajukan',
    },
    disetujui_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    tanggal_persetujuan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    catatan_persetujuan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'peminjaman',
    timestamps: true,
    underscored: true,
  }
);

Peminjaman.belongsTo(User, { foreignKey: 'user_id', as: 'peminjam' });
Peminjaman.belongsTo(Alat, { foreignKey: 'alat_id', as: 'alat' });
Peminjaman.belongsTo(User, { foreignKey: 'disetujui_oleh', as: 'penyetuju' });

export default Peminjaman;