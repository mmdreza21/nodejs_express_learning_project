const {ClassDate, validate, editValidator} = require('../models/classDate')

const Controller = require('./controller')
const mongoose = require('mongoose')

const _ = require('lodash')

class ClassDateCo extends Controller {
    async postDate(req, res) {
        const {error} = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const teacherId = req.user._id
        const dateInput = req.body.date
        const expireAt = dateInput

        let date = await ClassDate.findOne({date: dateInput, teacherId})
        if (date) return res.status(400).send('this date is already exist for you')

        date = await new ClassDate({
            ..._.pick(req.body, ['classRoomId', 'limit', 'date']),
            teacherId,
            expireAt
        })

        await date.save()
        res.status(201).send(date)
    }

    async getForStudent(req, res) {
        const userId = req.user._id
        const {past, last} = req.query

        const queries1 = {}
        const queries2 = {}

        past ? queries1.date = {$gte: past} : queries1
        last ? queries2.date = {$lte: last} : queries2


        const dates = await ClassDate
            .find(queries2)
            .and(queries1)
            .and({'students.student': userId})
        res.send(dates)
    }

    async getByQuery(req, res) {
        const {teacherId, classRoomId, sDate, eDate} = req.query

        const query = {}


        if (teacherId) {
            if (!mongoose.Types.ObjectId.isValid(teacherId)) {
                return res.status(404).send(`invalid ID In teacherId`)
            }
            query.teacherId = teacherId
        }
        if (classRoomId) {
            if (!mongoose.Types.ObjectId.isValid(classRoomId)) {
                return res.status(404).send(`invalid ID In classRoomId`)
            }
            query.classRoomId = classRoomId
        }

        if (sDate) {
            query.date = {$gt: sDate}
        }
        if (eDate) {
            query.date = {$lt: eDate}
        }


        const date = await ClassDate.find(query).populate('userId classRoomId teacherId').sort({date: 1})
        res.send(date)

    }

    async editDate(req, res) {
        const {error} = editValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const teacherId = req.user._id
        const id = req.params.id

        let date = await ClassDate.findOne({date: req.body.date, teacherId})
        if (date) return res.status(400).send('this date is already exist for and full for you')


        const expireAt = req.body.date

        date = await ClassDate.findByIdAndUpdate(id, {..._.pick(req.body, ['limit', 'date']), expireAt}, {new: true})
        if (!date) return res.status(404).send('date ENotFound')
        res.send(date)
    }

    async removeDate(req, res) {
        const date = await ClassDate.findByIdAndRemove(req.params.id)
        if (!date) return res.status(404).send('date ENotFound')
        res.send(date)
    }

}


module.exports = new ClassDateCo()