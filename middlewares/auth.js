const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')
    if (!token) return res.status(401).send('احتیاج  به توکن')
    try {
        const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SIGN)
        // const user = await User.findById(decodedToken._id)
        // console.log(user);
        req.user = decodedToken
        next()
    } catch (e) {

        res.status(401).send({ e: e, err: "شما احراض هویت نشده اید دا.!" })
        // await Promise.reject(e)
    }

}