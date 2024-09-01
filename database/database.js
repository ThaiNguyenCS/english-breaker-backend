const mysql = require("mysql2/promise");


const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "map123",
    database: "english_breaker",
    multipleStatements: true  // Enable multiple statements
});


module.exports = {database};

