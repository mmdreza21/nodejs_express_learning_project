const express = require('express')
const router = express.Router()


const buyingClassCo = require('../controllers/buyingClassCo')
const classCo = require('../controllers/classCo')
const auth = require('../middlewares/auth')
const isTeacher = require('../middlewares/isteacher')
const objectId = require('../middlewares/objectid')

//!
router.post('/', [auth, isTeacher], classCo.createClass)
router.post('/all', classCo.getAllClass)
router.patch("/off/:id", [auth, objectId, isTeacher], classCo.patchDiscoumt)
router.put("/:id", [auth, objectId, isTeacher], classCo.updateClasses)
router.delete('/:id', [auth, objectId, isTeacher], classCo.removeClass)
//!
router.get('/teacher/:id', [objectId], classCo.getTecherClass)
router.get('/student', [auth], classCo.getStudentClass)


//Buy class
router.post("/:id", [auth, objectId], buyingClassCo.payment)
router.get("/payment/verify", buyingClassCo.joinInClass)

//done TODO  do here in load of some page's this should call and must check and give the money to teacher
router.patch('/user/done', [auth], classCo.userPatchClassDone)

router.get('/one/:id', classCo.getOneClass)

module.exports = router