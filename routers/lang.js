const express = require('express')

const router = express.Router()

const langCo = require('../controllers/langCo');
const admin = require('../middlewares/admin');
const objectId = require('../middlewares/objectid');
const auth = require('../middlewares/auth');


router.get('/', langCo.allLang)

router.post('/', [admin, auth], langCo.sendLang)
router.put('/:id', [admin, objectId, auth], langCo.updateLang)
router.delete('/:id', [admin, objectId, auth], langCo.removeLang)

module.exports = router

