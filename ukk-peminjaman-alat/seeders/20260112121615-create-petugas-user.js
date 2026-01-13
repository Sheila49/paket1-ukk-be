'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'petugas1' }, {});

    await queryInterface.bulkInsert('users', [{
      username: 'petugas1',
      email: 'petugas1@example.com',
      nama_lengkap: 'Petugas Inventaris',
      password: await bcrypt.hash('petugas123', 10),
      role: 'petugas',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'petugas1' }, {});
  }
};