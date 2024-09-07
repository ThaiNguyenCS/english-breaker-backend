const express = require("express");
const { verifyJWTMiddleware } = require("./auth");
const { getActiveDays } = require("../database/streaks");
const { getFlashcardCollections, createFlashcardCollection, deleteFlashcardCollection, getFlashcardCollectionContent, getCollectionWordsByCollectionID } = require("../database/flashcard");
const router = express.Router();

router.get("/user-data/streaks", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/user-data/streaks");
    const result = await getActiveDays(req.decoded.id);
    return res.send(result);
});

router.get("/flashcard/:id/words", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard/:id");
    console.log(req.query)
    const result = await getCollectionWordsByCollectionID(req.decoded.id, req.params.id, req.query);
    return res.send(result);
})

router.get("/flashcard/:id", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard/:id");
    const result = await getFlashcardCollectionContent(req.decoded.id, req.params.id);
    return res.send(result);
})




router.get("/flashcard", verifyJWTMiddleware, async (req, res) => {
    console.log("GET /data/flashcard");
    const result = await getFlashcardCollections(req.decoded.id);
    return res.send(result);
})



router.post("/create-flashcard-collection", verifyJWTMiddleware, async (req, res) => {
    console.log("POST /data/create-flashcard-collection");
    const result = await createFlashcardCollection(req.decoded.id, req.body);
    return res.send(result);
})

router.delete("/:id/delete", verifyJWTMiddleware, async(req, res) => {
    console.log("delete /data/delete");
    const result = await deleteFlashcardCollection(req.decoded.id, req.params.id);
    return res.send(result);
}
)

module.exports = {
    router
} 