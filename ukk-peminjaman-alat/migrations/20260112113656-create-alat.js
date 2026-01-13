'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alat', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nama_alat: { type: Sequelize.STRING(100), allowNull: false },
      kategori_id: {
        type: Sequelize.INTEGER,
        references: { model: 'kategori', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      stok: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      kondisi: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'baik' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('alat');
  }
};