const express = require("express");
const router = express.Router();
const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const { verifyUser, storeUser, findUserByGoogleID } = require("../service/user");
require("dotenv").config({ path: "./.env" });

const cors = require("cors");
const { generateJWT, SECRET_STRING, jwt, jwtCookieOption } = require("../utils/user");

router.use(
    cors({
        origin: "http://localhost:5173", // Your React frontend URL
        credentials: true, // Allow cookies to be sent
    })
);

function verifyJWTMiddleware(req, res, next) {
    console.log(req.cookies);
    const { jwt_token } = req.cookies;
    if (jwt_token) {

        try {
            const decoded = jwt.verify(jwt_token, SECRET_STRING);
            req.decoded = decoded;
            return next();
        } catch (error) {
            console.log(error);
            console.log("Token error", error)
            return res.status(401).send(error);
        }
    } else {
        // return res.status(401).send("No token");
        console.log("No token")
        req.decoded = { msg: "No token" };
        return next();
    }
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/login/google/callback",
            passReqToCallback: true,
        },
        async function (request, accessToken, refreshToken, profile, done) {
            console.log(profile);
            const result = await findUserByGoogleID(profile.id);
            if (result.result) {
                let user = null;
                let error = null;
                if (result.code === 1) {
                    // user existed
                    user = result.data[0];
                    console.log("Existed", user);
                } else {
                    const createResult = await storeUser({
                        googleID: profile.id,
                        appname: profile.displayName,
                        email: profile.emails[0].value,
                        accountType: "google",
                    });
                    if (createResult.result) {
                        // create successfully
                        user = createResult.data[0];
                    } else {
                        // create failed
                        error = createResult.error;
                    }
                }
                return done(error, user);
            } else {
                return done(result.error, null);
            }
        }
    )
);
router.get("/login/google", passport.authenticate("google", { scope: ["email", "profile"], session: false }));

router.get(
    "/login/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/auth/login/google/failure",
    }),
    (req, res) => {
        if (req.user) {
            const token = generateJWT(req.user);
            res.cookie("jwt_token", token, jwtCookieOption);
            return res.redirect("http://localhost:5173/home?verifyLogin=true");
        }
    }
);

router.get("/login/google/failure", (req, res) => {
    console.log("Fail");
    res.redirect("http://localhost:5173/login"); // redirect to login page
});

router.post("/login", async (req, res) => {
    console.log(req.body);
    const result = await verifyUser(req.body);
    console.log(result);
    if (result.result) {
        console.log("here");
        const token = generateJWT(result.data);

        res.cookie("jwt_token", token, jwtCookieOption);
        // return res.redirect("http://localhost:5173/home");
        return res.send({ ...result, token });
    } else {
        res.status(401).send("Login failed");
    }
});

router.post("/register", async (req, res) => {
    console.log(req.body);
    req.body.accountType = "local"; // mark this account local
    const result = await storeUser(req.body);
    res.send(result);
});

router.post("/logout", async (req, res) => {
    res.clearCookie("jwt_token", jwtCookieOption);
    res.send({ result: true });
});

router.get("/verify", verifyJWTMiddleware, (req, res) => {
    console.log(req.decoded);
    res.send(req.decoded);
});

module.exports = { router, verifyJWTMiddleware };
