const SECRET_STRING = "my_secret_string"; // TEMP
const jwt = require("jsonwebtoken");

const expireDate = new Date("December 31, 9999"); // expires date for cookie

const jwtCookieOption = {
    expires: expireDate
}

function generateJWT(payload) {
    const { email, id, googleID, appname, accountType } = payload;
    const newPayload = { email, id, googleID, appname, accountType };
    const token = jwt.sign(newPayload, SECRET_STRING, {
        expiresIn: "9999 days",
    });
    return token;
}

module.exports = { generateJWT, SECRET_STRING, jwt, jwtCookieOption };
