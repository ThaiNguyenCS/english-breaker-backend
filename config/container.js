const TestController = require("../controllers/TestController");
const TestService = require("../service/TestService");

const testService = new TestService()

const testController = new TestController({
    testService: testService
});

module.exports = { testController };


