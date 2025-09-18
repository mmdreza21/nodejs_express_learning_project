require('express-async-errors')
const express = require('express')
const cors = require("cors");
const helmet = require('helmet');
const errors = require('../middlewares/errors');
const path = require('path');


const user = require('../routers/user');
const auth = require('../routers/auth');
const country = require('../routers/country');
const city = require('../routers/city');
const lang = require('../routers/lang');
const clas = require('../routers/classRouter');
const note = require('../routers/note');
const comment = require('../routers/comment');
const club = require('../routers/club');
const exam = require('../routers/exam');
const quiz = require('../routers/quiz');
const takenExam = require('../routers/takenExam');
const fiscal = require('../routers/fiscal');
const ticket = require('../routers/ticket');
const classDate = require('../routers/classDate');
const dynamicStuff = require('../routers/dynamicStuff');

module.exports = (app) => {
    //* 
    app.use(cors())
    app.use(express.json())
    // app.use(helmet());

    //*statics
    app.use('/static', express.static(path.join("public")))
    //*
    app.use('/api/uploads/profile', express.static(path.join("uploads", "profile")))
    app.use('/api/uploads/pdf', express.static(path.join("uploads", "pdf")))
    app.use('/api/uploads/article', express.static(path.join("uploads", "article")))
    app.use('/api/uploads/video', express.static(path.join("uploads", "video")))
    app.use('/api/uploads/degree', express.static(path.join("uploads", "degree")))
    app.use('/api/uploads/flag', express.static(path.join("uploads", "flag")))
    app.use('/api/uploads/quiz', express.static(path.join("uploads", "quiz")))
    app.use('/api/uploads/degreebadget', express.static(path.join("uploads", "degreebadget")))
    app.use('/api/uploads/public', express.static(path.join("uploads", "public")))

    //*routers
    app.use('/api/user', user)//
    app.use('/api/auth', auth)//
    app.use('/api/country', country)//
    app.use('/api/city', city)//
    app.use('/api/lang', lang)//
    app.use('/api/class', clas)//
    app.use('/api/note', note)////
    app.use('/api/comments', comment)//
    app.use('/api/club', club)//
    app.use('/api/exam', exam)//
    app.use('/api/quiz', quiz)//
    app.use('/api/takenExam', takenExam)//
    app.use('/api/fiscal', fiscal)//
    app.use('/api/ticket', ticket)//
    app.use('/api/classDate', classDate)//
    app.use('/api/dynamicStuff', dynamicStuff)//

    //*err
    app.use(errors)

}