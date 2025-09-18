const Joi = require("joi");
const mongoose = require("mongoose");

const Schema = mongoose.Schema
const fiscalSchema = new Schema({
    payment: { type: Number, required: true },

    pay: {
        withdrawal: { type: Boolean, required: true },
        for: { type: String, enum: ['Admin', 'Student', 'Teacher'] }
    },

    // deposit: { type: Boolean, required: true },
    description: { type: String, required: true },
    forTeacher: { required: true, type: Boolean },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    verify: { type: Boolean, default: false },
    classId: { type: Schema.Types.ObjectId, ref: "class" },
    byWallet: { type: Boolean, default: false },
    ClassDateArr: [{
        dateObj: { type: Object, required: true },
        payed: { type: Boolean, default: false },
        classPrice: { type: Number, required: true }
    }],
    reade: { type: Number, default: 0 }
}, { timestamps: true })

fiscalSchema.methods.removeDate = async function (dateId) {
    const newClassDateIndex = this.ClassDateArr.findIndex(e => {
        return e._id.toString() === dateId.toString()
    })//TODO
    let status
    let returner = {}
    console.log(newClassDateIndex);
    if (newClassDateIndex < 0) {
        status = false
        returner.status = status
        return returner
    }

    const oldClassDateArr = [...this.ClassDateArr]

    const datePrice = this.ClassDateArr[newClassDateIndex].classPrice
    this.payment -= datePrice

    const newClassDateArr = oldClassDateArr.filter(e => {
        return e._id.toString() !== dateId.toString()
    })

    status = true

    returner.status = status
    returner.datePrice = datePrice
    returner.classObj = this.ClassDateArr[newClassDateIndex]
    this.ClassDateArr = newClassDateArr

    await this.save()
    return returner

}

const Fiscal = mongoose.model('fiscal', fiscalSchema)

function validatorTecherCheck(params) {
    const schema = Joi.object({
        payment: Joi.number().required(),
        description: Joi.string().required()
    })
    return schema.validate(params)
}

function validatePayment(body) {
    const schema = Joi.object({
        id: Joi.array().required(),
        link: Joi.string().required(),
        fromBalance: Joi.boolean().required(),
    })
    return schema.validate(body)

}

exports.Fiscal = Fiscal
exports.validateTeacherCheck = validatorTecherCheck
exports.validatePayment = validatePayment