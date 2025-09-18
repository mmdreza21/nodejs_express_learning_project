
const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema

const takenExamSchema = new Schema({
    examWithanswers: { type: Array, required: true },

    wrongAnswers: { type: Array, required: true },

    rightAnswers: { type: Array, required: true },

    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },

    score: { type: Number, required: true },

})

const TakenExam = mongoose.model('takenExam', takenExamSchema)

// function validate(params) {
//     const schema = Joi.object({

//     })
// }

exports.TakenExam = TakenExam