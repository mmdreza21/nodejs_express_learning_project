const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const quizSchema = new Schema({
    title: { type: String, required: true },

    isUploady: { type: Boolean, required: true },

    lang: { type: Schema.Types.ObjectId, required: true, ref: "lang" },

    classId: { type: Schema.Types.ObjectId, required: true, ref: "class" },


    teacher: { type: Schema.Types.ObjectId, required: true, ref: "user" },

    question: { type: String, },
    questionPdf: { type: String },

    answers: [{
        text: { type: String, },
        score: { type: Number, },
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        answesPdf: { type: String }
    }],


}, { timestamps: true });

const Quiz = mongoose.model("quiz", quizSchema);

function validator(quiz) {
    const schema = Joi.object({
        title: Joi.string().required(),
        classId: Joi.objectId().required(),
        lang: Joi.objectId().required(),
        question: Joi.string(),

        questionPdf: Joi.any()
    })
    return schema.validate(quiz)
}

function validatorAnswer(params) {
    const schema = Joi.object({
        text: Joi.string().required(),
    })
    return schema.validate(params)
}

function validatorScore(params) {
    const schema = Joi.object({
        score: Joi.number().required(),
    })
    return schema.validate(params)
}


exports.validate = validator
exports.validatorAnswer = validatorAnswer
exports.validatorScore = validatorScore
exports.Quiz = Quiz


