const { database } = require("./database");

const YOUTUBE_VIDEO_TYPE = 0,
    TED_VIDEO_TYPE = 1;

const getVideoByID = async (id, userID, videoType) => {
    let QUERY = `SELECT * FROM ${process.env.DB_TABLE_VIDEOS}`;
    // user existed
    if (userID) {
        QUERY += ` INNER JOIN ${process.env.DB_TABLE_USER_PROGRESS} ON ${process.env.DB_TABLE_VIDEOS}.id = ${process.env.DB_TABLE_USER_PROGRESS}.videoID
WHERE ${process.env.DB_TABLE_USER_PROGRESS}.userID = '${userID}' AND ${process.env.DB_TABLE_VIDEOS}.videoType = ${videoType}`;
        try {
            const [result] = await database.execute(QUERY);
            if (result.length === 0) {
                // not done before
                const QUERY2 = `SELECT * FROM ${process.env.DB_TABLE_VIDEOS} WHERE id = '${id}' AND ${process.env.DB_TABLE_VIDEOS}.videoType = ${videoType}`;
                try {
                    const [result2] = await database.execute(QUERY2);
                    return { status: true, data: result2, isSaved: false };
                } catch (error) {
                    return { status: false, msg: error };
                }
            } // done this exercise before
            else {
                return { status: true, data: result, isSaved: true };
            }
        } catch (error) {
            return { status: false, msg: error };
        }
    } else {
        // QUERY += ` WHERE id = '${id}' AND ${process.env.DB_TABLE_VIDEOS}.videoType = ${videoType}`;
        // try {
        //     const [result] = await database.execute(QUERY);
        //     return { status: true, data: result, auth: false };
        // } catch (error) {
        //     return { status: false, msg: error };
        // }
        return { status: true, data: [] };
    }
};

const getVideos = async (videoType, userID) => {
    let QUERY = "";
    if (userID) {
        QUERY = `SELECT v.id, v.youtubeID, v.noOfQuestions, v.title, v.videoType, u.result FROM ${process.env.DB_TABLE_VIDEOS} v 
        LEFT JOIN ${process.env.DB_TABLE_USER_PROGRESS} u
        ON v.id = u.videoID
        WHERE v.videoType = ${videoType}; `;
    }
    else
    {
        QUERY = `SELECT v.id, v.youtubeID, v.noOfQuestions, v.title, v.videoType FROM ${process.env.DB_TABLE_VIDEOS} v WHERE v.videoType = ${videoType}; `;
    }

    console.log(QUERY)
    try {
        const [result] = await database.execute(QUERY);
        return { status: true, data: result };
    } catch (error) {
        return { status: false, error };
    }
};

const getTopicsMetadata = async () => {
    const QUERY = `SELECT topicName, url, videoType FROM topics`;
    const response = [];
    try {
        const [result] = await database.execute(QUERY);
        console.log(result);
        for (let i = 0; i < result.length; i++) {
            const SECOND_QUERY = `SELECT COUNT(*) AS noOfExercises FROM ${process.env.DB_TABLE_VIDEOS} WHERE videoType = ${result[i].videoType}`;
            try {
                const [miniResult] = await database.execute(SECOND_QUERY);
                console.log(miniResult);
                response.push({
                    topicName: result[i].topicName,
                    url: result[i].url,
                    noOfExercises: miniResult[0].noOfExercises,
                });
            } catch (error) {
                return { status: true, error };
            }
        }
        return { status: true, data: response };
    } catch (error) {
        return { status: true, error };
    }
};

module.exports = {
    getVideoByID,
    getTopicsMetadata,
    getVideos,
    YOUTUBE_VIDEO_TYPE,
    TED_VIDEO_TYPE
};
