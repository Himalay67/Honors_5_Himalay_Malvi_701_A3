const { DataTypes } = require("sequelize");

module.exports = function(sequelize){
    return sequelize.define("Student", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING
        },

        email:{
            type: DataTypes.STRING
        },

        course: {
            type: DataTypes.STRING
        }
    });
};