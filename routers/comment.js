const express = require('express')
const router = express.Router()


const comentcontroller = require('../controllers/commentcon')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const objectid = require('../middlewares/objectid')


//!comment
router.post('/:id', [auth, objectid], comentcontroller.postcomment)
router.delete('/:id', [auth, admin, objectid], comentcontroller.deletcomment)

router.get('/:id', objectid, comentcontroller.getForProd)
router.get("/user", admin, comentcontroller.getForUser)
//!admin CHECK DAN ZADDAN
router.get("/admin/unchecked", [auth, admin], comentcontroller.getUnChecked)
router.patch("/admin/check/:id", [auth, admin, objectid], comentcontroller.checkMsg)


module.exports = router