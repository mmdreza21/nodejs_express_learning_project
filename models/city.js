const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema

const cityschema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },

    countryId: { type: Schema.Types.ObjectId, ref: "country", required: true }

})


const City = mongoose.model("city", cityschema)

function validator(prods) {
    const schema = Joi.object({
        title: Joi.string().required().min(2).max(50),
        countryId: Joi.objectId().required()
    })
    return schema.validate(prods)
}

exports.City = City

exports.validate = validator