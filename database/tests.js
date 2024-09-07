const { database } = require("./database");

const testCategories = [
    { part: "ielts-academic", category: "Ielts Academic" },
    { part: "toeic", category: "Toeic" },
    { part: "all", category: "All" },
];

const getTests = async (userID, testCategoryURL) => {
    let QUERY = "";
    let categoryQuery = "";
    const category = testCategories.find((item) => item.part === testCategoryURL);
    if (category) {
        // get categoryQuery if existed
        if (category.category !== "All") {
            categoryQuery = ` where t.testCategory = '${category.category}'`;
        }
    } else {
        return { result: false, msg: "There's no specific category" };
    }
    if (userID) {
        // if user's validated
        QUERY = `SELECT t.*, h.userID, h.startingTime FROM ${process.env.DB_TABLE_TESTS} t
        LEFT JOIN (SELECT h.testId, h.userID, h.startingTime
        FROM ${process.env.DB_TABLE_TEST_HISTORIES} h
        JOIN (
            SELECT testId, MAX(startingTime) AS latestAttempt
            FROM ${process.env.DB_TABLE_TEST_HISTORIES}
            GROUP BY testId
        ) latestH ON h.testId = latestH.testId AND h.startingTime = latestH.latestAttempt WHERE h.userID = '${userID}') h ON t.id = h.testID`;
        QUERY += categoryQuery;
        console.log(QUERY);
    } else {
        QUERY = `SELECT * FROM ${process.env.DB_TABLE_TESTS} t`;
        QUERY += categoryQuery;
        console.log(QUERY);
    }
    try {
        const [result] = await database.execute(QUERY);
        return { result: true, data: result };
    } catch (error) {
        console.log(error);
        return { result: false, error };
    }
};

const getTestParts = async (testID) => {
    const QUERY_1 = `SELECT t.title as testTitle, p.* FROM tests t
                    JOIN test_parts p ON
                    t.id = p.testID where testID = '${testID}' ORDER BY partOrder ASC`;
    try {
        const [result1] = await database.execute(QUERY_1);
        console.log(result1);
        return { result: true, data: result1 };
    } catch (error) {
        return { result: false, error };
    }
};

const getTestDetailBySelectedPart = async (testID, partOrder) => {
    const QUERY_1 = `SELECT * FROM tests where id = '${testID}'`;
    try {
        const [result1] = await database.execute(QUERY_1);
        console.log(result1);
        if (result1 && result1.length > 0) {
            // let partArr = JSON.parse(result1[0].partArr);
            // console.log(partArr);
            // let partArrSQL = partArr.map((item) => `'${item}'`).join(", ");
            let QUERY_2 = `SELECT * FROM test_parts where testId = '${testID}'`;
            if (partOrder.length > 0) {
                let partOrderSQLArr = partOrder.map((item) => item).join(", ");
                QUERY_2 = `SELECT * FROM test_parts where testId = '${testID}' AND partOrder in (${partOrderSQLArr})`;
            }
            console.log(QUERY_2);
            try {
                const [result2] = await database.execute(QUERY_2);
                console.log(result2);
                if (result2 && result2.length > 0) {
                    let sectionArr = [];
                    for (let i = 0; i < result2.length; i++) {
                        sectionArr = sectionArr.concat(JSON.parse(result2[i].sectionArr));
                        console.log(sectionArr);
                    }
                    console.log(sectionArr);
                    sectionArr = sectionArr.map((item) => `'${item}'`).join(", ");
                    const QUERY_3 = `SELECT * FROM test_question_sections where id in (${sectionArr}) ORDER BY sectionOrder ASC`;
                    console.log(QUERY_3);
                    try {
                        const [result3] = await database.execute(QUERY_3);
                        console.log(result3);

                        if (result3 && result3.length > 0) {
                            let questionArr = [];
                            for (let i = 0; i < result3.length; i++) {
                                // parse question Arr from section
                                questionArr = questionArr.concat(JSON.parse(result3[i].questionArr));
                            }
                            console.log(questionArr);
                            questionArr = questionArr // merge all the question ID to query
                                .map((item) => `'${item}'`)
                                .join(", ");
                            const QUERY_4 = `SELECT id, questionContent, answerArr, qType, questionOrder, partOrder, testID, sectionOrder FROM test_questions where id in (${questionArr}) ORDER BY questionOrder ASC`;
                            try {
                                const [result4] = await database.execute(QUERY_4);
                                console.log(result4);
                                for (let i = 0; i < result4.length; i++) {
                                    if (result4[i].answerArr) result4[i].answerArr = JSON.parse(result4[i].answerArr);
                                }
                                // return { result: true, data: {questions: result4, partArr, testID}};
                                return {
                                    result: true,
                                    data: {
                                        questions: result4,
                                        sections: result3,
                                        parts: result2,
                                        test: result1[0],
                                    },
                                };
                            } catch (error) {
                                console.log(error);
                                return { result: false, error };
                            }
                        }
                    } catch (error) {
                        console.log(error);
                        return { result: false, error };
                    }
                }
            } catch (error) {
                console.log(error);
                return { result: false, error };
            }
        }
    } catch (error) {
        console.log(error);
        return { result: false, error };
    }
};

const getTestHistories = async (userID, testID) => {
    const QUERY = `SELECT * FROM ${process.env.DB_TABLE_TEST_HISTORIES} h WHERE userID = ? AND testID = ? 
    ORDER BY h.startingTime DESC`;
    try {
        const [result] = await database.execute(QUERY, [userID, testID]);
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                result[i].startingTime = new Date(result[i].startingTime + " UTC").toString();
            }
        }
        console.log(result);
        return { result: true, data: result };
    } catch (error) {
        console.log(error);
        return { result: false, error };
    }
};

const saveUserTestProgress = async (userID, testData) => {
    // userID, testID, partArr, resultArr, date, duration
    const { historyID, partArr, duration, startingTime, testID } = testData;
    console.log(testData);

    let partArrSQLString = JSON.parse(partArr)
        .map((part) => `'${part}'`)
        .join(", ");
    let answerArr = Object.entries(testData).filter((pair) => pair[0].length == 36);
    // console.log(JSON.stringify(answerArr));
    // answerArr.forEach((item) => console.log(item));

    // let answerArrSQLString = answerArr.map((pair) => `'${pair[0]}'`).join(", ");
    // console.log(answerArrSQLString);
    if (userID) {
        const EVALUATE_QUERY = `SELECT id, answer from ${process.env.DB_TABLE_TEST_QUESTIONS} WHERE partOrder in (${partArrSQLString})`;
        try {
            const [result] = await database.execute(EVALUATE_QUERY);
            if (result.length > 0) {
                let noOfCorrectQuestions = 0;
                for (let i = 0; i < result.length; i++) {
                    const answer = answerArr.find((item) => result[i].id === item[0]);
                    if (answer) {
                        const trimAnswer = answer[1].trim();
                        if (trimAnswer) {
                            if (trimAnswer === result[i].answer) {
                                answer.push(1); // true answer
                                noOfCorrectQuestions++;
                            } else {
                                answer.push(-1); // false answer
                            }
                        } else {
                            answer.push(0); // skip question
                        }
                    } else {
                        // questions that user skip. (and the question id is not sent over the form)
                        answerArr.push([result[i].id, "", 0]);
                    }
                }
                // console.log(answerArr);
                const connection = await database.getConnection();
                try {
                    await connection.beginTransaction();
                    const QUERY = `INSERT INTO ${process.env.DB_TABLE_TEST_HISTORIES} (id, userId, testId, partArr, duration, startingTime, noOfCorrectQuestions, totalQuestions) 
        VALUES ('${historyID}', '${userID}', '${testID}', '${partArr}', ${duration}, '${startingTime}', ${noOfCorrectQuestions}, ${result.length})`;
                    await connection.query(QUERY);

                    for (let i = 0; i < answerArr.length; i++) {
                        const ANSWER_HISTORY_QUERY = `INSERT INTO ${process.env.DB_TABLE_TEST_ANSWER_HISTORIES} (historyID, userID, questionID, answer, testId, result) 
                    VALUES ('${historyID}', '${userID}', '${answerArr[i][0]}', '${answerArr[i][1]}', '${testID}', ${answerArr[i][2]})`;
                        await connection.query(ANSWER_HISTORY_QUERY);
                    }
                    await connection.commit();
                    return { result: true };
                } catch (error) {
                    await connection.rollback();
                    console.error("Transaction rolled back due to an error:", error);
                    return { result: false, error };
                } finally {
                    connection.release();
                }
            } else {
                console.log("None questions");
            }
            // console.log(answerArr);
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    }
    return { result: false, msg: "User not existed" };
};

const getTestResult = async (userID, historyID) => {
    if (userID) {
        const HISTORY_QUERY = `SELECT * FROM ${process.env.DB_TABLE_TEST_HISTORIES} h 
        INNER JOIN ${process.env.DB_TABLE_TESTS} t ON t.id = h.testID 
        WHERE h.id = ? AND h.userID = ?`;
        const QUESTION_QUERY = `SELECT h.answer as userAnswer, h.result, q.answer as answer, q.id as questionID, q.questionContent, q.questionOrder, q.partOrder, q.answerArr, q.qType FROM ${process.env.DB_TABLE_TEST_ANSWER_HISTORIES} h
        JOIN ${process.env.DB_TABLE_TEST_QUESTIONS} q ON
        q.id = h.questionID
        WHERE h.historyID = ? AND h.userID = ?
        ORDER BY q.questionOrder ASC`;

        try {
            const [historyResult] = await database.execute(HISTORY_QUERY, [historyID, userID]);
            const [questionResult] = await database.execute(QUESTION_QUERY, [historyID, userID]);
            console.log(historyResult);
            console.log(questionResult);
            if (historyResult.length === 1 && questionResult.length > 0) {
                const partArr = JSON.parse(historyResult[0].partArr);
                const partArrSQLString = partArr.map((part) => `${part}`).join(", ");
                const PART_QUERY = `SELECT partContent, partOrder, audioFile, sectionArr FROM ${process.env.DB_TABLE_TEST_PARTS} WHERE testID = ? AND partOrder in (${partArrSQLString}) ORDER BY partOrder ASC`;
                try {
                    const [partResult] = await database.execute(PART_QUERY, [historyResult[0].testID]);
                    console.log(partResult);
                    return {
                        result: true,
                        data: { historyResult: historyResult[0], questionResult, partResult },
                    };
                } catch (error) {
                    console.log(error);
                    return { result: false, error };
                }
            } else {
                return {
                    result: false,
                    msg: "There's something wrong with history or questionResult",
                };
            }
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    } else {
        return { result: false, error: "No UserId" };
    }
};

module.exports = {
    getTests,
    getTestParts,
    getTestDetailBySelectedPart,
    testCategories,
    getTestHistories,
    saveUserTestProgress,
    getTestResult,
};
