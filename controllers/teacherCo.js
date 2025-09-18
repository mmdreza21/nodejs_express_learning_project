const bcryptjs = require('bcryptjs')
const _ = require('lodash')
const crypto = require('crypto');

const { User, teacherSignIn, teacherprofile, changeValidate, rateValidator } = require('../models/user')
const { deleteImage } = require('../startUp/fileHelp');


class TeacherController {


    async singInTeacher(req, res) {
        const { error } = teacherSignIn(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        // const img = req.file
        // if (!img) return res.status(400).send({ e: "degreeImage privided", p: "عکس مدرک الزامی است" })

        const buffer = await crypto.randomBytes(4)
        const Invetationcodecode = buffer.toString('hex')
        const code = {
            code: Invetationcodecode,
            used: []
        }

        const email = req.body.email;
        let user = await User.findOne({ email: email });
        if (user) return res.status(400).send("این ایمیل قبلا ثبت شده است!");

        const languege = []

        req.body.langs.forEach(e => {
            const la = {}
            la.lang = e
            languege.push(la)
        });

        user = await new User({
            ..._.pick(req.body, [
                "fname",
                "lname",
                "email",
                "password",
                "gender",
                "age",
                "phone",
                "country",
                "city",
                "degree",
                "teachingLang",
            ]),
            native: true,
            langs: languege,
            degreeImage: [],
            code,
            role: "Teacher", isTeacher: true
        })

        // user.degreeImage.push(img.path)
        const salt = await bcryptjs.genSalt(12);
        user.password = await bcryptjs.hash(user.password, salt);

        await user.save()

        const token = user.authToken();
        res.header("x_auth", token).send(user)
    }


    async patcheacherProfile(req, res) {
        const { error } = teacherprofile(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        let cryptoWalletInformation = {
            walletAddress: req.body.walletAddress,
            coinName: req.body.coinName
        }
        const languege = []
        req.body.langs.forEach(e => {
            const la = {}
            la.lang = e
            languege.push(la)
        });

        const user = await User.findByIdAndUpdate(req.user._id, {
            ..._.pick(req.body,
                ["about", "address", "hourlyRateFrom", "teachingLang", "trailPrice", "hasGroupClass", 'bankAccountId', "iWannaCheck"]
            ),
            langs: languege,
            cryptoWalletInformation
        }, { new: true })
        if (!user) return res.status(404).send('user notfound');

        res.send(user)

    }

    async teacherProfile(req, res) {
        let img = req.file
        if (!img) return res.status(404).send('plese upload a image for your profile');

        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('user notfound');

        if (user.profileImage && img.path !== user.profileImage) {
            deleteImage(user.profileImage)
        }
        user.profileImage = img.path
        await user.save()

        res.send(user)

    }


    async patchDgreePhoto(req, res) {
        let img = req.files
        if (!img) return res.status(404).send('please upload a image for your dgree');

        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('user notfound');

        img.forEach(e => {
            user.degreeImage.push(e.path)
        });
        await user.save()
        res.send(user)
    }


    async patchVideo(req, res) {
        let vid = req.file
        if (!vid) return res.status(404).send('please upload a image for your dgree');

        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('user notfound');

        if (user.video && vid.path !== user.video) {
            deleteImage(user.video)
        }
        user.video = vid.path
        await user.save()
        res.send(user)

    }

    async ChangeToTeacher(req, res) {
        const { error } = changeValidate(req.body)
        if (error) res.status(400).send(error.details[0].message)

        const langs = req.body.langs
        const teachingLang = req.body.teachingLang
        const degree = req.body.degree
        const user = await User.findById(req.user._id)

        const languege = []
        langs.forEach(e => {
            const la = {}
            la.lang = e
            languege.push(la)
        });

        user.langs = languege
        user.teachingLang = teachingLang
        user.degree = degree
        user.role = "Teacher"
        user.isTeacher = true
        user.native = true

        await user.save()

        res.send(user)
    }


    //! rating
    async rate(req, res) {
        const { error } = rateValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('user notfound');

        const teacher = await User.findById(req.params.id)
        if (!teacher) return res.status(404).send('user notfound');

        const status = await teacher.addRate(user, req.body.rateNum)
        // console.log(status);
        if (!status) return res.status(400).send("شما قبلا امتیاز دادی!");
        res.send(teacher)

    }

    //!liking

    async like(req, res) {

        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).send('user notfound');

        const teacher = await User.findById(req.params.id)
        if (!teacher) return res.status(404).send('user notfound');
        const status = await teacher.like(user)
        if (!status) {

            //TODO  test here
            const likedTeachersIndex = user.likedTeachers.findIndex(e => {
                return e.user.toString() === user._id.toString()
            });

            user.likedTeachers.splice(likedTeachersIndex, 1)

            await user.save()
            return res.send('disliked')
        }

        const likeds = {}
        likeds.user = teacher._id
        user.likedTeachers.push(likeds)

        await user.save()
        res.send({ teacher, user })
    }


}

module.exports = new TeacherController()




