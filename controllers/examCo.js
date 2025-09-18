const { Exam, validate } = require("../models/exam");
const { Lang } = require('../models/lang');
const _ = require('lodash');
const { TakenExam } = require("../models/TakenExam");
const mongoose = require('mongoose')

class ExamController {

    async newExam(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const lang = await Lang.findById(req.body.lang)
        if (!lang) return res.status(404).send('Lang Enotfound');

        const exam = await new Exam({
            ..._.pick(
                req.body, ["question", "answers",]
            ),
            lang: {
                title: lang.title,
                langId: lang._id
            },
            teacher: req.user._id
        })

        await exam.save()
        res.send(exam)
    }


    async getTeacherExam(req, res) {
        const TId = req.params.id

        const exam = await Exam.aggregate([{ $match: { teacher: new mongoose.Types.ObjectId(TId) } }]).sample(10)
        // console.log(exam);
        // if (!exam) return res.status(404).send('exam EnotFound');
        res.send(exam)
    }

    // this example is grate ***** ======= Random data =======
    async getLangExam(req, res) {
        const lang = req.query.title
        const exam = await Exam.aggregate([{ $match: { "lang.title": lang } }]).sample(10)
        res.send(exam)
    }

    // this is another one*** ======= Random data =======
    async getLevelLangExam(req, res) {
        const LId = req.params.id
        let options = { skip: 0, limit: 10 };
        await Exam.findRandom({ "lang.langId": LId }, {}, options, function (err, results) {
            if (err) res.status(404).send('exam EnotFound');
            else res.send(results)
        })
    }

    async getAll(req, res) {
        const {
            lang,
            teacher
        } = req.query

        const query = {}

        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)

        if (lang) {
            if (!mongoose.Types.ObjectId.isValid(req.query.lang)) {
                return res.status(404).send("invalid ID in lang ")
            }
            query["lang.langId"] = lang

        }
        if (teacher) {
            if (!mongoose.Types.ObjectId.isValid(req.query.teacher)) {
                return res.status(404).send("invalid ID in teacher ")
            }
            query.teacher = teacher

        }

        let result = {}

        let startIndex = (page - 1) * limit
        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            }
        }

        result.end = Math.ceil(await Exam.countDocuments(query).exec() / limit)

        const exams = await Exam.find(query).sort('-createdAt').populate('teacher').limit(limit).skip(startIndex)
        if (!exams) return res.status(404).send("no result")
        result.data = exams

        res.send(result)

    }

    async removeExam(req, res) {
        const exam = await Exam.findByIdAndRemove(req.params.id)
        if (!exam) return res.status(404).send('user notfound');
        res.send(exam)
    }


    async editExam(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const lang = await Lang.findById(req.body.lang)
        if (!lang) return res.status(404).send('Lang ENotfound');

        const exam = await Exam.findByIdAndUpdate(req.params.id, {
            ..._.pick(
                req.body, ["question", "answers",]
            ),
            lang: {
                title: lang.title,
                langId: lang._id
            },
            teacher: req.user._id
        })
        if (!exam) return res.status(404).send('user notfound');
        res.send(exam)
    }

    async exam(req, res) {
        const arr = req.body.arr
        const trueAns = []
        const wrongs = []

        for (let index = 0; index < arr.length; index++) {
            const el = arr[index];
            const exam = await Exam.findById(el.id)
            if (!exam) return res.status(404).send('Exam Enotfound')
            const Opt = el.answer
            let answer = exam.answers[Opt]
            // console.log(Opt);
            // console.log(answer);
            if (answer.opt === true) {
                trueAns.push(el)
            } else {
                wrongs.push(el)
            }
        }
        const takenExam = new TakenExam({
            examWithanswers: arr,
            wrongAnswers: trueAns,
            rightAnswers: wrongs,
            userId: req.user._id,
            score: trueAns.length * 10,
        })

        await takenExam.save()

        res.send({ right: trueAns.length, wrong: wrongs.length })
    }

}


module.exports = new ExamController()