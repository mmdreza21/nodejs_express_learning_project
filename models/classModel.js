const Joi = require("joi");
const mongoose = require("mongoose");


const Schema = mongoose.Schema
const clasSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },

    creatorTeacher: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    lang: {
        type: Schema.Types.ObjectId,
        ref: 'lang',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number,
    },
    isInOff: {
        type: Boolean,
        default: false
    },
    off: {
        type: Number,
        required: true,
    },
    classLink: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
    },

    endDate: {
        type: Date,
    },

    startTime: {
        type: Number
    },

    endTime: {
        type: Number
    },
    //10
    isSolo: {
        type: Boolean,
        required: true
    },
    classLimit: {type: Number, required: true},
    students: [{
        student: {type: Schema.Types.ObjectId, ref: "user", required: true}
    }],

    lessons: {type: Number, required: true},
    // dayOfWeek: [{
    //     students: [{
    //         student: { type: Schema.Types.ObjectId, ref: "user", },
    //         connectionLink: { type: String, required: true }
    //     }],
    //     isDone: [{
    //         studentId: { type: Schema.Types.ObjectId, ref: 'user', required: true, }
    //     }],
    //     limit: { type: Number, required: true, },
    //     date: { type: Date, required: true },
    //     isFull: { type: Boolean, default: false }
    // }]
}, {timestamps: true})

clasSchema.methods.fullingClass = async function (student, link, id) {
    let stu = {student: student._id, connectionLink: link}
    this.students.push(stu)
    console.log(id)
    for (const Id of id) {

        const dateIndex = this.dayOfWeek.findIndex(e => {
            return e._id.toString() === Id.toString()
        })
        this.dayOfWeek[dateIndex].students.push(stu)
        if (this.isSolo === true) {
            this.dayOfWeek[dateIndex].isFull = true
        } else if (!this.isSolo && this.dayOfWeek[dateIndex].students.length >= this.dayOfWeek[dateIndex].limit) {
            this.dayOfWeek[dateIndex].isFull = true
        }
    }
    await this.save()
}

const Clas = mongoose.model('class', clasSchema)

function validator(clas) {
    const schema = Joi.object({
        title: Joi.string().required(),
        creatorTeacher: Joi.objectId(),
        classLink: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        lang: Joi.objectId().required(),
        price: Joi.number(),
        classLimit: Joi.number(),
        isSolo: Joi.boolean().required(),
        dayOfWeek: Joi.array(),
        time: Joi.number(),
        off: Joi.number(),
        lessons: Joi.number().required()
    })
    return schema.validate(clas)
}

function offValidator(params) {
    const schema = Joi.object({
        isInOff: Joi.boolean(),
        off: Joi.number()
    })
    return schema.validate(params)
}

function updateValidator(params) {
    const schema = Joi.object({
        title: Joi.string().required(),
        classLink: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        lang: Joi.objectId().required(),
        price: Joi.number(),
        classLimit: Joi.number(),
        isSolo: Joi.boolean().required(),
        dayOfWeek: Joi.array(),
        time: Joi.number(),
        lessons: Joi.number().required()
    })
    return schema.validate(params)
}

exports.Clas = Clas
exports.validate = validator
exports.offValidator = offValidator
exports.updateValidator = updateValidator