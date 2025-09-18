const express = require('express');
const objectId = require('../middlewares/objectid');
const router = express.Router()

const QuizCo = require('../controllers/quizCo');
const auth = require('../middlewares/auth');
const isTeacher = require('../middlewares/isteacher');
const { quiz } = require('../middlewares/upload');


//! techer part 
router.post('/create', [auth, isTeacher], QuizCo.addQuiz)
router.patch('/score', [auth, isTeacher], QuizCo.score)
router.post('/uploadquiz', [auth, isTeacher], quiz.single('pdf'), QuizCo.uploadquiz)

//! student part
router.get('/getQuiz/:id', auth)
router.patch('/answer/:id', [auth, objectId], QuizCo.answer)
router.patch('/uploadanswer/:id', [auth, objectId], quiz.single("pdf"), QuizCo.uploadAnswer)

//!get part
router.get('/getanswers/:id', [auth, isTeacher], QuizCo.getAnswers)
router.get('/query/search', QuizCo.getByQuery)

router.delete('/:id', QuizCo.removeQuiz)


module.exports = router