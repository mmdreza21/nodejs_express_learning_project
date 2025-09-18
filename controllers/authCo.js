const passwordComplexity = require('joi-password-complexity');
const crypto = require('crypto');

const Joi = require("joi")
const bcrypt = require("bcryptjs");

const {User} = require("../models/user")
const transport = require('../startUp/email');


class AuthController {


    async login(req, res) {
        const {error} = signValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const email = req.body.email
        const password = req.body.password

        let user = await User.findOne({email: email})
        if (!user) return res.status(400).send('ایمیل یا کلمه ی عبور اشتباه است!')

        let decodepass = await bcrypt.compare(password, user.password)
        if (!decodepass) return res.status(400).send('ایمیل یا کلمه ی عبور اشتباه است!')

        const token = await user.authToken()
        res.send({token: token})

    }

    async loginAdmin(req, res) {
        const {error} = signValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const email = req.body.email
        const password = req.body.password

        let user = await User.findOne({email: email, isAdmin: true, role: "Admin"})
        if (!user) return res.status(400).send('ایمیل یا کلمه ی عبور اشتباه است!')

        let decodepass = await bcrypt.compare(password, user.password)
        if (!decodepass) return res.status(400).send('ایمیل یا کلمهlllllllll ی عبور اشتباه است!')

        const token = await user.authToken()
        res.send({token: token})

    }

    async loginTeacher(req, res) {
        const {error} = signValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const email = req.body.email
        const password = req.body.password

        let user = await User.findOne({email: email, isTeacher: true, role: "Teacher"})
        if (!user) return res.status(400).send({p: 'ایمیل یا کلمه ی عبور اشتباه است!', e: "Invalid email or password"})

        let decodepass = await bcrypt.compare(password, user.password)
        if (!decodepass) return res.status(400).send({
            p: 'ایمیل یا کلمه ی عبور اشتباه است!',
            e: "Invalid email or password"
        })

        const token = await user.authToken()
        res.send({token: token})

    }

    async user(req, res) {
        req.user ? res.status(200).send({user: req.user}) : res.status(401).send('Un Authoriz')
    }


    async forgetpass(req, res) {
        const {error} = validEmail(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const calBack = req.query.calback

        const email = req.body.email
        const user = await User.findOne({email})
        if (!user) return res.status(404).send('ایمیل مورد نظر یافت نشد!')

        const buffer = await crypto.randomBytes(32)
        const code = buffer.toString('hex')

        user.resetPassToken = code
        user.DateofToken = Date.now() + 1000 * 60 * 60
        await user.save()

        transport.sendMail({
            to: email,
            from: "info@offernews.co",
            subject: "changing password in offer news",
            html: `
            <!doctype html>
            <html lang="en-US">
            
            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reset Password Email Template</title>
                <meta name="description" content="Reset Password Email Template.">
                <style type="text/css">
                    a:hover {
                        text-decoration: underline !important;
                    }
                </style>
            </head>
            
            <body dir="rtl" marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;"
                leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
            
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1
                                                        style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                        شما در خواست کرده اید تا کلمه ی عبورتان را تغییر دهید.</h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        ما نمی توانیم گذرواژه قدیمی شما را برای شما ارسال کنیم. یک لینک منحصر به فرد
                                                        برای تنظیم مجدد خود
                                                        رمز عبور برای شما ایجاد شده است. برای تنظیم مجدد رمز عبور خود ، بر روی کلیک
                                                        کنید
                                                        .
                                                    </p>
                                                    <a href="${calBack}?code=${code}"
                                                        style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">تغییر
                                                        دادن کلمه ی عبور</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
            
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--/100% body table-->
            </body>
            
            </html>
        `
        })

        res.send('ایمیل با موفقیت ارسال شد')
    }

    async newpass(req, res) {
        const {error} = validPass(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const token = req.params.token
        const salt = await bcrypt.genSalt(12)
        const codedPass = await bcrypt.hash(req.body.password, salt)

        const user = await User.findOne({resetPassToken: token, DateofToken: {$gt: Date.now()}})
        if (!user) return res.status(404).send('لینک اشتباه است یا تاریخ ان منقضی شده است. ');

        user.password = codedPass
        user.resetPassToken = undefined
        user.DateofToken = undefined
        user.save()

        res.send("کلمه ی عبور شما با موفقیت تغییر یافت!")
    }

}

function validEmail(user) {
    const schema = Joi.object({

        email: Joi.string().email().required(),


    });
    return schema.validate(user);
}

function validemail(user) {
    const schema = Joi.object({

        email: Joi.string().email().required(),


    });
    return schema.validate(user);
}

const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 1,
    numeric: 1,
    upperCase: 1,
    symbol: 1,
    requirementCount: 2,
};

function validPass(user) {
    const schema = Joi.object({


        password: passwordComplexity(complexityOptions).required(),


    });
    return schema.validate(user);
}

function signValidator(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })
    return schema.validate(user)
}

module.exports = new AuthController()