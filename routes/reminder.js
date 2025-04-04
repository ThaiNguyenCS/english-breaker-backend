const express = require("express");
const { verifyJWTMiddleware } = require("./auth");
const router = express.Router();
const reminderController = require("../controllers/reminderController");


router.get("/today", verifyJWTMiddleware, reminderController.getTodayReminderHandler)
router.patch("/:id", verifyJWTMiddleware, reminderController.updateReminderStatusHandler)

router.post("/", verifyJWTMiddleware, reminderController.addReminderHandler)

router.get("/", verifyJWTMiddleware, reminderController.getReminderHandler)


module.exports = {router}