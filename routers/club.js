const express = require('express')
const ClubCo = require('../controllers/clubCo')
const router = express.Router()

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const objectId = require('../middlewares/objectid');
const clubCo = require('../controllers/clubCo');


router.post('/', auth, ClubCo.create)
router.get('/class/:name/:id', [auth, objectId], ClubCo.getForRoom)
router.get('/all/:name', auth, ClubCo.getForAll)
router.get('/search', auth, ClubCo.search)
router.patch('/:id', [auth, objectId], ClubCo.updateMsg)
router.delete('/:id', [auth, objectId], ClubCo.removeMsg)

//!ADMIN check
router.get('/admin/unchecked', [auth, admin], clubCo.getUnChecked)
router.patch('/admin/check/:id', [auth, admin, objectId], ClubCo.checkMsg)

//!answer
router.post('/answer/:id', [auth, objectId], ClubCo.prostAnswer)
router.put('/answer/:id', [auth, objectId], ClubCo.putanswer)
router.delete('/answer/:id/:ID', [auth, objectId], ClubCo.deleteAnswer)

//!ADMIN check
router.get('/admin/answer/unchecked', [auth, admin], clubCo.getUnCheckedAns)
router.patch('/admin/answer/check/:id', [auth, admin, objectId], ClubCo.CheckTheAns)

module.exports = router