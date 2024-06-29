const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); // Sesuaikan path ini dengan lokasi file sequelize.js

const Shop = sequelize.define('Shop', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    descriptionen: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT, // Gunakan FLOAT untuk harga jika ingin mendukung pecahan (misalnya 9.99)
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
    }, {
    tableName: 'shops', // Nama tabel di database
    timestamps: true, // Menyertakan createdAt dan updatedAt
    underscored: true // Menggunakan underscore_case untuk kolom dan nama tabel
    });


module.exports = Shop;
