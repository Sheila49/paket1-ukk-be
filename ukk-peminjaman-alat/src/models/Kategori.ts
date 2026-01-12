import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface KategoriAttributes {
  id: number;
  nama_kategori: string;
  deskripsi?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface KategoriCreationAttributes extends Optional<KategoriAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Kategori extends Model<KategoriAttributes, KategoriCreationAttributes> implements KategoriAttributes {
  public id!: number;
  public nama_kategori!: string;
  public deskripsi?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Kategori.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_kategori: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deskripsi: {
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
    tableName: 'kategori',
    timestamps: true,
    underscored: true,
  }
);

export default Kategori;
