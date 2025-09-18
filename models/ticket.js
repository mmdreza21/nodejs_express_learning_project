const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema
const ticketSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    subject: {type: String, required: true},
    text: {
        type: String,
        minlength: 3,
        required: true
    },
    forCreditorStudent: {type: Boolean, default: false},
    classDateId: {type: Schema.Types.ObjectId, ref: 'classDate'},
    // forReturning: {type: Boolean, required: true},
    check: {type: Boolean, default: false},
    needToAnswer: {type: Boolean, default: true},
    answer: [{
        userId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
        text: {type: String, minlength: 3,},
        check: {type: Boolean, default: false},
        dateOfAns: {type: Date,},
        editedAnswer: Boolean
    }],

    // afterExam: {type: Boolean, required: true}

}, {timestamps: true})

ticketSchema.methods.postAnswer = async function (text, user) {
    if (user.isAdmin) {
        this.needToAnswer = false
    } else {
        this.needToAnswer = true
    }
    this.answer.push({
        dateOfAns: Date.now(),
        text: text,
        userId: user._id
    })

    await this.save()
}

const Ticket = mongoose.model("ticket", ticketSchema)

function ticketValidator(params) {
    const schema = Joi.object({
        text: Joi.string().required(),
        subject: Joi.string().required(),
        classDateId: Joi.objectId()
    })
    return schema.validate(params)
}

function answerValidator(params) {
    const schema = Joi.object({
        text: Joi.string().required().min(3),
    })
    return schema.validate(params)
}

exports.validateTicket = ticketValidator
exports.validateAnswer = answerValidator
exports.Ticket = Ticket


