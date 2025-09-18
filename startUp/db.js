const mongoose = require('mongoose');
const {logger} = require('./logger');
module.exports = () => {
    let dbUri = ''
    if (process.env.NODE_ENV === 'test') {
        dbUri = process.env.MONGO_URI_TEST
    } else {
        dbUri = process.env.MONGO_URI
    }

    mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    }).then(() => {
        logger.info(`mongo to the connected on ${dbUri} !`);
    })
}