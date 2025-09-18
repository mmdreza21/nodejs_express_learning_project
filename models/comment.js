const Joi = require("joi");

const mongoose = require("mongoose");

const Schema = mongoose.Schema
const commentSchema = new Schema({

    userId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    teacherId: {type: Schema.Types.ObjectId, ref: "user", required: true},
    comment: {
        type: String,
        minlength: 3,
        required: true
    },
    check: {type: Boolean, default: false},
    date: {type: Date,},
    edited: Boolean,
    answer: [{
        userId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
        text: {type: String, minlength: 3,},
        check: {type: Boolean, default: false},
        dateOfAns: {type: Date,},
        editedanswer: Boolean
    }],

    afterExam: {type: Boolean, required: true}

}, {timestamps: true})
commentSchema.methods.postanswer = async function (text, id) {
    this.answer.push({
        date: Date.now(),
        text: text,
        userId: id
    })
    await this.save()
}
commentSchema.methods.putanswer = async function (text, id, UserId) {
    try {

        const answerIdex = this.answer.findIndex(a => {
            return a._id = id
        })
        let newanswer = {
            editedanswer: true,
            text: text,
            dateOfAns: Date.now(),
            userId: UserId
        }
        this.answer[answerIdex] = newanswer
        await this.save()
    } catch (e) {
        console.log(e);
    }
}
commentSchema.methods.removeAnswer = async function (id) {
    try {
        const answeritem = this.answer.filter(p => {
            return p._id.toString() !== id.toString()
        })
        if (answeritem.length >= this.answer.length) return console.log("notfund");
        this.answer = answeritem
        await this.save()
    } catch (e) {
        console.log(e);
    }
}
const Comment = mongoose.model("comment", commentSchema)

function commentValidator(params) {
    const schema = Joi.object({
        comment: Joi.string().required(),
        afterExam: Joi.boolean().required()
    })
    return schema.validate(params)
}

function answerValidator(params) {
    const schema = Joi.object({
        comment: Joi.string().required(),

    })
    return schema.validate(params)
}

exports.validateComment = commentValidator
exports.validateAnswer = answerValidator
exports.Comment = Comment
