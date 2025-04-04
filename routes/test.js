var { Router } = require('express');
const router = Router();
const { testController } = require('../config/container.js');
const { verifyJWTMiddleware } = require('./auth.js');

router.get("/api/tests/:topic/:id/view", testController.viewTest);
router.get("/api/tests/:topic/:id/practice", verifyJWTMiddleware, testController.practiceTest);
router.get("/api/tests/:topic", verifyJWTMiddleware, testController.getTestByTopic);
router.post("/api/test/practice/save-test-result", verifyJWTMiddleware, testController.saveTestResult);
router.get("/api/test/practice/:id/history", verifyJWTMiddleware, testController.getTestHistories);
router.get("/api/test/:id/result/:historyID", verifyJWTMiddleware, testController.getTestResult);



module.exports = router;