const Joi = require('joi');
const mongoose = require('mongoose');
var random = require('mongoose-simple-random');

const Schema = mongoose.Schema

const examSchema = new Schema({
    lang: {
        langId: { type: Schema.Types.ObjectId, required: true, ref: "lang" },
        title: { type: String, required: true }
    },
    teacher: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    question: { type: String, required: true },
    answers: {
        A: { text: { type: String, required: true }, opt: { type: Boolean, required: true } },
        B: { text: { type: String, required: true }, opt: { type: Boolean, required: true } },
        C: { text: { type: String, required: true }, opt: { type: Boolean, required: true } },
        D: { text: { type: String, required: true }, opt: { type: Boolean, required: true } },
        X: { text: { type: String, default: "WORNG ANSWER" }, opt: { type: Boolean, default: false } },
    }
}, { timestamps: true })

examSchema.plugin(random)

const Exam = mongoose.model('exam', examSchema)

function validator(exam) {
    const schema = Joi.object({
        lang: Joi.objectId(),
        question: Joi.string(),
        answers: Joi.object({
            A: Joi.object({ text: Joi.string().required(), opt: Joi.boolean().required() }).required(),
            B: Joi.object({ text: Joi.string().required(), opt: Joi.boolean().required() }).required(),
            C: Joi.object({ text: Joi.string().required(), opt: Joi.boolean().required() }).required(),
            D: Joi.object({ text: Joi.string().required(), opt: Joi.boolean().required() }).required(),
            X: Joi.object()
        }).required(),
    })
    return schema.validate(exam)
}




exports.Exam = Exam
exports.validate = validator