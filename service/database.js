const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");
require("dotenv").config({ path: "./.env" });
console.log(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: "localhost",
    dialect: "mysql",
});



const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "map123",
    database: "english_breaker",
    multipleStatements: true, // Enable multiple statements
});

module.exports = { database, sequelize };
