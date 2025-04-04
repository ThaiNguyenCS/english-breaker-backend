const { DataTypes } = require("sequelize");
const { sequelize } = require("../service/database");
const { Reminder } = require("./reminder.model");

const ReminderInstance = sequelize.define(
    "reminder_instances",
    {
        reminderID: {
            type: DataTypes.STRING,
            field: "reminderID",
            primaryKey: true,
            references: {
                model: Reminder,
                key: "id",
            },
        },
        instanceNumber: {
            type: DataTypes.INTEGER,
            field: "instanceNumber",
            primaryKey: true,
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            field: "dueDate",
        },
     
        rmdStatus: {
            type: DataTypes.ENUM("Not Started", "Progress", "Finish"),
            field: "rmdStatus",
            defaultValue: "Not Started"
        }
     
    },
    {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    }
);



module.exports = { ReminderInstance };
