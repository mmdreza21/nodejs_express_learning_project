const bcryptjs = require('bcryptjs')
const _ = require('lodash')

const { User } = require('../models/user')
const mongoose = require('mongoose')


class GetTeacherController {


    async teacherDetails(req, res) {
        const id = req.params.id
        const teacher = await User.findById(id).populate('students.student classes langs.lang teachingLang country city')
        if (!teacher) return res.status(404).send("notFound");
        res.send(teacher)
    }

    async teacherprofile(req, res) {
        const id = req.user._id
        const teacher = await User.findById(id).populate('students.student langs.lang  teachingLang country city')
        if (!teacher) return res.status(404).send("notFound");
        res.send(teacher)
    }

    async allTeachers(req, res) {
        const teacher = await User.find({ role: "Teacher", isTeacher: true }).populate('students.student teachingLang langs.lang classes country city ')
        res.send(teacher)
    }


    async getByquerys(req, res) {
        let result = {}
        const querys = { role: "Teacher", isTeacher: true }

        let page = +req.query.page
        let limit = parseInt(req.query.limit)
        let startindex = (page - 1) * limit

        const lang = req.query.lang
        let country = req.query.country
        let city = req.query.city
        let avrRate = +req.query.avrRate
        let groupe = !!req.query.hasGroupClass
        const income = req.query.search
        const incomeFName = req.query.searchFName

        if (lang) {
            if (!mongoose.Types.ObjectId.isValid(req.query.lang)) {
                return res.status(404).send("invalid ID in lang ")
            }
            querys.teachingLang = lang

        }
        if (avrRate) {
            querys.avrRate = avrRate
        }

        if (country) {
            if (!mongoose.Types.ObjectId.isValid(req.query.country)) {
                return res.status(404).send("invalid ID country")
            }
            querys.country = country
        }
        if (city) {
            if (!mongoose.Types.ObjectId.isValid(req.query.city)) {
                return res.status(404).send("invalid ID city")
            }
            querys.city = city
        }
        if (groupe) {
            if (!mongoose.Types.ObjectId.isValid(req.query.hasGroupClass)) {
                return res.status(404).send("invalid ID groupe")
            }
            querys.hasGroupClass = groupe
        }


        if (income) {
            let regex = new RegExp(".*" + income + "*.", "i")
            querys.email = regex
        }



        result.end = Math.ceil(await User.countDocuments(querys).exec() / limit)

        if (startindex > 0) {
            result.previos = {
                page: page - 1,
                limit: limit
            }
        }


        const teacher = await User.find(querys).populate('students.student langs.lang teachingLang classes country city ').sort('-createdAt').limit(limit).skip(startindex)
        if (!teacher) return res.status(404).send("no result")
        result.data = teacher


        res.send(result)
    }


    //! GET STUDENT                          

    async studentSearch(req, res) {
        let result = {}
        const querys = { role: "Student", isTeacher: false }

        let page = parseInt(req.query.page)
        let limit = parseInt(req.query.limit)
        let startindex = (page - 1) * limit

        const lang = req.query.lang
        let country = req.query.country
        let city = req.query.city
        let avrRate = +req.query.avrRate
        let lForP = !!req.query.lForP
        const incom = req.query.search



        if (startindex > 0) {
            result.previos = {
                page: page - 1,
                limit: limit
            }
        }

        if (lang) {
            if (!mongoose.Types.ObjectId.isValid(req.query.lang)) {
                return res.status(404).send("invalid ID in lang ")
            }
            querys["langs.lang"] = lang
            // console.log(querys);
        }
        if (avrRate) {
            querys.avrRate = avrRate
        }
        if (lForP) {
            querys.lForP = lForP
        }


        if (country) {
            if (!mongoose.Types.ObjectId.isValid(req.query.country)) {
                return res.status(404).send("invalid ID country")
            }
            querys.country = country
        }
        if (city) {
            if (!mongoose.Types.ObjectId.isValid(req.query.city)) {
                return res.status(404).send("invalid ID city")
            }
            querys.city = city
        }

        result.end = Math.ceil(await User.countDocuments(querys).exec() / limit)

        const product = await User.find(querys).populate('students.student langs.lang classes country city ').sort('-createdAt').limit(limit).skip(startindex)
        if (!product) return res.status(404).send("no result")
        result.data = product


        res.send(result)
    }


}


module.exports = new GetTeacherController()

