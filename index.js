const path = require("path");
const express = require("express");
const cors = require("cors");
const { verifyJWTMiddleware, router: authRouter } = require("./routes/auth.js");
const multer = require("multer");
const upload = multer();

const YOUTUBE_VIDEO_TYPE = 0,
    TED_VIDEO_TYPE = 1;

const {
    getTopicsMetadata,
    getVideos,
    getVideoByID,
} = require("./database/videos.js");

const { storeProgress, verifyUser, storeUser } = require("./database/user.js");
const { default: axios } = require("axios");
const {
    getTests,
    getTestParts,
    getTestDetailBySelectedPart,
    saveUserTestProgress,
    getTestHistories,
} = require("./database/tests.js");

var corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(upload.none());
// app.use(express.urlencoded({extended: false}))
app.use("/auth", authRouter);
app.use(express.static("../front_end/dist"));

app.post("/api/save-progress", verifyJWTMiddleware, async (req, res) => { // save progress for dictation
    console.log(req.decoded);
    if (req.decoded.msg) {
        return res.status(401).send("No token");
    } else {
        // save the progress in the database
        const { id: userID, email } = req.decoded;
        const { videoID, videoType, statusArr } = req.body;
        const databaseRes = await storeProgress({
            userID,
            email,
            videoID,
            videoType,
            statusArr,
        });
        res.send(databaseRes);
    }
});

app.get("/api/data/topics", async (req, res) => {
    const result = await getTopicsMetadata();
    console.log(req.headers);
    console.log(result);
    res.send(result);
});

app.get("/api/data/:topic/:id", verifyJWTMiddleware, async (req, res) => {
    const topicName = req.params.topic;
    console.log(req.decoded);
    let userID = undefined;
    if (req.decoded && !req.decoded.msg) {
        // Verified user
        userID = req.decoded.id; // get the userID
    }
    switch (topicName) {
        case "ted-talk": {
            const result = await getVideoByID(
                req.params.id,
                userID,
                TED_VIDEO_TYPE
            );
            console.log(result);
            return res.send(result);
        }
        case "youtube-topic": {
            const result = await getVideoByID(
                req.params.id,
                userID,
                YOUTUBE_VIDEO_TYPE
            );
            console.log(result);
            return res.send(result);
        }
        default:
            return "No exercise";
    }
});

app.get("/api/data/:topic", verifyJWTMiddleware, async (req, res) => {
    const topicName = req.params.topic;
    console.log(req.headers);
    let userID = undefined;
    if (req.decoded && !req.decoded.msg) {
        // Verified user
        userID = req.decoded.id; // get the userID
    }
    switch (topicName) {
        case "ted-talk": {
            const result = await getVideos(TED_VIDEO_TYPE, userID);
            console.log(result);
            return res.send(result);
        }
        case "youtube-topic": {
            const result = await getVideos(YOUTUBE_VIDEO_TYPE, userID);
            console.log(result);
            return res.send(result);
        }
        default:
            return res.send("No topic");
    }
});

app.get("/api/dictionary/:word", async (req, res) => {
    const response = await axios.get(
        `${process.env.DICTIONARY_API_PATH}/${req.params.word}`
    );
    const data = response.data;
    res.json(data);
});

app.get("/api/tests/:topic/:id", async (req, res) => {
    let partArr = [];
    console.log(req.query);
    if (req.query.part) {
        if (typeof req.query.part === "object")
            partArr = req.query.part.map((item) => Number(item));
        else partArr.push(req.query.part);
    }
    let result = null;
    if (partArr.length > 0) {
        result = await getTestDetailBySelectedPart(req.params.id, partArr);
    } else {
        result = await getTestParts(req.params.id);
    }
    return res.send(result);
});

app.get("/api/tests/:topic", async (req, res) => {
    console.log("GET /api/tests/:topic");
    const result = await getTests(req.params.topic);
    return res.send(result);
});

app.get("/api/tests", async (req, res) => {
    console.log("GET /api/tests");
    const result = await getTests("ALL");
    return res.send(result);
});

app.post("/api/test/practice/save-test-result", verifyJWTMiddleware, async (req, res) => {
    console.log(req.body);
    const result = await saveUserTestProgress(req.decoded.id, req.body);
    return res.send(result);
})

app.get("/api/test/practice/:id/history", verifyJWTMiddleware, async (req, res) => {
    const result = await getTestHistories(req.decoded.id, req.params.id);
    return res.send(result);
})

app.get("*", (req, res) => {
    console.log("Request to *");
    res.sendFile(path.join(__dirname, "../front_end/dist/index.html"));
});

app.listen(5000, () => {
    console.log("Server's listening at port 5000");
});

module.exports = app;
