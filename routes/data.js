const express = require("express");
const { verifyJWTMiddleware } = require("./auth");
const { getActiveDays } = require("../service/streaks");
const {
    getFlashcardCollections,
    createFlashcardCollection,
    deleteFlashcardCollection,
    getCollectionWordsByCollectionID,
    addWordToCollection,
    getFlashcardCollection,
    deleteWordInAColection,
    getPracticeWords,
    saveFlashcardAttempt,
    saveTestAttempt,
    modifyFlashcardCollection,
} = require("../service/flashcard");
const router = express.Router();

router.get("/user-data/streaks", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/user-data/streaks");
    const result = await getActiveDays(req.decoded.id);
    return res.send(result);
});

router.delete("/flashcard/:id/words/:wordID", verifyJWTMiddleware, async (req, res) => {
    console.log("DELETE /data/flashcard/:id/words/:wordID");
    const result = await deleteWordInAColection(req.decoded.id, req.params);
    return res.send(result);
});

router.get("/flashcard/:id/practice-words", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard/:id/practice-words");
    console.log(req.query);
    const wordResult = await getPracticeWords(req.decoded.id, req.params.id, req.query);
    const collectionResult = await getFlashcardCollection(req.decoded.id, req.params.id);
    return res.send({ words: wordResult, collection: collectionResult });
});

router.put("/flashcard/:id/practice-words", verifyJWTMiddleware, async (req, res) => {
    console.log("PUT /data/flashcard/:id/practice-words");
    const result = await saveFlashcardAttempt(req.decoded.id, req.params.id, req.body);
    return res.send(result);
});

router.post("/flashcard/:id/test-result", verifyJWTMiddleware, async (req, res) => {
    console.log("POST /data/flashcard/:id/test-result");
    const result = await saveTestAttempt(req.decoded.id, req.params.id, req.body);
    return res.send(result);
});

router.get("/flashcard/:id/words", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard/:id/words");
    console.log(req.query);
    const result = await getCollectionWordsByCollectionID(req.decoded.id, req.params.id, req.query);
    return res.send(result);
});

router.post("/flashcard/:id/add-word", verifyJWTMiddleware, async (req, res) => {
    console.log("POST /data/flashcard/:id/add-word");
    const result = await addWordToCollection(req.decoded.id, req.body);
    return res.send(result);
});

router.delete("/flashcard/:id/delete", verifyJWTMiddleware, async (req, res) => {
    console.log("delete /data/delete");
    const result = await deleteFlashcardCollection(req.decoded.id, req.params.id);
    return res.send(result);
});

router.get("/flashcard/:id", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard/:id");
    const result = await getFlashcardCollection(req.decoded.id, req.params.id);
    return res.send(result);
});

router.patch("/flashcard/:id", verifyJWTMiddleware, async (req, res) => {
    console.log("PATCH /data/flashcard/:id");
    const result = await modifyFlashcardCollection(req.decoded.id, req.params.id, req.body);
    return res.send(result);
});

router.get("/flashcard", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard");
    const result = await getFlashcardCollections(req.decoded.id);
    return res.send(result);
});

router.post("/flashcard-collection", verifyJWTMiddleware, async (req, res) => {
    console.log("POST /data/flashcard-collection");
    const result = await createFlashcardCollection(req.decoded.id, req.body);
    return res.send(result);
});

module.exports = {
    router,
};
