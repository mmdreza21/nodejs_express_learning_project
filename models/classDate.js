const mongoose = require('mongoose')
const Joi = require('joi')

const Schema = mongoose.Schema

const classDateSchema = new Schema({
    classRoomId: {type: Schema.Types.ObjectId, ref: 'class', required: true},
    teacherId: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    students: [{
        student: {type: Schema.Types.ObjectId, ref: "user",},
        connectionLink: {type: String, required: true}
    }],
    ///todo
    isDone: {type: Boolean, default: false},
    limit: {type: Number, required: true,},
    date: {type: Date, required: true},
    isFull: {type: Boolean, default: false},
    studentCheck: {check: {type: Boolean, default: false}, userId: {type: Schema.Types.ObjectId, ref: 'user'}},
    teacherCheck: {check: {type: Boolean, default: false}, userId: {type: Schema.Types.ObjectId, ref: 'user'}},
    expireAt: {
        type: Date,
        required: true
    }
}, {timestamps: true})

classDateSchema.index({"expireAt": 1}, {expireAfterSeconds: 60 * 60 * 24 * 7 + 10});

classDateSchema.methods.checkTimeDone = function () {
    let status = false
    //TODO this.date > Date.now() //TODO
    if (this.studentCheck && this.teacherCheck && !this.isDone) {
        status = true
    }
    return status
}

const ClassDate = mongoose.model('classDate', classDateSchema)

function validator(params) {
    const schema = Joi.object({
        classRoomId: Joi.objectId().required(),
        limit: Joi.number().required(),
        date: Joi.date().required()
    })
    return schema.validate(params)
}

function editValidator(params) {
    const schema = Joi.object({
        limit: Joi.number().required(),
        date: Joi.date().required()
    })
    return schema.validate(params)
}


exports.ClassDate = ClassDate
exports.validate = validator
exports.editValidator = editValidator