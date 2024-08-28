const { database } = require("./database");

const testCategories = [
    { part: "ielts-academic", category: "Ielts Academic" },
    { part: "toeic", category: "Toeic" },
];

const getTests = async (testCategoryURL) => {
    let QUERY = "";

    const category = testCategories.find(
        (item) => item.part === testCategoryURL
    );
    if (category) {
        // if category is specified
        QUERY = `SELECT * FROM tests where testCategory = '${category.category}'`;
    } else {
        // get all tests
        QUERY = `SELECT * FROM tests`;
    }
    console.log(QUERY);
    try {
        const [result] = await database.execute(QUERY);
        return { result: true, data: result };
    } catch (error) {
        console.log(error);
        return { result: false, error };
    }
};

const getTestParts = async (testID) => {
    const QUERY_1 = `SELECT * FROM test_parts where testID = '${testID}' ORDER BY partOrder ASC`;
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
                        sectionArr = sectionArr.concat(
                            JSON.parse(result2[i].sectionArr)
                        );
                        console.log(sectionArr);
                    }
                    console.log(sectionArr);
                    sectionArr = sectionArr
                        .map((item) => `'${item}'`)
                        .join(", ");
                    const QUERY_3 = `SELECT * FROM test_question_sections where id in (${sectionArr}) ORDER BY sectionOrder ASC`;
                    console.log(QUERY_3);
                    try {
                        const [result3] = await database.execute(QUERY_3);
                        console.log(result3);

                        if (result3 && result3.length > 0) {
                            let questionArr = [];
                            for (let i = 0; i < result3.length; i++) {
                                // parse question Arr from section
                                questionArr = questionArr.concat(
                                    JSON.parse(result3[i].questionArr)
                                );
                            }
                            console.log(questionArr);
                            questionArr = questionArr // merge all the question ID to query
                                .map((item) => `'${item}'`)
                                .join(", ");
                            const QUERY_4 = `SELECT id, questionContent, answerArr, qType, questionOrder, partOrder, testID, sectionOrder FROM test_questions where id in (${questionArr}) ORDER BY questionOrder ASC`;
                            try {
                                const [result4] = await database.execute(
                                    QUERY_4
                                );
                                console.log(result4);
                                for (let i = 0; i < result4.length; i++) {
                                    if (result4[i].answerArr)
                                        result4[i].answerArr = JSON.parse(
                                            result4[i].answerArr
                                        );
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
    const QUERY = `SELECT * FROM ${process.env.DB_TABLE_TEST_HISTORIES} WHERE userID = '${userID}' AND testID = '${testID}'`; 
    try {
        const [result] = await database.execute(QUERY);
        if(result.length > 0)
        {
            for(let i = 0; i < result.length; i++)
            {
                result[i].startingTime = new Date(result[i].startingTime + " UTC").toString();
            }
        }
        console.log(result);
        return {result: true, data : result}
    } catch (error) {
        console.log(error)
        return {result: false, error};
    }
}

const saveUserTestProgress = async (userID, testData) => {
    // userID, testID, partArr, resultArr, date, duration
    const { historyID, partArr, duration, startingTime, testID } = testData;
    console.log(testData);
    let answerArr = Object.entries(testData).filter(
        (pair) => pair[0].length == 36
    );
    // console.log(JSON.stringify(answerArr));
    answerArr.forEach((item) => console.log(item));

    let answerArrSQLString = answerArr.map((pair) => `'${pair[0]}'`).join(", ");
    // console.log(answerArrSQLString);
    if (userID) {
        const EVALUATE_QUERY = `SELECT id, answer from ${process.env.DB_TABLE_TEST_QUESTIONS} WHERE id in (${answerArrSQLString})`;
        try {
            const [result] = await database.execute(EVALUATE_QUERY);
            if (result.length > 0) {
                let noOfCorrectQuestions = 0;
                for (let i = 0; i < answerArr.length; i++) {
                    const answer = result.find(
                        (item) => item.id === answerArr[i][0]
                    );
                    if (answer) {
                        if (answerArr[i][1] === answer.answer) {
                            answerArr[i].push(true);
                            noOfCorrectQuestions++;
                        } else {
                            answerArr[i].push(false);
                        }
                    } else {
                        console.log("cannot find the answer");
                    }
                }
                const connection = await database.getConnection();
                try {
                    await connection.beginTransaction();
                    const QUERY = `INSERT INTO ${process.env.DB_TABLE_TEST_HISTORIES} (id, userId, testId, partArr, duration, startingTime, noOfCorrectQuestions, totalQuestions) 
        VALUES ('${historyID}', '${userID}', '${testID}', '${partArr}', ${duration}, '${startingTime}', ${noOfCorrectQuestions}, ${answerArr.length})`;
                    await connection.query(QUERY);

                    for (let i = 0; i < answerArr.length; i++) {
                        const ANSWER_HISTORY_QUERY = `INSERT INTO ${process.env.DB_TABLE_TEST_ANSWER_HISTORIES} (historyID, userID, questionID, answer, testId, result) 
                    VALUES ('${historyID}', '${userID}', '${answerArr[i][0]}', '${answerArr[i][1]}', '${testID}', ${answerArr[i][2]})`;
                        await connection.query(ANSWER_HISTORY_QUERY);
                    }
                    await connection.commit();
                    return {result: true}
                } catch (error) {

                    await connection.rollback();
                    console.error(
                        "Transaction rolled back due to an error:",
                        error
                    );
                    return {result: false, error}
                } finally {
                    connection.release();
                }
            } else {
                console.log("None answer");
            }
            // console.log(answerArr);
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    }
    return { result: false, msg: "User not existed" };
};

module.exports = {
    getTests,
    getTestParts,
    getTestDetailBySelectedPart,
    testCategories,
    getTestHistories,
    saveUserTestProgress,
};
