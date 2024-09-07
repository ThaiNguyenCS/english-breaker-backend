const { database } = require("./database");

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

const getFlashcardCollections = async (userID) => {
    if (userID) {
        const QUERY = `SELECT * FROM ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} c 
        LEFT JOIN (SELECT collectionID, COUNT(*) AS noOfWords FROM ${process.env.DB_TABLE_SAVED_WORDS} GROUP BY collectionID) sw
        ON sw.collectionID = c.id
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

const getFlashcardCollectionContent = async (userID, collectionID) => {
    if (userID && collectionID) {
        const QUERY = `SELECT * FROM ${process.env.DB_TABLE_FLASHCARD_COLLECTIONS} c
        JOIN (SELECT collectionID, COUNT(*) as noOfWords FROM ${process.env.DB_TABLE_SAVED_WORDS} WHERE userID = ? AND collectionID = ? GROUP BY collectionID ) sw ON sw.collectionID = c.id WHERE c.userID = ? AND c.id = ?`;
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
                ORDER BY id LIMIT ${limit} OFFSET ${start}`;
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

const modifyFlashcardCollection = async (userID, collectionID, modifiedCollection) => {
    if (userID && collectionID) {
    } else {
        console.log("NULL userID or NULL collectionID");
        return { result: false, msg: "NULL userID or NULL collectionID" };
    }
};

module.exports = {
    getFlashcardCollections,
    deleteFlashcardCollection,
    getFlashcardCollectionContent,
    createFlashcardCollection,
    getCollectionWordsByCollectionID,
};
