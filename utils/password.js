const bcrypt = require("bcrypt")

async function createHashPassword(plainPassword, saltRounds)
{
    const result = await bcrypt.hash(plainPassword, saltRounds);
    console.log(result)
    return result
}

exports.createHashPassword = createHashPassword;
