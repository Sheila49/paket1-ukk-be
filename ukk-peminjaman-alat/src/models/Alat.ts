import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Kategori from './Kategori';

interface AlatAttributes {
  id: number;
  kode_alat: string;
  nama_alat: string;
  kategori_id?: number;
  deskripsi?: string;
  kondisi: 'baik' | 'rusak ringan' | 'rusak berat';
  jumlah_total: number;
  jumlah_tersedia: number;
  lokasi_penyimpanan?: string;
  gambar_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AlatCreationAttributes extends Optional<AlatAttributes, 'id' | 'kondisi' | 'created_at' | 'updated_at'> {}

class Alat extends Model<AlatAttributes, AlatCreationAttributes> implements AlatAttributes {
  public id!: number;
  public kode_alat!: string;
  public nama_alat!: string;
  public kategori_id?: number;
  public deskripsi?: string;
  public kondisi!: 'baik' | 'rusak ringan' | 'rusak berat';
  public jumlah_total!: number;
  public jumlah_tersedia!: number;
  public lokasi_penyimpanan?: string;
  public gambar_url?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Alat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kode_alat: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nama_alat: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kategori_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'kategori',
        key: 'id',
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kondisi: {
      type: DataTypes.ENUM('baik', 'rusak ringan', 'rusak berat'),
      defaultValue: 'baik',
    },
    jumlah_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jumlah_tersedia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lokasi_penyimpanan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gambar_url: {
      type: DataTypes.STRING(255),
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
    tableName: 'alat',
    timestamps: true,
    underscored: true,
  }
);

Alat.belongsTo(Kategori, { foreignKey: 'kategori_id', as: 'kategori' });

export default Alat;
