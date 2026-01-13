'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // hapus dulu user dengan username 'admin' kalau ada
    await queryInterface.bulkDelete('users', { username: 'admin' }, {});

    // lalu insert baru
    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      email: 'admin@example.com',
      nama_lengkap: 'Administrator Sistem',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'admin' }, {});
  }
};