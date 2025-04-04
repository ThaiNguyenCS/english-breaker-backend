const { calculateNextDueDate } = require("../utils/flashcard");
const { handleFormInput } = require("../utils/handleInput");
const { database } = require("./database");
const { generateUUIDV4 } = require("../utils/idManager");

////////////////////////////////////////////// CREATE //////////////////////////////////////////////

const createFlashcardCollection = async (userID, data) => {
    if (userID) {
        const QUERY = `INSERT INTO ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} (id, title, description, creationDate, userID) VALUES ('${data.id}', '${data.title}', '${data.description}', NOW(), '${userID}')`;
        try {
            const [result] = await database.execute(QUERY);
            console.log(result);
            return { result: true, data: result };
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    } else {
        console.log("No userID");
        return { result: false, msg: "No userID" };
    }
};

const addWordToCollection = async (userID, wordData) => {
    // Missing feature: audioURL
    console.log(wordData);
    wordData.word = handleFormInput(wordData.word);
    wordData.definition = handleFormInput(wordData.definition);
    wordData.example = handleFormInput(wordData.example);
    if (userID) {
        const QUERY = `INSERT INTO ${process.env.DB_TABLE_SAVED_WORDS} (id, word, wordDef, collectionID, example, savedDate, userID) VALUES('${wordData.id}', '${wordData.word}', '${wordData.definition}', '${wordData.collectionID}', '${wordData.example}', NOW(), '${userID}')`;
        try {
            const [result] = await database.execute(QUERY);
            return { result: true, data: result };
        } catch (error) {
            console.log("error " + error);
            return { result: false, error };
        }
    } else {
        return { result: false, msg: "NULL userID" };
    }
};

/* 
    1. Create a history instance
    2. Save user's answers for each word instance
*/
const saveTestAttempt = async (userID, collectionID, { words, testResult}) => {

    let parsedWords = JSON.parse(words);
    if (userID && collectionID) {
        const connection = await database.getConnection();
        try {
            await connection.beginTransaction();
            const testID = generateUUIDV4();

            const DUMMY_QUERY = `INSERT INTO ${process.env.DB_TABLE_FLASHCARD_TEST_HISTORY} (id, userID, collectionID, testDate, result, total) values (?, ?, ?, NOW(), ?, ?)`;
            const result = await connection.execute(DUMMY_QUERY, [
                testID,
                userID,
                collectionID,
                testResult,
                parsedWords.length,
            ]);

            for(let i = 0; i < parsedWords.length; i++)
            {
                let QUERY = `INSERT INTO ${process.env.DB_TABLE_FLASHCARD_TESTANWSER_HISTORY} (wordID, testID, userID, userAnswer) VALUES (?, ?, ?, ?)`
                await connection.execute(QUERY, [
                    parsedWords[i].id,
                    testID,
                    userID,
                    parsedWords[i].answer
                ]);
            }
            await connection.commit();
            return {result: true}
        } catch (error) {
            console.log(error);
            await connection.rollback();
            return { result: false, error };
        } finally {
            connection.release();
        }

    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

////////////////////////////////////////////// READ //////////////////////////////////////////////

const getFlashcardCollections = async (userID) => {
    if (userID) {
        const QUERY = `SELECT * FROM ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} c 
        LEFT JOIN (SELECT collectionID, COUNT(*) AS noOfWords FROM ${process.env.DB_TABLE_SAVED_WORDS} GROUP BY collectionID) sw
        ON sw.collectionID = c.id
        WHERE c.userID = ?
        ORDER BY c.title ASC`;
        try {
            const [result] = await database.execute(QUERY, [userID]);
            console.log(result);
            return { result: true, data: result };
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    } else {
        console.log("No userID");
        return { result: false, msg: "No userID" };
    }
};

const getFlashcardCollection = async (userID, collectionID) => {
    if (userID && collectionID) {
        const QUERY = `SELECT * FROM ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} c
        LEFT JOIN (SELECT collectionID, COUNT(*) as noOfWords FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ? GROUP BY collectionID ) sw ON sw.collectionID = c.id WHERE c.userID = ? AND c.id = ?`;
        try {
            const [collectionResult] = await database.execute(QUERY, [userID, collectionID, userID, collectionID]);
            console.log(collectionResult);
            if (collectionResult.length < 1) {
                console.log("No collection");
                return { result: false, msg: "No collection" };
            }

            return { result: true, data: { collection: collectionResult[0] } };
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

const getCollectionWordsByCollectionID = async (userID, collectionID, queryParams) => {
    if (userID && collectionID) {
        const words = {};
        console.log(queryParams);
        for (let i = 1; i <= Object.keys(queryParams).length / 2; i++) {
            let limit = Number(queryParams[`limit${i}`]);
            let start = Number(queryParams[`start${i}`]);
            let WORD_QUERY = `SELECT * FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ?
                ORDER BY savedDate DESC LIMIT ${limit} OFFSET ${start}`;
            try {
                const [result] = await database.execute(WORD_QUERY, [userID, collectionID]);
                words[`result${i}`] = { result, start: start, limit: limit };
            } catch (error) {
                console.log(error);
                words[`result${i}`] = { error, result: false, start: start, limit: limit };
            }
        }
        return { result: true, data: words };
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

const getPracticeWords = async (userID, collectionID, queryParams) => {
    const limit = queryParams?.limit;
    console.log({userID, collectionID, queryParams});
    
    if (userID && collectionID) {
        let QUERY = `SELECT * FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ?
                ORDER BY lastAttemptDate`;
        if (limit) {
            // if limit existed
            QUERY += ` ASC LIMIT ${limit}`;
        }
        const [result] = await database.execute(QUERY, [userID, collectionID]);
        console.log(result);
        return { result: true, data: result };
    } else {
        console.log("NULL userID or NULL collectionID or NULL limit");
        return { result: false, msg: "NULL userID or NULL collectionID or NULL limit" };
    }
};

////////////////////////////////////////////// UPDATE //////////////////////////////////////////////

const saveFlashcardAttempt = async (userID, collectionID, { words }) => {
    // wordArr needs wordID, lastAttemptDate, learningTime
    console.log({ userID, collectionID, words });
    const wordArr = JSON.parse(words);
    if (userID && collectionID) {
        calculateNextDueDate(wordArr);
        const connection = await database.getConnection();

        try {
            await connection.beginTransaction();
            const now = new Date(Date.now()); // for consistent learning time
            for (let i = 0; i < wordArr.length; i++) {
                let QUERY = `UPDATE ${process.env.DB_TABLE_SAVED_WORDS} SET dueDate = ?, learningTime = ?, lastAttemptDate = ? WHERE id = ? `;
                await connection.execute(QUERY, [wordArr[i].dueDate, wordArr[i].learningTime, now, wordArr[i].id]);
            }
            await connection.commit();
            return { result: true };
        } catch (error) {
            console.log(error);
            await connection.rollback();
            return { result: false };
        } finally {
            connection.release();
        }
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

const modifyFlashcardCollection = async (userID, collectionID, modifiedCollection) => {
    const {title, description} = modifiedCollection;
    if (userID && collectionID) {
        const QUERY = `UPDATE ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} SET title = ?, description = ? WHERE id = ? AND userID = ?`;
        try {
            const [result] = await database.execute(QUERY, [title, description, collectionID, userID])
            return {result: true, data: result}
        } catch (error) {
            console.log(error);
            return { result: false, error };    
        }
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

////////////////////////////////////////////// DELETE //////////////////////////////////////////////

const deleteFlashcardCollection = async (userID, collectionID) => {
    if (userID && collectionID) {
        const connection = await database.getConnection();
        try {
            await connection.beginTransaction();
            const QUERY = `DELETE FROM ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} WHERE userID = ? AND id = ?`;
            const [result] = await connection.execute(QUERY, [userID, collectionID]);
            const QUERY2 = `DELETE FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ?`;
            const [result2] = await connection.execute(QUERY2, [userID, collectionID]);
            await connection.commit();
            return { result: true, data: { result, result2 } };
        } catch (error) {
            console.log("rollback " + error);
            await connection.rollback();
            return { result: false, error };
        } finally {
            connection.release();
        }
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

const deleteWordInAColection = async (userID, wordMetadata) => {
    if (userID && wordMetadata?.id && wordMetadata?.wordID) {
        const QUERY = `DELETE FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ? AND id = ?`;
        try {
            const [result] = await database.execute(QUERY, [userID, wordMetadata.id, wordMetadata.wordID]);
            console.log("DELETE OK");
            return { result: true, data: result };
        } catch (error) {
            console.log(error);
            return { result: false, error };
        }
    } else {
        console.log("NULL userID or NULL collectionID or NULL wordID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

module.exports = {
    getFlashcardCollections,
    deleteFlashcardCollection,
    getFlashcardCollection,
    createFlashcardCollection,
    getCollectionWordsByCollectionID,
    addWordToCollection,
    deleteWordInAColection,
    getPracticeWords,
    saveFlashcardAttempt,
    saveTestAttempt,
    modifyFlashcardCollection,
};
