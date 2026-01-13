'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" DROP DEFAULT;
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" DROP NOT NULL;
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" TYPE VARCHAR;

      DO $$
      BEGIN
        CREATE TYPE "enum_pengembalian_kondisi_alat" AS ENUM ('baik', 'rusak ringan', 'rusak berat');
      EXCEPTION WHEN duplicate_object THEN null;
      END$$;

      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat"
      TYPE "enum_pengembalian_kondisi_alat"
      USING "kondisi_alat"::text::"enum_pengembalian_kondisi_alat";

      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" SET DEFAULT 'baik';
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" SET NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" DROP DEFAULT;
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" DROP NOT NULL;
      ALTER TABLE "pengembalian" ALTER COLUMN "kondisi_alat" TYPE VARCHAR;
      DROP TYPE IF EXISTS "enum_pengembalian_kondisi_alat";
    `);
  }
};