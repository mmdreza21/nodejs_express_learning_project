const Joi = require("joi");
const mongoose = require("mongoose");

const jwt = require('jsonwebtoken')
const passwordComplexity = require('joi-password-complexity');


const Schema = mongoose.Schema
const userSchema = new Schema({
    //*userInfo 12
    fname: { type: String, maxlength: 50, minlength: 3 },
    lname: { type: String, maxlength: 50, minlength: 3 },
    gender: { type: String, enum: ["male", "female"] },
    about: { type: String },
    age: { type: Number },
    email: { unique: true, type: String, required: true },
    phone: { type: String },
    country: { type: Schema.Types.ObjectId, ref: "country" },
    city: { type: Schema.Types.ObjectId, ref: "city" },
    address: { type: String },
    profileImage: { type: String, default: "" },
    video: { type: String },


    //**status  Looking fr partener
    lForP: { type: Boolean, default: false },

    //*balance accont felan 2
    code: { code: { type: String, }, used: [{ student: { type: Schema.Types.ObjectId, ref: "user" } }] },
    balance: { type: Number, default: 0 },
    bankAccountId: { type: String },
    cryptoWalletInformation: {
        coinName: '',
        walletAddress: ''
    },


    //*Date 2
    timeInClasses: { type: Number, default: 0, },

    //*role 3
    role: { type: String, required: true, enum: ['Admin', 'Student', 'Teacher'], },
    isAdmin: { type: Boolean, default: false },
    isTeacher: { type: Boolean, default: false },

    //**relashinalData{ 2
    langs: [{ lang: { type: Schema.Types.ObjectId, ref: 'lang', required: true } }],
    teachingLang: { type: Schema.Types.ObjectId, ref: 'lang', },
    classes: [{ type: Schema.Types.ObjectId, ref: 'class', required: true }],
    hasGroupClass: { type: Boolean },

    //*teacher data 7
    students: [{ student: { type: Schema.Types.ObjectId, ref: "user", required: true } }],
    lessons: { type: Schema.Types.ObjectId, ref: "lessons" },
    degree: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
    degreeImage: { type: Array },
    trailPrice: { type: Number },
    hourlyRateFrom: { type: Number },
    native: { type: Boolean, },


    //* Admin staf
    iWannaCheck: { type: Boolean, default: false },
    checked: { type: Boolean, default: false },
    degreeBadget: { type: String, default: "" },

    //*rate report
    rate: [{ rateNum: { type: Number, required: true }, user: { type: Schema.Types.ObjectId, ref: "user", required: true } }],
    avrRate: { type: Number, default: 0 },
    // reported: [{
    //     reportText: {type: String, required: true},
    //     user: {type: Schema.Types.ObjectId, ref: "user", required: true}
    // }],
    likes: [{ user: { type: Schema.Types.ObjectId, ref: "user", required: true } }],
    likedTeachers: [{ user: { type: Schema.Types.ObjectId, ref: "user", } }],


    //*password
    password: { type: String, required: true, },
    resetPassToken: String,
    DateofToken: Date,

}, { timestamps: true })

userSchema.methods.authToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            isAdmin: this.isAdmin,
            isTeacher: this.isTeacher,
            native: this.native,
        },
        process.env.JWT_SIGN
    )
    return token

}
userSchema.methods.addRate = async function (user, rateNum) {

    const rateIndex = this.rate.findIndex(e => {
        return e.user.toString() === user._id.toString()
    })

    let status = true

    if (rateIndex > -1) {
        status = false
        return status
    }

    let rate = { rateNum, user: user._id }
    this.rate.push(rate)
    console.log(this.rate);

    let newRateNum = 0
    this.rate.forEach(e => {
        newRateNum += e.rateNum
    });
    console.log(newRateNum);

    const avrage = +newRateNum / +this.rate.length
    this.avrRate = +avrage
    await this.save()
    return status
}

userSchema.methods.like = async function (user) {
    const rateIndex = this.likes.findIndex(e => {
        return e.user.toString() === user._id.toString()
    })
    let status;

    if (rateIndex > -1) {
        this.likes.splice(rateIndex, 1)
        status = false
    } else {
        let like = { user: user._id }
        this.likes.push(like)
        status = true
    }
    await this.save()
    return status

}
userSchema.methods.rateAndComment = function (userId) {
}


const User = mongoose.model('user', userSchema)


const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 1,
    numeric: 1,
    upperCase: 1,
    symbol: 1,
    requirementCount: 2,
};

function studentSignInValidator(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: passwordComplexity(complexityOptions).required(),
        invitationCode: Joi.string()
    })
    return schema.validate(user)
}

function studentValidator(user) {
    const schema = Joi.object({
        //*profile
        fname: Joi.string().max(50).min(3).required(),
        lname: Joi.string().max(50).min(3).required(),
        gender: Joi.string().max(50).min(3).required().valid("male", "female"),
        about: Joi.string().max(1000).min(8),
        age: Joi.number().required(),
        phone: Joi.string().required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),

        //!status
        lForP: Joi.boolean().required()
    })
    return schema.validate(user)
}


function teacherSignIn(user) {
    const schema = Joi.object({
        //*profile
        email: Joi.string().email().required(),
        password: passwordComplexity(complexityOptions).required(),
        fname: Joi.string().max(50).min(3).required(),
        lname: Joi.string().max(50).min(3).required(),
        gender: Joi.string().max(50).min(3).required().valid("male", "female"),
        age: Joi.date().required(),
        langs: Joi.array().required(),
        teachingLang: Joi.objectId().required(),
        phone: Joi.string().required(),
        country: Joi.objectId().required(),
        address: Joi.string().required(),
        city: Joi.objectId().required(),
        degree: Joi.string().valid("A1", "A2", "B1", "B2", "C1", "C2").required(),
    })
    return schema.validate(user)
}

function teacherprofile(user) {
    const schema = Joi.object({
        about: Joi.string().max(1000).min(8),
        address: Joi.string().required(),
        hourlyRateFrom: Joi.number().required(),
        trailPrice: Joi.number().required(),
        langs: Joi.array(),
        teachingLang: Joi.objectId(),
        hasGroupClass: Joi.boolean().required(),
        bankAccountId: Joi.string().min(16).max(1000),
        coinName: Joi.string(),
        walletAddress: Joi.string(),
        iWannaCheck: Joi.boolean(),
    })
    return schema.validate(user)
}

function changeValidator(user) {
    const schema = Joi.object({
        langs: Joi.array().required(),
        teachingLang: Joi.objectId().required(),
        degree: Joi.string().valid("A1", "A2", "B1", "B2", "C1", "C2").required(),
    })
    return schema.validate(user)

}

function rateValidator(user) {
    const schema = Joi.object({

        rateNum: Joi.number().valid(1, 2, 3, 4, 5).required(),


    })
    return schema.validate(user)

}

exports.User = User
exports.studentSignInValidator = studentSignInValidator
exports.studentValidator = studentValidator
exports.teacherSignIn = teacherSignIn
exports.teacherprofile = teacherprofile
exports.changeValidate = changeValidator
exports.rateValidator = rateValidator



