const express = require("express");
const router = express.Router();
const { verifyUser, storeUser } = require("../database/user");
const dotenv = require("dotenv").config({ path: "./.env" });
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const cors = require("cors");

const SECRET_STRING = "my_secret_string";
// console.log(process.env.DB_TABLE_USERS);
router.use(cookieParser());

router.use(
    cors({
        origin: "http://localhost:5173", // Your React frontend URL
        credentials: true, // Allow cookies to be sent
    })
);

function verifyJWTMiddleware(req, res, next) {
    const { authorization } = req.headers;
    console.log(authorization)
    if (authorization) {
        const token = authorization.split(" ")[1];
        if (token !== 'no_token') { 
            try {
                const decoded = jwt.verify(token, SECRET_STRING);
                req.decoded = decoded;
                return next();
            } catch (error) {
                console.log(error)
                return res.status(401).send(error); 
            }
        } else {
            // return res.status(401).send("No token");
            req.decoded = {msg: "No token"}
            return next();
        }
    }
    // return res.status(401).send("No authorization");
    req.decoded = {msg: "No authorization header"}
    return next();
}

function generateJWT({ email, id }) {
    const token = jwt.sign({ email, id }, SECRET_STRING, {
        expiresIn: "9999 days",
    });
    return token;
}

router.post("/login", async (req, res) => {
    console.log(req.body);
    const result = await verifyUser(req.body);
    console.log(result);
    if (result.result) {
        const token = generateJWT(result.data);
        const expireDate = new Date("December 31, 9999"); // never expires
        res.cookie("token", "fucfuc", {     
            secure: true, 
            sameSite: "none",
            expires: expireDate
        });
        return res.send({ ...result, token });
    }
    res.send(result);
});

router.post("/register", async (req, res) => {
    console.log(req.body);
    const result = await storeUser(req.body);
    res.send(result);
});

router.get("/verify", verifyJWTMiddleware, (req, res) => {
    console.log(req.decoded);
    res.send(req.decoded);
});

module.exports = {router, verifyJWTMiddleware};