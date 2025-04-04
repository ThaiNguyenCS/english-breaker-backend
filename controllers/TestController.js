class TestController {
    constructor({ testService }) {
        this.testService = testService;
    }

    viewTest = async (req, res) => {
        let result = await this.testService.getTestParts(req.params.id);
        return res.send(result);
    }

    practiceTest = async (req, res) => {
        let partArr = [];
        console.log(req.query);
        if (req.query.part) {
            if (typeof req.query.part === "object") partArr = req.query.part.map((item) => Number(item));
            else partArr.push(req.query.part);
        }
        const result = await this.testService.getTestDetailBySelectedPart(req.decoded.id, req.params.id, partArr);
        return res.send(result);
    }

    getTestByTopic = async (req, res) => {
        console.log("GET /api/tests/:topic");
        const result = await this.testService.getTests(req.decoded.id, req.params.topic);
        return res.send(result);
    }

    saveTestResult = async (req, res) => {
        console.log(req.body);
        const result = await this.testService.saveUserTestProgress(req.decoded.id, req.body);
        return res.send(result);
    }

    getTestHistories = async (req, res) => {
        console.log("GET /api/test/practice/:id/history");
        const result = await this.testService.getTestHistories(req.decoded.id, req.params.id);
        return res.send(result);
    }

    getTestResult = async (req, res) => {
        console.log("GET /api/test/:id/result/:historyID");
        console.log(req.decoded.id);
        const result = await this.testService.getTestResult(req.decoded.id, req.params.historyID);
        return res.send(result);
    }

}

module.exports = TestController;