// migrations/xxxx-create-peminjaman.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('peminjaman', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      alat_id: {
        type: Sequelize.INTEGER,
        references: { model: 'alat', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tanggal_pinjam: { type: Sequelize.DATEONLY, allowNull: false },
      tanggal_kembali: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'disetujui', 'ditolak', 'dikembalikan'),
        allowNull: false,
        defaultValue: 'pending'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('peminjaman');
  }
};