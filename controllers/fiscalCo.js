const { Fiscal, validateTeacherCheck } = require('../models/financial')
const { User } = require('../models/user')
const Controller = require('./controller');
const _ = require('lodash');


class FiscalController extends Controller {
    async getAllFiscal(req, res) {
        const expressRes = res
        let page = parseInt(req.query.page)
        let limit = +req.query.limit || 30
        const withdrawal = req.query.withdrawal
        const forTeacher = req.query.forTeacher
        const byWallet = req.query.byWallet
        const userId = req.query.userId
        const classId = req.query.classId

        let startIndex = (page - 1) * limit

        const result = {}
        const query = {}

        withdrawal ? query.withdrawal = withdrawal : query

        forTeacher ? query.forTeacher = forTeacher : query

        byWallet ? query.byWallet = byWallet : query

        if (classId) {
            const outPut = super.queryValidator(expressRes, classId, "classId")
            if (outPut) return
            query.classId = classId
        }

        if (userId) {
            const outPut = super.queryValidator(expressRes, userId, "userId")
            if (outPut) return
            query.userId = userId
        }
        result.end = Math.ceil(await Fiscal.countDocuments(query) / limit)

        const fiscal = await Fiscal.find(query).sort("-createdAt").populate('userId').limit(limit).skip(startIndex).exec()
        result.data = fiscal
        res.send(result)
    }

    async teacherCheckOut(req, res) {
        // console.log(req.body);
        const { error } = validateTeacherCheck(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const userId = req.params.id
        const teacher = await User.findById(userId)
        if (!teacher) return res.status(404).send('User ENOTFound')
        const payment = +req.body.payment

        const teacherNewBalance = (teacher.balance - payment).toFixed()
        teacher.balance = teacherNewBalance
        const fiscal = await ({
            payment,
            withdrawal: false,
            description: req.body.description,
            userId: userId,
            forTeacher: true,
        })
        // const task = new Fawn.Task()
        // await task.save("fiscals", fiscal).update("users", { _id: userId }, { $inc: { balance: -payment } }).run()
        await fiscal.save()
        await teacher.save()

        res.send(fiscal)
    }

    async getStudentFiscal(req, res) {
        const userId = req.params.id

        // const yesterday = Date.now() - 1000 * 60 * 60 * 24 * 4
        // const tomorrow = Date.now() + 1000 * 60 * 60 * 24 * 4
        const fiscal = await Fiscal
            .find({ userId })
        res.send(fiscal)
    }

    async getFiscalsForStudent(req, res) {
        const userId = req.user._id

        // const yesterday = Date.now() - 1000 * 60 * 60 * 24 * 4
        // const tomorrow = Date.now() + 1000 * 60 * 60 * 24 * 4
        const fiscal = await Fiscal.find({ userId })
        res.send(fiscal)
    }

    async getSpecialFiscal(req, res) {
        const userId = req.params.id
        const { dateId } = req.query

        let fiscalArr = []
        const fiscal = await Fiscal.find({ userId })
        for (const fiscalEl of fiscal) {
            for (const dateObj of fiscalEl.ClassDateArr) {
                if (dateObj.dateObj._id.toString() === dateId.toString()) {
                    fiscalArr.push(fiscalEl)
                }
            }
        }

        res.send(fiscalArr)

    }

    async returnMoneyToStudent(req, res) {
        const fiscalId = req.params.id
        const { userId, dateId } = req.query
        const fiscal = await Fiscal.findById(fiscalId)
        if (!fiscal) return res.status(404).send('fiscal ENotFound')

        const { status, datePrice, classObj } = await fiscal.removeDate(dateId)
        if (!status) return res.status(400).send("Cannot ....> check the ID's ")

        const student = await User.findById(userId)
        if (!student) return res.status(404).send('student ENotFound')

        student.balance += datePrice

        const ClassDateArr = [classObj]

        const newFiscal = await new Fiscal({
            payment: datePrice,
            pay: {
                withdrawal: false,
                for: 'Student'
            },
            description: ` مبلغ(${datePrice})به حسابتان برگشت   `,
            forTeacher: false,
            userId,
            classId: fiscal.classId,
            byWallet: false,
            ClassDateArr
        })

        await student.save()
        await newFiscal.save()

        res.send(fiscal)
    }


    // async getCreditor(req, res) {
    //     const fiscal = await Fiscal.find({forTeacher: true, payment: {$lte: 0}})
    //     res.send(fiscal);
    // }
}

module.exports = new FiscalController()