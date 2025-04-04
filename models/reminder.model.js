const { DataTypes } = require("sequelize");
const { sequelize } = require("../service/database");
// console.log("Create reminder");


const Reminder = sequelize.define("reminder", 
    {
        id: {
            type: DataTypes.STRING,
            field: "id",
            primaryKey: true
        },
        startDate: {
            type: DataTypes.DATEONLY,
            field: "startDate",
        },
        endDate: {
            type: DataTypes.DATEONLY,
            field: "endDate",
        },
        userID: {
            type: DataTypes.STRING,
            field: "userID",
        },
        task: {
            type: DataTypes.STRING,
            field: "task",
        },
        activeDay: {
            field: "activeDay",
            type: DataTypes.STRING,
            defaultValue: "0000000"
        },
        isActive: {
            field: "isActive",
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, 
    {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false
    }
)



module.exports = {Reminder}