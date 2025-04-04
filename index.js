const express = require("express");
const cors = require("cors");
const { verifyJWTMiddleware, router: authRouter } = require("./routes/auth.js");
const multer = require("multer");
const { default: axios } = require("axios");
const upload = multer();
const morgan = require("morgan");
var cookieParser = require("cookie-parser");

const {
    getTopicsMetadata,
    getVideos,
    getVideoByID,
    YOUTUBE_VIDEO_TYPE,
    TED_VIDEO_TYPE,
    storeProgress,
} = require("./service/videos.js");



const { router: dataRouter } = require("./routes/data.js");
const { router: reminderRouter } = require("./routes/reminder.js");
const { sequelize } = require("./service/database.js");
const testRouter = require("./routes/test.js");
const { DICTIONARY_API_PATH } = require("./config/config.js");

const allowedOrigins = ["http://localhost:5173", "https://thainguyencs.github.io"];

var corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
};

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(morgan()); // logging request
app.use(cors(corsOptions));
app.use(upload.none()); // parse multipart formdata
// app.use(express.urlencoded({extended: false}))
app.use("/auth", authRouter);
app.use("/data", dataRouter);
app.use("/reminder", reminderRouter);
app.use("/", testRouter);
// app.use(express.static("../front_end/dist"));

app.post("/api/save-progress", verifyJWTMiddleware, async (req, res) => {
    // save progress for dictation
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
            const result = await getVideoByID(req.params.id, userID, TED_VIDEO_TYPE);
            console.log(result);
            return res.send(result);
        }
        case "youtube-topic": {
            const result = await getVideoByID(req.params.id, userID, YOUTUBE_VIDEO_TYPE);
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
    const response = await axios.get(`${DICTIONARY_API_PATH}/${req.params.word}`);
    const data = response.data;
    res.json(data);
});

app.get("*", (req, res) => {
    console.log("Request to *");
    return res.status(404).send("Error");
    // res.sendFile(path.join(__dirname, "../front_end/dist/index.html"));
});

sequelize
    .authenticate()
    .then(async () => {
        // await Reminder.sync({alter: true})
        app.listen(5000, () => {
            console.log("Server's listening at port 5000");
        });
    })
    .catch((error) => {
        console.log(error);
    });

module.exports = app;
