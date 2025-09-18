const { createLogger, format, transports } = require('winston');
require('winston-mongodb')

const logger = createLogger({
    transports: [
        new transports.Console({
            level: "error",
            level: 'info',
            format: format.combine(format.timestamp(), format.simple(), format.colorize(), format.align()),
            handleExceptions: true
        }),
        // new transports.File({
        //     filename: "error.log",
        //     level: "error",
        //     level: 'info',
        //     // level:'',
        //     format: format.combine(format.timestamp(), format.json(), format.colorize(), format.align(), format.prettyPrint()),
        //     handleExceptions: true
        // }),
        // new transports.MongoDB({
        //     db: process.env.MONGO_URI
        //     , level: "error",
        //     options: { useUnifiedTopology: true },
        //     collection: "error",
        //     format: format.combine(format.timestamp(), format.json(), format.prettyPrint()),
        //     handleExceptions: true,
        // })

    ]
})

exports.logger = logger