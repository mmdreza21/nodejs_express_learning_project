const Joi = require("joi")
const mongoose = require("mongoose")

const Schema = mongoose.Schema

const clubSchema = new Schema({
    title: { type: String, required: true, maxlength: 20, minlength: 3 },
    text: { type: String, required: true, minlength: 3 },
    check: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    room: { type: String, enum: ["Practice", "Question"] },
    classId: { type: Schema.Types.ObjectId, ref: "class" },
    forClass: { type: Boolean, required: true },
    answer: [{
        userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
        text: { type: String, minlength: 3, },
        check: { type: Boolean, default: false },
        dateOfAns: { type: Date, },
        editedanswer: Boolean
    }]

}, { timestamps: true })

clubSchema.methods.postanswer = async function (text, id) {
    this.answer.push({
        date: Date.now(),
        text: text,
        userId: id
    })
    await this.save()
}
clubSchema.methods.putanswer = async function (text, id, UserId) {
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
clubSchema.methods.removeAnswer = async function (id) {
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


const Club = mongoose.model('club', clubSchema)

function validator(club) {

    const schema = Joi.object({
        title: Joi.string().required().max(20).min(3),
        text: Joi.string().required().min(3),
        room: Joi.string().required().valid("Practice", "Question"),
        classId: Joi.objectId(),
        forClass: Joi.boolean().required()
    })
    return schema.validate(club)

}

function UValidator(club) {

    const schema = Joi.object({
        title: Joi.string().required().max(20).min(3),
        text: Joi.string().required().min(3),

    })
    return schema.validate(club)

}

exports.Club = Club
exports.validate = validator
exports.UValidator = UValidator
