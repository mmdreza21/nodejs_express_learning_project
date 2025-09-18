const { TakenExam } = require("../models/TakenExam");

const Controller = require('./controller');

class TakenExamController extends Controller {

    async getForStudent(req, res) {
        const takenExam = await TakenExam.find({ userId: req.user._id })
        let sum = 0

        takenExam.forEach(e => {
            sum += e.score
        });

        const adjusted = sum / takenExam.length
        res.send({ takenExam, adjusted });
    }


    async getForTecher(req, res) {
        const takenExam = await TakenExam.find({ userId: req.params.id })
        res.send(takenExam);
    }
}


module.exports = new TakenExamController()

