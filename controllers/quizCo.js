const {
  Quiz,
  validate,
  validatorAnswer,
  validatorScore,
} = require("../models/quiz");
const mongoose = require("mongoose");
const Controller = require("./controller");
const _ = require("lodash");

class QuizCo extends Controller {
  async addQuiz(req, res) {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const quiz = await new Quiz({
      ..._.pick(req.body, ["title", "lang", "question", "classId"]),
      teacher: req.user._id,
      isUploady: false,
    });
    await quiz.save();

    res.send(quiz);
  }

  async getForStudent(req, res) {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(400).send("quiz ENotFound");

    res.send(quiz);
  }

  async answer(req, res) {
    const { error } = validatorAnswer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const answer = {};
    answer.text = req.body.text;
    answer.userId = req.user._id;

    const quiz = await Quiz.findById(req.params.id);
    quiz.answers.push(answer);
    await quiz.save();
    res.send("جواب با موفقیت  ارسال شد !");
  }

  async score(req, res) {
    const { sId, qId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(qId)) {
      return res.status(404).send("invalid quiz ID");
    }
    if (!mongoose.Types.ObjectId.isValid(sId)) {
      return res.status(404).send("invalid Student ID");
    }
    const { error } = validatorScore(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const quiz = await Quiz.findById(qId);
    if (!quiz) return res.status(404).send("quiz ENoTFouND");

    const quizIndex = quiz.answers.findIndex((el) => {
      return el.userId.toString() === sId.toString();
    });
    if (quizIndex < 0) return res.status(404).send("student ENoTFouND (student did not take the quiz)");

    quiz.answers[quizIndex].score = req.body.score;
    await quiz.save();
    res.send(quiz);
  }

  async uploadquiz(req, res) {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const pdf = req.file;
    if (!pdf) return res.status(400).send("لطفا عکس سوالات را اپلود کنیددا!");

    const quiz = await new Quiz({
      ..._.pick(req.body, ["title", "lang", "classId"]),
      teacher: req.user._id,
      questionPdf: pdf.path,
      isUploady: true,
    });

    await quiz.save();
    res.send(quiz);
  }

  async uploadAnswer(req, res) {
    const pdf = req.file;
    if (!pdf) return res.status(400).send("لطفا عکس سوالات را اپلود کنیددا!");

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(400).send("quiz  ENotFound");

    const answer = {};
    answer.userId = req.user._id;
    answer.answesPdf = pdf.path;

    quiz.answers.push(answer);

    await quiz.save();
    res.send("جواب با موفقیت  ارسال شد !");
  }

  async getAnswers(req, res) {
    const quiz = await Quiz.findById(req.params.id).populate("answers.userId");
    if (!quiz) return res.status(400).send("quiz ENotFound");

    res.send(quiz);
  }

  async getByQuery(req, res) {
    const page = +req.query.page;
    const limit = +req.query.limit;
    let startIndex = (page - 1) * limit;

    let expressRes = res;

    const lang = req.query.lang;
    const classId = req.query.classId;
    const teacher = req.query.teacher;
    // const search = req.params.search
    const isUploady = req.query.isUploady;
    const query = {};
    isUploady ? (query.isUploady = isUploady) : query;
    if (lang) {
      const outPut = super.queryValidator(expressRes, lang, "lang");
      if (outPut) return;
      query.lang = lang;
    }
    if (classId) {
      const outPut = super.queryValidator(expressRes, classId, "classId");
      if (outPut) return;
      query.classId = classId;
    }

    if (teacher) {
      const outPut = super.queryValidator(expressRes, teacher, "teacher");
      if (outPut) return;
      query.teacher = teacher;
    }

    // const regex = new RegExp(".*" + search + "*.", "i");
    // search ? query.title = regex : query

    const result = {};
    result.end = Math.ceil((await Quiz.countDocuments(query).exec()) / limit);

    const quiz = await Quiz.find(query)
      .sort("-createdAt")
      .populate("lang classId teacher")
      .limit(limit)
      .skip(startIndex);
    result.data = quiz;

    res.send(result);
  }

  async removeQuiz(req, res) {
    const exam = await Quiz.findByIdAndRemove(req.params.id);
    if (!exam) return res.status(404).send("quiz notfound");
    res.send(exam);
  }
}

module.exports = new QuizCo();
