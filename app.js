require('dotenv').config();

const express = require('express');
const {logger} = require('./startUp/logger');
const app = express()


process.on('unhandledRejection', (ex) => {
    throw ex
})


const mongoose = require('mongoose')
const Fawn = require('fawn');
Fawn.init(mongoose);

require('./startUp/db')()
require('./startUp/router')(app)
require('./startUp/validation')()
if (process.env.NODE_ENV !== 'test') {
    require('./startUp/insert')()
}

let port = process.env.PORT || 8484

if (process.env.NODE_ENV === 'test') {
    port = 8008
}

const server = app.listen(port, () => logger.info(`italki app listening on port: ${port}!`))
require('./startUp/socket').init(server)
module.exports = server