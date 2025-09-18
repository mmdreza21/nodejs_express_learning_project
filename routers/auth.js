const express = require('express')
const router = express.Router()

const auth = require('../middlewares/auth')
const authController = require('../controllers/authCo');


// rote
router.post('/login', authController.login)
router.post('/login/admin', authController.loginAdmin)
router.get('/user', auth, authController.user)



//! forget pass
router.post('/user/forgetpass', authController.forgetpass)
router.patch('/user/resetpass/:token', authController.newpass)


module.exports = router