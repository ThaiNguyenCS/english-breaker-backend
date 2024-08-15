const mysql = require("mysql2/promise");

const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "map123",
    database: "english_breaker",
});

const getYoutubeVideoByID = async (id) => {
    const QUERY = `SELECT id, title, videoID, timeline, noOfQuestions FROM youtube_exercise where id = '${id}'`;
    try {
        const [result] = await database.execute(QUERY);
        return { status: true, data: result };
    } catch (error) {
        return { status: false, error };
    }
};

const getYoutubeVideos = async () => {
    const QUERY = `SELECT title, id, noOfQuestions FROM youtube_exercise`;
    try {
        const [result] = await database.execute(QUERY);
        return { status: true, data: result };
    } catch (error) {
        return { status: false, error };
    }
};

const getTedTalkVideoByID = async (id) => {
    const QUERY = `SELECT id, title, videoID, timeline, noOfQuestions FROM ted_talk where id = '${id}'`;
    try {
        const [result] = await database.execute(QUERY);
        return { status: true, data: result };
    } catch (error) {
        return { status: false, error };
    }
};

const getTedTalkVideos = async () => {
    const QUERY = `SELECT title, id, noOfQuestions FROM ted_talk`;
    try {
        const [result] = await database.execute(QUERY);
        return { status: true, data: result };
    } catch (error) {
        return { status: false, error };
    }
};

const getTopicsMetadata = async () => {
    const QUERY = `SELECT topicName, tableName, url FROM topics`;
    const response = [];
    try {
        const [result] = await database.execute(QUERY);
        console.log(result)
        for (let i = 0; i < result.length; i++) {
            const SECOND_QUERY = `SELECT COUNT(*) AS noOfExercises FROM ${result[i].tableName}`;
            try {
                const [miniResult] = await database.execute(SECOND_QUERY);
                console.log(miniResult);
                response.push({
                    topicName: result[i].topicName,
                    url: result[i].url,
                    noOfExercises: miniResult[0].noOfExercises,

                })
            } catch (error) {
                return {status: true, error}
            }
        }
        return {status: true, data: response};
    } catch (error) {return {status: true, error}}
};

module.exports = { getYoutubeVideos, getYoutubeVideoByID, getTopicsMetadata, getTedTalkVideos, getTedTalkVideoByID };
