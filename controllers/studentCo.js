const bcryptjs = require('bcryptjs')
const _ = require('lodash')
const crypto = require('crypto');

const { User, studentSignInValidator, studentValidator } = require('../models/user')
const { deleteImage } = require('../startUp/fileHelp');
const { Fiscal } = require('../models/financial');

class StudentController {

    async AdminSignIn(req, res) {
        const { error } = studentSignInValidator(req.body);
        if (error) return res.status(400).send(error.details[0].message);


        const code = process.env.CRIPTEDADMINCODE
        const header = req.header('AdminToken')


        if (header !== code) return res.status(403).send("no no no  you don't have my code");

        const email = req.body.email;


        let user = await User.findOne({ email: email });
        if (user) return res.status(400).send("این ایمیل قبلا ثبت شده است!");

        const salt = await bcryptjs.genSalt(12);
        const password = await bcryptjs.hash(req.body.password, salt);

        const buffer = await crypto.randomBytes(4)
        const hex = buffer.toString('hex')

        const invite = {
            code: hex
        }
        user = await new User({
            email: email,
            password: password,
            isAdmin: true,
            isTeacher: true,
            role: "Admin",

        });



        await user.save();
        const token = user.authToken();
        res.header("x_auth", token).send(email);
    };

    async signIn(req, res) {
        const { error } = studentSignInValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const email = req.body.email
        const invitationCode = req.body.invitationCode


        let user = await User.findOne({ email: req.body.email })
        if (user) return res.status(400).send({ e: "this emil is allredy exists!", p: "این ایمیل  قبلا ثبت شده " })

        const salt = await bcryptjs.genSalt(12);
        const password = await bcryptjs.hash(req.body.password, salt);

        const buffer = await crypto.randomBytes(4)
        const hex = buffer.toString('hex')
        const code = {
            code: hex,
            used: []
        }

        user = await new User({
            email,
            password,
            isAdmin: false,
            isTeacher: false,
            role: "Student",
            code
        })
        if (invitationCode && invitationCode !== "") {
            const hostUser = await User.findOne({ 'code.code': invitationCode })
            if (!hostUser || hostUser.code.used.length >= 5) return res.status(404).send('این کد تخفیف نامعتبر است یا پنج بار استفاده شده!')
            //TODO
            const prize = 2000

            if (!user) return res.status(400).send(" کد دعوت اشتباه است یا منقضی شده است!");
            console.log(hostUser);
            user.balance += prize
            hostUser.balance += prize
            let student = { student: user._id }
            hostUser.code.used.push(student)
            const newUserFiscal = new Fiscal({
                payment: prize,
                pay: {
                    withdrawal: false,
                    for: 'Student'
                },
                description: `
                        <div>
                        <h4>
                          جایزه دریافتی از کد تخفیف:
                            <span>
                                (${invitationCode})
                            </span>
                        </h4>
                    </div>
                        `,
                forTeacher: false,
                userId: user._id,
                verify: true,

                byWallet: false,
            })
            const hostUserFiscal = new Fiscal({
                payment: prize,
                pay: {
                    withdrawal: false,
                    for: 'Student'
                },
                description: `
                        <div>
                        <h4>
                          جایزه دریافتی از کد تخفیف:
                            <span>
                                (${invitationCode})
                            </span>
                        </h4>
                    </div>
                        `,
                forTeacher: false,
                userId: hostUser._id,
                verify: true,

                byWallet: false,
            })
            await newUserFiscal.save()
            await hostUserFiscal.save()


            await hostUser.save()
        }

        await user.save()


        const token = user.authToken();
        res.header("x_auth", token).send(user)
    }

    async PatchProfile(req, res) {
        const { error } = studentValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const userId = req.user._id

        const user = await User.findByIdAndUpdate(userId, {
            ..._.pick(req.body, [
                "fname",
                "lname",
                "gender",
                "about",
                "age",
                "phone",
                "country",
                "city",
                "address",
                "lForP"
            ])

        }, { new: true })

        res.send(user)
    }
    async PatchProfileImage(req, res) {
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

    async getProfile(req, res) {
        const user = await User.findById(req.user._id).populate('likedTeachers.user langs.lang classes country city ')
        if (!user) return res.status(404).send('user notfound');
        res.send(user)

    }

    async studentDetails(req, res) {
        const user = await User.findById(req.params.id).populate('langs.lang classes country city ')
        if (!user) return res.status(404).send('user notfound');
        res.send(user)

    }



}

module.exports = new StudentController()



