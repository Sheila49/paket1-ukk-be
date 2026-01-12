import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface LogAttributes {
  id: number;
  user_id?: number;
  aksi: string;
  tabel: string;
  record_id?: number;
  detail?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

interface LogCreationAttributes extends Optional<LogAttributes, 'id' | 'created_at'> {}

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  public id!: number;
  public user_id?: number;
  public aksi!: string;
  public tabel!: string;
  public record_id?: number;
  public detail?: string;
  public ip_address?: string;
  public user_agent?: string;
  public readonly created_at!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    aksi: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tabel: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'log_aktivitas',
    timestamps: false,
    underscored: true,
  }
);

Log.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Log;
