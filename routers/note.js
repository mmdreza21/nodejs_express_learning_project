const express = require('express')
const noteCo = require('../controllers/noteCo')
const router = express.Router()

const auth = require('../middlewares/auth');

router.post('/', auth, noteCo.createNote)
router.get('/', auth, noteCo.getForUser)
router.put('/:id', auth, noteCo.updateNote)
router.delete('/:id', auth, noteCo.removeNote)


module.exports = router
