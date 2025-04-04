const { addReminder: addReminderToDB, getReminder, getTodayRemindersV2, updateReminderInsStatus } = require("../service/reminder.service")
async function addReminderHandler(req, res) {
    const result = await addReminderToDB(req.decoded.id, req.body)
    res.send(result);
}

async function getReminderHandler(req, res) {
    const result = await getReminder(req.decoded.id)
    res.send(result);
}

async function getTodayReminderHandler(req, res) {
    // const result = await getTodayReminders(req.decoded.id)
    const result = await getTodayRemindersV2(req.decoded.id)
    res.send(result);
}

async function deleteReminder(req, res) {

}

async function modifyReminderHandler(req, res) {

}

async function updateReminderStatusHandler(req, res) {
    const result = await updateReminderInsStatus(req.decoded.id, req.body)
    res.send(result);
}

exports.addReminderHandler = addReminderHandler;
exports.getReminderHandler = getReminderHandler;
exports.getTodayReminderHandler = getTodayReminderHandler
exports.deleteReminder = deleteReminder;
exports.modifyReminderHandler = modifyReminderHandler;
exports.updateReminderStatusHandler = updateReminderStatusHandler
