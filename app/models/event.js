const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Sesuaikan path ini dengan lokasi file sequelize.js

const Event = sequelize.define('Event', {
        id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false
        },
        titleen: {
          type: DataTypes.STRING,
          allowNull: false
          },
        descriptionid: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        descriptionen: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        image: {
          type: DataTypes.STRING,
          allowNull: true
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }

    }, {
        tableName: 'events', // Nama tabel di database
        timestamps: true, // Tidak menyertakan createdAt dan updatedAt
        underscored: true // Menggunakan underscore_case untuk kolom dan nama tabel
  });


module.exports = Event;
