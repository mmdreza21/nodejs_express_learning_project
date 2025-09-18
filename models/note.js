const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema
const noteSchema = new Schema({
    text: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, rel: 'user', required: true }
})



const Note = mongoose.model("note", noteSchema)

function validator(note) {
    const schema = Joi.object({
        text: Joi.string().required(),
    })
    return schema.validate(note)
}

exports.validate = validator
exports.Note = Note


