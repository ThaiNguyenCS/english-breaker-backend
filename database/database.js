const mysql = require("mysql2/promise");


const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "map123",
    database: "english_breaker",
});


module.exports = {database};

