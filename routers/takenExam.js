const express = require('express')
const TakenExamCo = require('../controllers/takenExamCo')
const auth = require('../middlewares/auth')
const isteacher = require('../middlewares/isteacher')
const router = express.Router()



router.get('/', [auth], TakenExamCo.getForStudent)
router.get('/:id', [auth, isteacher], TakenExamCo.getForTecher)


module.exports = router

