const { createHashPassword } = require("../service/password");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const {database} = require("./database");

const storeUser = async (payload) => {
    const hashPassword = await createHashPassword(payload.password, 4);

    const QUERY = `INSERT INTO ${process.env.DB_TABLE_USERS}
    (id, email, password, appname, creationDate) 
    VALUES ("${uuid()}", '${payload.email.trim()}', '${hashPassword}', '${payload.userName.trim()}', CURDATE())`;
    try {
        const [result] = await database.execute(QUERY);
        return { result: true, data: result };
    } catch (error) {
        return { result: false, msg: error };
    }
};

const storeProgress = async (payload) => {
    let { statusArr, videoID, userID, videoType } = payload;
    const completeCounts = statusArr.reduce(
        (accumulator, statusCode) => accumulator + (statusCode === 1 ? 1 : 0),
        0
    );
    statusArr = JSON.stringify(statusArr);
    // console.log(
    //     `videoId = ${videoID}, userId = ${userID}, videoType = ${videoType}, result = ${result}`
    // );
    try {
        const FIND_QUERY = `SELECT * FROM ${process.env.DB_TABLE_USER_PROGRESS} WHERE videoID = '${videoID}' AND userID = '${userID}'`;
        const [result] = await database.execute(FIND_QUERY);
        if (result) {
            if (result.length === 0) {
                const QUERY = `INSERT INTO ${process.env.DB_TABLE_USER_PROGRESS} (videoId, userID, videoType, result, resultArr)
                VALUES('${videoID}', '${userID}', ${videoType}, ${completeCounts}, '${statusArr}')`;
                try {
                    const [result] = await database.execute(QUERY);
                    return {
                        result: true,
                        msg: "Save progress OK",
                        data: result,
                    };
                } catch (error) {
                    return { result: false, msg: "Save progress fail", error };
                }
            } else if (result.length === 1) {
                const UPDATE_QUERY = `UPDATE ${process.env.DB_TABLE_USER_PROGRESS} 
                SET result = ${completeCounts}, resultArr = '${statusArr}' 
                WHERE videoID = '${videoID}' AND userID = '${userID}'`;
                try {
                    const [result] = await database.execute(UPDATE_QUERY);
                    return {
                        result: true,
                        msg: "Update progress OK",
                        data: result,
                    };
                } catch (error) {
                    return {
                        result: false,
                        msg: "Update progress fail",
                        error,
                    };
                }
            }
        }
    } catch (error) {
        return { result: false, msg: "Get previous progress fail", error };
    }
};

const verifyUser = async (payload) => {
    const QUERY = `SELECT * FROM ${
        process.env.DB_TABLE_USERS
    } where email = '${payload.email.trim()}'`;
    try {
        const [result] = await database.execute(QUERY);
        if (result.length === 1) {
            const user = result[0];
            console.log(user);
            const isVerified = await bcrypt.compare(
                payload.password,
                user.password
            );
            if (isVerified) {
                return {
                    result: true,
                    msg: "Passed",
                    statusCode: 1,
                    data: user,
                };
            } else {
                return { result: false, msg: "Wrong password", statusCode: 0 };
            }
        } else {
            return {
                result: false,
                msg: "There's no account with that email",
                statusCode: -1,
            };
        }
    } catch (error) {
        return { result: false, msg: error };
    }
};

module.exports = {
    verifyUser,
    storeUser,
    storeProgress,
};
