const path = require("path");
const express = require("express");

const {
    getYoutubeVideoByID,
    getYoutubeVideos,
    getTopicsMetadata,
    getTedTalkVideos,
    getTedTalkVideoByID,
} = require("./database");

const app = express();
app.use(express.static("../front_end/dist"));

app.get("/data/topics", async (req, res) => {
    const result = await getTopicsMetadata();
    console.log(result);
    res.send(result);
});

app.get("/data/:topic/:id", async (req, res) => {
    const topicName = req.params.topic;
    switch (topicName) {
        case "ted-talk": {
            const result = await getTedTalkVideoByID(req.params.id);
            console.log(result);
            return res.send(result);
        }
        case "youtube-topic": {
            const result = await getTedTalkVideoByID(req.params.id);
            console.log(result);
            return res.send(result);
        }
        default:
            return "No exercise";
    }
});

app.get("/data/:topic", async (req, res) => {
    const topicName = req.params.topic;
    console.log(topicName)
    switch (topicName) {
        case "ted-talk": {
            const result = await getTedTalkVideos();
            console.log(result);
            return res.send(result);
        }
        case "youtube-topic": {
            const result = await getYoutubeVideos();
            console.log(result);
            return res.send(result);
        }
        default:
            return "No topic";
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../front_end/dist/index.html"));
});

app.listen(5000, () => {
    console.log("Server's listening");
});

module.exports = app;
