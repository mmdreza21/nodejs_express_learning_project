const mongoose = require('mongoose');

module.exports = class Controller {
    constructor() {

    }

    queryValidator(res, q, qn) {
        if (!mongoose.Types.ObjectId.isValid(q)) {
            return res.status(404).send(`invalid ID In ${qn}`)
        }
    }
}
