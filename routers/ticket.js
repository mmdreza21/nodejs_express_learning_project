const express = require('express')
const router = express.Router()


const TicketCo = require('../controllers/ticketCo')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const objectId = require('../middlewares/objectid')


//!ticket
router.post('/', [auth], TicketCo.postTicket)


router.get('/', [auth, admin], TicketCo.getAll)
router.get('/details/:id', [objectId, auth], TicketCo.getOne)
router.get("/user", auth, TicketCo.getForUser)

//!admin CHECK DAN ZADAN
router.get("/admin/unchecked", [auth, admin], TicketCo.getUnChecked)
router.get("/admin/Special", [admin], TicketCo.getSpecialTicket)
router.patch("/admin/check/:id", [auth, admin, objectId], TicketCo.checkMsg)

//!answer
router.post('/answer/:id', [auth, objectId], TicketCo.prostAnswer)


module.exports = router