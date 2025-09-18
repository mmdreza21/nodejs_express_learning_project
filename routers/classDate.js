const express = require('express')
const router = express.Router()

const auth = require('../middlewares/auth')
const isTeacher = require('../middlewares/isteacher')
const classDateCo = require('../controllers/classDateCo')

router.post('/', [auth, isTeacher], classDateCo.postDate)
router.get('/query', classDateCo.getByQuery)
router.get('/studentDate', [auth], classDateCo.getForStudent)
router.patch('/:id', [auth, isTeacher], classDateCo.editDate)
router.delete('/:id', [auth, isTeacher], classDateCo.removeDate)

module.exports = router