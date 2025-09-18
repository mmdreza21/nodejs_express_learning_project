const express = require('express')

const router = express.Router()

const cityController = require('../controllers/cityCo');
const admin = require('../middlewares/admin');
const objectId = require('../middlewares/objectid');
const auth = require('../middlewares/auth');


router.get('/', cityController.getAlle)
router.get('/:id', cityController.getForContry)

//!admin
router.post('/', [auth, admin], cityController.post)
router.put('/:id', [objectId, auth, admin], cityController.update)
router.delete('/:id', [objectId, auth, admin], cityController.delet)

module.exports = router

