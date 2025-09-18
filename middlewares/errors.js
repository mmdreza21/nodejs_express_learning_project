const { logger } = require("../startUp/logger")

module.exports = (err, req, res, next) => {
    logger.error(err, err)
    res.status(500).send('some thins went wrong in  server')

}

