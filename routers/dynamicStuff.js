const express = require('express')
const admin = require('../middlewares/admin')
const router = express.Router()

const auth = require('../middlewares/auth')
const isTeacher = require('../middlewares/isteacher')
const { public } = require('../middlewares/upload')

const dynamicStuff = require('../controllers/dynamicStuff')

router.patch('/', [admin], public.single('image'), dynamicStuff.patchStuff)
router.get('/', dynamicStuff.getData)



module.exports = router
