const {Sequelize, DataTypes}= require ('sequelize')
const sequelize = require ('../../config/database')

const Gallery = sequelize.define("Gallery",{
    gid: {
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
    }, {
        tableName: 'gallerys', // Nama tabel di database
        timestamps: true, // Menyertakan createdAt dan updatedAt
        underscored: true // Menggunakan underscore_case untuk kolom dan nama tabel
    });

module.exports = Gallery