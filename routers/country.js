const express = require('express')
const router = express.Router()
const country = require('../controllers/countryCo');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const objectId = require('../middlewares/objectid');
const { flag } = require('../middlewares/upload');



router.get('/', country.getall)


//! admin action
router.post('/', [auth, admin], flag.single('image'), country.post)
router.put('/:id', [objectId, auth, admin], flag.single('image'), country.edite)
router.delete('/:id', [objectId, auth, admin], country.delete)



module.exports = router