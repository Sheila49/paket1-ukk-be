import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Peminjaman from './Peminjaman';
import User from './User';

interface PengembalianAttributes {
  id: number;
  peminjaman_id: number;
  tanggal_kembali_aktual?: Date;
  kondisi_alat: 'baik' | 'rusak ringan' | 'rusak berat';
  jumlah_dikembalikan: number;
  keterlambatan_hari: number;
  denda: number;
  catatan?: string;
  diterima_oleh?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PengembalianCreationAttributes extends Optional<PengembalianAttributes, 'id' | 'keterlambatan_hari' | 'denda' | 'created_at' | 'updated_at'> {}

class Pengembalian extends Model<PengembalianAttributes, PengembalianCreationAttributes> implements PengembalianAttributes {
  public id!: number;
  public peminjaman_id!: number;
  public tanggal_kembali_aktual!: Date;
  public kondisi_alat!: 'baik' | 'rusak ringan' | 'rusak berat';
  public jumlah_dikembalikan!: number;
  public keterlambatan_hari!: number;
  public denda!: number;
  public catatan?: string;
  public diterima_oleh?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Pengembalian.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    peminjaman_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'peminjaman',
        key: 'id',
      },
    },
    tanggal_kembali_aktual: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    kondisi_alat: {
      type: DataTypes.ENUM('baik', 'rusak ringan', 'rusak berat'),
      defaultValue: 'baik',
    },
    jumlah_dikembalikan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keterlambatan_hari: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    denda: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diterima_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'pengembalian',
    timestamps: true,
    underscored: true,
  }
);

Pengembalian.belongsTo(Peminjaman, { foreignKey: 'peminjaman_id', as: 'peminjaman' });
Pengembalian.belongsTo(User, { foreignKey: 'diterima_oleh', as: 'penerima' });

export default Pengembalian;
