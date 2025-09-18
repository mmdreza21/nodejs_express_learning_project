const { Club, validate, UValidator } = require("../models/club");
const io = require('../startUp/socket');

const _ = require('lodash');
const Controller = require('./controller');

class ClubController extends Controller {
    //!admin
    async getUnChecked(req, res) {
        const msg = await Club.find({ check: false }).populate('user classId answer.userId').sort('-createdAt')
        res.send(msg)
    }

    async checkMsg(req, res) {
        const msg = await Club.findByIdAndUpdate(req.params.id, { check: true }, { new: true })
        io.getIo().of('clubMsgs').emit('add', { action: "check", data: msg })
        res.send(msg)
    }
    async create(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        let clubMsg = await new Club({
            ..._.pick(req.body, ["title", "text", "room", "forClass", "classId"]),
            user: req.user._id,
            answer: []
        })
        await clubMsg.save()

        // clubMsg = await Club.findById(clubMsg._id).populate("user classId")
        io.getIo().of('clubMsgs').emit('add', { action: "create", data: { ...clubMsg._doc, user: { ...req.user } } })

        res.send(clubMsg)
    }

    async getForRoom(req, res) {
        const page = + req.query.page || 1
        const limit = + req.query.limit || 10

        let startindex = (page - 1) * limit

        let result = {}
        result.end = Math.ceil(await Club.countDocuments().exec() / limit)

        const room = req.params.name
        const classId = req.params.id
        const club = await Club.find({ room, classId, forClass: true }).populate('user').sort('-createdAt').limit(limit).skip(startindex).exec()
        result.data = club


        res.send(result)
    }

    async getForAll(req, res) {

        const page = + req.query.page || 1
        const limit = + req.query.limit || 10

        let startindex = (page - 1) * limit
        let endindex = limit.page

        let result = {}
        const room = req.params.name
        result.end = Math.ceil(await Club.countDocuments({ room, forClass: false }).exec() / limit)


        const club = await Club.find({ room, forClass: false }).populate('user').limit(limit).sort('-createdAt').skip(startindex).exec()

        result.data = club
        res.send(result)
    }

    async search(req, res) {
        const forClass = !!req.query.class
        const page = + req.query.page || 1
        const limit = + req.query.limit || 50
        const room = req.query.room
        const classId = req.query.classId
        const search = req.query.search
        const expressRes = res

        let startindex = (page - 1) * limit
        let result = {}
        const query = {}

        forClass ? query.forClass = forClass : query
        search ? query.title = { $regex: '.*' + search + '.*', $options: "i" } : query
        room ? query.room = room : query

        if (classId) {
            const outPut = super.queryValidator(expressRes, classId, "classId")
            if (outPut) return
            query.classId = classId
        }

        result.end = Math.ceil(await Club.countDocuments(query).exec() / limit)
        const club = await Club
            .find(query)
            .populate("user classId country")
            .sort('-createdAt')
            .limit(limit)
            .skip(startindex)
            .exec()

        result.data = club
        res.send(result)
    }


    async updateMsg(req, res) {
        const { error } = UValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message);


        let clubMsg = await Club.findById(req.params.id)
        if (!clubMsg) return res.status(404).send('msg ENotfound');

        if (req.user._id.toString() !== clubMsg.user.toString()) return res.status(403).send('شما نمیتوانید این پست را تغییر دهید!');

        clubMsg = await Club.findByIdAndUpdate(req.params.id, {
            ..._.pick(req.body, ["title", "text",]),
        }, { new: true })
        if (!clubMsg) return res.status(404).send('msg ENotfound');
        res.send(clubMsg);
    }


    async removeMsg(req, res) {
        let clubMsg = await Club.findById(req.params.id)
        if (!clubMsg) return res.status(404).send('msg ENotfound');
        if (req.user._id.toString() !== clubMsg.user.toString()) return res.status(403).send('!شما نمیتوانید این پست را پاک  دهید');
        clubMsg = await Club.findByIdAndRemove(req.params.id)

        io.getIo().of('clubMsgs').emit('add', { action: "delete", data: clubMsg })

        if (!clubMsg) return res.status(404).send('msg ENotfound');
        res.send(clubMsg);
    }


    //!  answers
    async prostAnswer(req, res) {
        const coId = req.params.id
        const text = req.body.text
        const ID = req.user._id
        const club = await Club.findById(coId)
        await club.postanswer(text, ID)

        const result = {
            text,
            userId: {
                email: req.user.email
            }
        }

        io.getIo().of('clubMsgs').emit('answer', { action: "new", data: result })

        res.send(club.answer)
    }

    async putanswer(req, res) {
        const coId = req.params.id
        const text = req.body.text
        const id = req.body.id
        const UserId = req.user._id
        const club = await Club.findById(coId)
        await club.putanswer(text, id, UserId)
        res.send(club.answer)
    }

    async deleteAnswer(req, res) {
        const coId = req.params.id
        const id = req.params.ID
        if (!id) return res.status(404).send('جواب کامنت مورد نظر یافت نشد!')
        const club = await Club.findById(coId)
        await club.removeAnswer(id)
        res.status(204).send()
    }


    //!ckeck
    async getUnCheckedAns(req, res) {
        const ans = await Club.find({ "answer.check": false })

        let uncheckedAnswers = []

        ans.forEach(e => {


            const unchecke = e.answer.filter(e => {
                return e.check !== true
            })


            const x = uncheckedAnswers.concat(unchecke)
            uncheckedAnswers = [...x]
        });

        res.send(uncheckedAnswers)
    }

    async CheckTheAns(req, res) {
        const id = req.params.id
        const ans = await Club.find({ "answer.check": false })


        for (let i = 0; i < ans.length; i++) {
            const e = ans[i];
            const uncheckeIndex = e.answer.findIndex(e => {
                return e._id.toString() === id.toString()
            })
            if (uncheckeIndex > -1) {
                const club = await Club.findById(e._id)
                console.log(club);
                club.answer[uncheckeIndex].check = true
                await club.save()
                console.log(club);
            } else {
                return res.status(404).send('this item has been checked! ENotFound');
            }

        }



        res.send(ans)
    }
}

module.exports = new ClubController()