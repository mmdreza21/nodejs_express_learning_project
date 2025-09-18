const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema

const stExamsSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: "user", required: true },
    exams: [{ exam: { type: Schema.Types.ObjectId, ref: "user", required: true }, score: { type: Number, required: true } }]
})

const StExams = mongoose.model('stExams', stExamsSchema)

exports.StExams = StExams
