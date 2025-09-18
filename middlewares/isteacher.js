const jwt = require("jsonwebtoken")
const { logger } = require("../startUp/logger")


module.exports = async (req, res, next) => {
    const token = req.header("Authorization")
    if (!token) return res.status(403).send('token provided');
    try {
        const deCoded = jwt.verify(token.split(' ')[1], process.env.JWT_SIGN)
        // console.log(deCoded);
        if (deCoded.isTeacher === false) {
            return res.status(403).send('این عمل فقط توسط معلم انجام میشود!')
        }
        next()
    } catch (e) {
        logger.error(e)
        res.status(403).send('این عمل فقط توسط ادمین انجام میشود!');
        await Promise.reject(e)
    }
}