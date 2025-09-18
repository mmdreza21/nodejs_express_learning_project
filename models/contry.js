const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema

const countrySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    flag: {
        type: String,
        required: true,
    }
})

function validator(co) {
    const schema = Joi.object({
        title: Joi.string().required(),
        image: Joi.string()
    })
    return schema.validate(co)
}

const Country = mongoose.model('country', countrySchema)

exports.Contry = Country
exports.validata = validator



