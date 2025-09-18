const mongoose = require("mongoose")
const { User } = require("../models/user")

const axios = require("axios")


module.exports = async () => {
    const user = await User.find()
    if (user.length < 1) {
        try {

            await axios.post(process.env.DOMAIN, {

                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,

            }, {
                headers: {
                    AdminToken: process.env.CRIPTEDADMINCODE
                }
            })
        } catch (e) {
            Promise.reject(e.response.data)
        }
    }

}