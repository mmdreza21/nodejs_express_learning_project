const { Comment, validateAnswer, validateComment } = require("../models/comment")
const { User } = require('../models/user')

class CommentController {


    async postcomment(req, res) {
        const { error } = validateComment(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const teacherId = req.params.id
        const comment = await new Comment({
            userId: req.user._id,
            teacherId: teacherId,
            comment: req.body.comment,
            afterExam: req.body.afterExam,
            date: Date.now(),
        })
        await comment.save()
        res.send(comment)
    }

    async deletcomment(req, res) {
        const commend = await Comment.findByIdAndRemove(req.params.id)
        if (!commend) return res.status(404).send('نظر یافت نشد')
        res.status(204).send()
    }

    async getForProd(req, res) {
        const page = +req.query.page || 1
        const limit = +req.query.limit || 10
        const teacherId = req.params.id

        const teacher = await User.findById(teacherId)
        if (!teacher) return res.status(404).send('techer ENotFound')
        let startindex = (page - 1) * limit

        let result = {}
        result.end = Math.ceil(await Comment.countDocuments({ teacherId, check: true }).exec() / limit)

        const comment = await Comment.find({ teacherId: req.params.id, check: true })
            .populate('userId teacherId answer.userId')
            .sort("-createdAt")
            .limit(limit).skip(startindex).exec()
        // if (!comment) return res.status(404).send('نظری یافت نشد')
        let commentAndRate;
        commentAndRate = [];
        let notRated;
        notRated = []


        for (const commentItem of comment) {
            if (teacher.rate.length > 0) {
                const commentedUser = commentItem.userId._id
                for (const rateItem of teacher.rate) {
                    const ratedUser = rateItem.user
                    console.log(ratedUser);
                    if (commentedUser.toString() === ratedUser.toString()) {
                        const obj = { comment: commentItem, rate: rateItem }
                        commentAndRate.push(obj)
                        console.log(obj);
                    } else {

                        const obj = { comment: commentItem, rate: { rateNum: 0 } }
                        notRated.push(obj)
                    }

                }


            } else {
                const obj = { comment: el, rate: { rateNum: 0 } }
                notRated.push(obj)
            }
        }


        result.notRated = notRated
        result.rated = commentAndRate
        res.send(result)

    }


    async getForUser(req, res) {
        const comment = await Comment.find({ "userId": req.user._id }).sort("-createdAt").limit(limit).skip(startindex).exec()
        if (!comment) return res.status(404).send('نظری یافت نشد')
        res.send(comment)
    }

    //!admin
    async getUnChecked(req, res) {
        const msg = await Comment.find({ check: false }).populate('userId teacherId answer.userId').sort('-createdAt')
        res.send(msg)
    }

    async checkMsg(req, res) {
        const msg = await Comment.findByIdAndUpdate(req.params.id, { check: true }, { new: true })
        if (!msg) return res.status(404).send('ENOTfound');
        res.send(msg)
    }


}

module.exports = new CommentController()