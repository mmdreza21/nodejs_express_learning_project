const express = require('express')
const fiscalCo = require('../controllers/fiscalCo')
const router = express.Router()
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const buyClassCo = require('../controllers/buyingClassCo')


router.get('/query', fiscalCo.getAllFiscal)
//
router.patch('/checkout/:id', fiscalCo.teacherCheckOut)
//
router.post('/student/pay', auth, buyClassCo.studentDepositPayment);

// get
router.get('/student/verify', buyClassCo.studentVPayment);
router.get('/fiscalForStudents', [auth], fiscalCo.getFiscalsForStudent)


//admin 
router.get('/studentsFiscal/:id', [admin], fiscalCo.getStudentFiscal)
router.get('/specialFiscal/:id', [admin], fiscalCo.getSpecialFiscal)


router.patch('/return/student/:id', fiscalCo.returnMoneyToStudent)

module.exports = router