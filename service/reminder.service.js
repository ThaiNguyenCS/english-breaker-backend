const { Op, } = require("sequelize");
const { Reminder } = require("../models/reminder.model");
const { ReminderInstance } = require("../models/reminderInstance.model");
const { generateUUIDV4 } = require("../utils/idManager");
const { database, sequelize } = require("./database");
const { DB_TABLE_REMINDER_INSTANCES } = require("../config/config");

Reminder.hasMany(ReminderInstance, {
    foreignKey: "reminderID",
    sourceKey: "id",
});

ReminderInstance.belongsTo(Reminder, {
    foreignKey: "reminderID",
    targetKey: "id",
});

class ReminderService {
    constructor() { }
    addReminder = async (userID, data) => {
        if (userID) {
            try {
                const reminder = await Reminder.create({
                    id: generateUUIDV4(),
                    userID,
                    startDate: data.startDate,
                    endDate: data.finishDate,
                    activeDay: data.activeDay,
                    task: data.task,
                });
                console.log("reminder result", reminder);
                return { result: true, data: reminder };
            } catch (error) {
                console.log(error);
                return { result: false, error };
            }
        } else {
            console.log("No UserID");
            return { result: false, msg: "No UserID" };
        }
    };

    getReminder = async (userID) => {
        if (userID) {
            const reminders = await Reminder.findAll({
                where: {
                    userID: { [Op.eq]: userID },
                    isActive: { [Op.eq]: true },
                },
                order: [['endDate', 'DESC']]
            })
            return { result: true, data: reminders };
        } else {
            console.log("No UserID");
            return { result: false, msg: "No UserID" };
        }
    };



    updateReminderInsStatus = async (userID, data) => {
        if (userID) {
            try {
                const result = await ReminderInstance.update(
                    { rmdStatus: data.newStatus },
                    {
                        where: { reminderID: data.id },
                    }
                );
                return { result: true, data: result };
            } catch (error) {
                console.log(error);
                return { result: false, error };
            }
        } else {
            console.log("No UserID");
            return { result: false, msg: "No UserID" };
        }
    };

    createTodayReminders = async (reminders, instanceResult) => {
        let CREATE_INSTANCE_QUERY = `INSERT INTO ${DB_TABLE_REMINDER_INSTANCES} (reminderID, dueDate, rmdStatus) VALUES (`;
        const values = [];
        let isMissing = false;
        for (let i = 0; i < reminders.length; i++) {
            const ins = instanceResult.find((item) => item.reminderID === reminders[i].id);
            if (!ins) {
                // if instance has not existed yet
                isMissing = true;
                values.push(reminders[i].id);
                values.push("Not Started");
                CREATE_INSTANCE_QUERY += "?, CURDATE(), ?,";
            }
        }
        if (isMissing) {
            CREATE_INSTANCE_QUERY = CREATE_INSTANCE_QUERY.slice(0, CREATE_INSTANCE_QUERY.length - 1); // discard the last comma
            CREATE_INSTANCE_QUERY += ")";
            try {
                const [createResult] = await database.execute(CREATE_INSTANCE_QUERY, values); // create instances
                return { result: true, isMissing: true };
            } catch (error) {
                console.log(error);
                return { result: false, error };
            }
        }
        return { result: true, isMissing: false };
    };


    getTodayReminders = async (userID) => {
        try {
            let reminders = await Reminder.findAll({
                include: [
                    {
                        model: ReminderInstance,
                        required: false,
                        where: {
                            dueDate: {
                                [Op.or]: [{ [Op.eq]: sequelize.fn("CURDATE") }, { [Op.eq]: null }],
                            },
                        },
                        on: sequelize.literal(`reminder_instances.reminderID = reminder.id`),
                    },
                ],
                attributes: {
                    exclude: ["isDaily", "startDate", "endDate"],
                },
                where: {
                    startDate: { [Op.lte]: sequelize.fn("CURDATE") },
                    endDate: { [Op.gte]: sequelize.fn("CURDATE") },
                    isActive: { [Op.eq]: true },
                    userID: { [Op.eq]: userID }
                },
            });
            reminders = reminders.filter(reminder => reminder.activeDay.charAt(new Date().getDay()) === "1") // get active reminder today
            return { result: true, data: reminders };
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    };

    getTodayRemindersV2 = async (userID) => {
        if (userID) {
            const result = await this.getTodayReminders(userID);
            if (result.result) {
                const reminders = result.data;
                const instances = [];
                reminders.forEach((item) => {
                    if (item.reminder_instances.length === 0) {
                        // console.log({reminderID: item.id, dueDate: sequelize.fn("CURDATE")});
                        instances.push({ reminderID: item.id, dueDate: sequelize.fn("CURDATE") });
                    }
                });
                if (instances.length > 0) {
                    try {
                        const createdInstances = await ReminderInstance.bulkCreate(instances); // create new instances for today
                        console.log("Create new instances successfully");

                        const todayReminders = await this.getTodayReminders(userID);
                        return { result: true, data: todayReminders };
                    } catch (error) {
                        console.log(error);
                        return { result: false, error };
                    }
                } // all today instances are created
                else {
                    return { result: true, data: reminders };
                }
            }
        } else {
            console.log("No UserID");
            return { result: false, msg: "No UserID" };
        }
    };

    // updateReminderInfo = async (userID, data) => {
    //     if (userID) {

    //     }
    //     else {

    //     }
    // }
}




module.exports = ReminderService;
