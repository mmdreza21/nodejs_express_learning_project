const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema

const langSchema = new Schema({
    title: { type: String, required: true },
    fullTitle: { type: String, unique: true, required: true, },
    level: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
})

const Lang = mongoose.model('lang', langSchema)

function validator(lang) {
    const schema = Joi.object({
        title: Joi.string().required(),
        fullTitle: Joi.string(),
        level: Joi.string().valid("A1", "A2", "B1", "B2", "C1", "C2").required(),
    })
    return schema.validate(lang)
}

exports.Lang = Lang
exports.validate = validator

