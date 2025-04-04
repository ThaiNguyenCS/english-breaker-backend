require("dotenv").config();

module.exports = {
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_TABLE_USERS: process.env.DB_TABLE_USERS || "users",
    DB_TABLE_USER_PROGRESS: process.env.DB_TABLE_USER_PROGRESS || "user_progress",
    DB_TABLE_VIDEOS: process.env.DB_TABLE_VIDEOS || "videos",
    DB_TABLE_TESTS: process.env.DB_TABLE_TESTS || "tests",
    DB_TABLE_TEST_PARTS: process.env.DB_TABLE_TEST_PARTS || "test_parts",
    DB_TABLE_TEST_QUESTION_SECTIONS: process.env.DB_TABLE_TEST_QUESTION_SECTIONS || "test_question_sections",
    DB_TABLE_TEST_QUESTIONS: process.env.DB_TABLE_TEST_QUESTIONS || "test_questions",
    DB_TABLE_TEST_HISTORIES: process.env.DB_TABLE_TEST_HISTORIES || "test_histories",
    DB_TABLE_TEST_ANSWER_HISTORIES: process.env.DB_TABLE_TEST_ANSWER_HISTORIES || "test_answer_histories",
    DB_TABLE_FLASHCARD_COLLECTIONS: process.env.DB_TABLE_FLASHCARD_COLLECTIONS || "flashcard_collections",
    DB_TABLE_SAVED_WORDS: process.env.DB_TABLE_SAVED_WORDS || "saved_words",
    DB_TABLE_FLASHCARD_TEST_HISTORY: process.env.DB_TABLE_FLASHCARD_TEST_HISTORY || "flashcard_test_history",
    DB_TABLE_FLASHCARD_TESTANWSER_HISTORY: process.env.DB_TABLE_FLASHCARD_TESTANWSER_HISTORY || "flashcard_testanswer_history",
    DB_TABLE_REMINDER: process.env.DB_TABLE_REMINDER || "reminder",
    DB_TABLE_REMINDER_INSTANCES: process.env.DB_TABLE_REMINDER_INSTANCES || "reminder_instances",
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    DICTIONARY_API_PATH: process.env.DICTIONARY_API_PATH,
}

