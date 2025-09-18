const { truncate } = require("lodash")
const { Ticket, validateAnswer, validateTicket } = require("../models/ticket")
const Controller = require("./controller")

class TicketController extends Controller {


    async postTicket(req, res) {
        const { error } = validateTicket(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        let forCreditorStudent = !!req.body.classDateId
        const ticket = await new Ticket({
            userId: req.user._id,
            text: req.body.text,
            subject: req.body.subject,
            classDateId: req.body.classDateId,
            forCreditorStudent: forCreditorStudent,
            date: Date.now(),
        })
        await ticket.save()
        res.send(ticket)
    }

    // async postStudentTicket(req, res) {
    //     const {error} = validateTicket(req.body)
    //     if (error) return res.status(400).send(error.details[0].message)
    //
    //
    //     const ticket = await new Ticket({
    //         userId: req.user._id,
    //         text: req.body.text,
    //         subject: req.body.subject,
    //         classDateId: req.body.classDateId,
    //         date: Date.now(),
    //     })
    //     await ticket.save()
    //     res.send(ticket)
    // }

    async getAll(req, res) {
        const page = +req.query.page || 1
        const limit = +req.query.limit || 10

        let startIndex = (page - 1) * limit

        let result = {}
        result.end = Math.ceil(await Ticket.countDocuments({ check: true }).exec() / limit)

        const ticket = await Ticket.find({ check: true }).sort("-updatedAt").populate('userId answer.userId').limit(limit).skip(startIndex).exec()
        if (!ticket) return res.status(404).send('نظری یافت نشد')

        result.data = ticket
        res.send(result)
    }

    async getOne(req, res) {

        const ticket = await Ticket.findById(req.params.id).populate('userId answer.userId classDateId classDateId.classRoomId')
        if (!ticket) return res.status(404).send('ticket ENot Found ')

        res.send(ticket)
    }

    async getForUser(req, res) {
        const page = +req.query.page || 1
        const limit = +req.query.limit || 10

        let startIndex = (page - 1) * limit

        let result = {}
        result.end = Math.ceil(await Ticket.countDocuments({ "userId": req.user._id }).exec() / limit)

        const ticket = await Ticket.find({ "userId": req.user._id }).populate('userId answer.userId').sort("-updatedAt").limit(limit).skip(startIndex).exec()
        if (!ticket) return res.status(404).send('نظری یافت نشد')

        result.data = ticket
        res.send(result)
    }

    //!admin
    async getSpecialTicket(req, res) {
        const msg = await Ticket.find({ forCreditorStudent: true }).populate('userId answer.userId').sort('-updatedAt')
        res.send(msg)
    }


    async getUnChecked(req, res) {
        const msg = await Ticket.find({ check: false }).populate('userId answer.userId').sort('-updatedAt')
        res.send(msg)
    }

    async checkMsg(req, res) {
        const msg = await Ticket.findByIdAndUpdate(req.params.id, { check: true }, { new: true })
        if (!msg) return res.status(404).send('ENOTfound');
        res.send(msg)
    }


    //!answers
    async prostAnswer(req, res) {
        const { error } = validateAnswer(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const coId = req.params.id
        const text = req.body.text
        const ID = req.user
        const ticket = await Ticket.findById(coId)
        if (!ticket) return res.status(404).send('ticket ENot Found')
        await ticket.postAnswer(text, ID)
        res.send(ticket.answer)
    }

}

module.exports = new TicketController()