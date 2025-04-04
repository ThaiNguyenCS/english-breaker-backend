const { createHashPassword } = require("../utils/password");
const bcrypt = require("bcrypt");
const { database } = require("./database");
const { generateUUIDV4 } = require("../utils/idManager");

const findUserByGoogleID = async (googleID) => {
    const QUERY = `SELECT * FROM ${process.env.DB_TABLE_USERS} WHERE googleID = ?`;
    try {
        const [result] = await database.execute(QUERY, [googleID]);
        console.log(result);
        if (result.length === 0) {
            // no account
            console.log("No account")
            return { result: true, code: -1 };
        } else {
            // account existed
            console.log("Account existed")
            return { result: true, code: 1, data: result };
        }
    } catch (error) {
        console.log(error);
        return { result: false, error };
    }
};

const storeUser = async (payload) => {
    if (payload.accountType === "google") {
        const INSERT_QUERY = `INSERT INTO ${process.env.DB_TABLE_USERS}
        (id, email, appname, creationDate, accountType, googleID) 
        VALUES (?, ?, ?, CURDATE(), ?, ? )`;
        try {
            const [result] = await database.execute(INSERT_QUERY, [
                generateUUIDV4(),
                payload.email,
                payload.appname,
                "google",
                payload.googleID,
            ]);

            const USER_QUERY = `SELECT * FROM ${process.env.DB_TABLE_USERS} where googleID = ?`;

            const [userData] = await database.execute(USER_QUERY, [payload.googleID]);

            return { result: true, data: userData };
        } catch (error) {
            console.log(error);
            return { result: false, msg: error };
        }
    } else if (payload.accountType === "local") {
        const hashPassword = await createHashPassword(payload.password, 4);

        const QUERY = `INSERT INTO ${process.env.DB_TABLE_USERS}
        (id, email, password, appname, creationDate, accountType) 
        VALUES ("${generateUUIDV4()}", '${payload.email.trim()}', '${hashPassword}', '${payload.userName.trim()}', CURDATE(), "local")`;
        try {
            const [result] = await database.execute(QUERY);
            return { result: true, data: result };
        } catch (error) {
            return { result: false, msg: error };
        }
    } else {
        console.log("No accountType specified");
        return { result: false, msg: "No accountType specified" };
    }
};

const verifyUser = async (payload) => {
    const QUERY = `SELECT * FROM ${process.env.DB_TABLE_USERS} where email = '${payload.email.trim()}'`;
    try {
        const [result] = await database.execute(QUERY);
        if (result.length === 1) {
            const user = result[0];
            console.log(user);
            const isVerified = await bcrypt.compare(payload.password, user.password);
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
    findUserByGoogleID,
};
