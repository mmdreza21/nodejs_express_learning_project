const socketIo = require('socket.io');
const { Club } = require('../models/club');


let io;
module.exports = {

    init: server => {

        io = socketIo(server, {
            cors: {
                origin: "*",
            }
        })
        io.of('clubMsgs').on('connection', async (socket) => {
            console.log("your socket is ready mmd");
        })
        return io
    },
    // io.of('rezayi').on('connection', socket => {
    //     console.log('success whit rezayi');
    // })
    getIo: () => {
        if (!io) {
            throw new Error('socket io is not initialized')
        }
        return io;
    }


}