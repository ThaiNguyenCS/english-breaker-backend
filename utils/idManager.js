const { v4: uuid } = require("uuid");

const generateUUIDV4 = () => {
    return uuid();
}

module.exports = {generateUUIDV4}