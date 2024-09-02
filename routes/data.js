const express = require("express");
const { verifyJWTMiddleware } = require("./auth");
const { getActiveDays } = require("../database/streaks");
const router = express.Router();

router.get("/user-data/streaks", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/user-data/streaks");
    const result = await getActiveDays(req.decoded.id);
    return res.send(result);
});

module.exports = {
    router
} 