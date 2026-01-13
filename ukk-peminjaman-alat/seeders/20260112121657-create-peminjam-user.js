'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'peminjam1' }, {});

    await queryInterface.bulkInsert('users', [{
      username: 'peminjam1',
      email: 'peminjam1@example.com',
      nama_lengkap: 'Peminjam Alat',
      password: await bcrypt.hash('peminjam123', 10),
      role: 'peminjam',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'peminjam1' }, {});
  }
};