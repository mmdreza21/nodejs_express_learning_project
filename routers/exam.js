const express = require('express')
const ExamCo = require('../controllers/examCo')
const auth = require('../middlewares/auth')
const isTeacher = require('../middlewares/isteacher')
const router = express.Router()

const objectId = require('../middlewares/objectid');

router.post('/', [auth], ExamCo.newExam)
router.get('/teacher/:id', [auth, objectId], ExamCo.getTeacherExam)
router.get('/lang/:id', [auth, objectId], ExamCo.getLevelLangExam)
router.get('/lang', [auth], ExamCo.getLangExam)
router.get('/', [auth], ExamCo.getAll)
router.put('/:id', [auth], ExamCo.editExam)
router.delete('/:id', [auth], ExamCo.removeExam)


//!examing
router.post('/testing', [auth], ExamCo.exam)

module.exports = router


