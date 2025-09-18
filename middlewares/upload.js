const multer = require('multer')
const path = require('path')

const pdfPath = path.join("uploads", "pdf")
const profileImage = path.join("uploads", "profile")
const articleImage = path.join('uploads', "article")
const degreeImage = path.join('uploads', "degree")
const videoPath = path.join('uploads', "video")
const flagPath = path.join('uploads', "flag")
const quizPath = path.join('uploads', "quiz")
const degreeBadgetPath = path.join('uploads', "degreebadget")
const publicPath = path.join('uploads', "public")


const publicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, publicPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const degreeBadgetStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, degreeBadgetPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const quizPdfsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, quizPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const flagImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, flagPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const articleFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, articleImage)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const degreeFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, degreeImage)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const profileStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, profileImage)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }


})
const pdf = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, pdfPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})
const video = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, videoPath)
    },
    filename: (req, file, cb) => {
        const newLocal = `${new Date().toISOString().replace(/:/g, `-`)}-${file.originalname}`
        cb(null, newLocal)
    }

})

const filters = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true)
    } else {
        cb(null, false)

    }
}

const videoFilters = (req, file, cb) => {
    if (
        file.mimetype === "video/mp4"

    ) {
        cb(null, true)
    } else {
        cb(null, false)

    }
}

const pdffilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true)
    } else {
        cb(null, false)

    }
}

exports.pdfFile = multer({ storage: pdf, fileFilter: pdffilter })
exports.videoFile = multer({ storage: video, fileFilter: videoFilters })
exports.profile = multer({ storage: profileStorage, fileFilter: filters })
exports.degree = multer({ storage: degreeFileStorage, fileFilter: filters })
exports.Article = multer({ storage: articleFileStorage, filters: filters })
exports.flag = multer({ storage: flagImageStorage, filters: filters })
exports.quiz = multer({ storage: quizPdfsStorage, filters: pdffilter })
exports.degreeBadget = multer({ storage: degreeBadgetStorage, filters: filters })
exports.public = multer({ storage: publicStorage, filters: filters })

// exports.bookimage = bookimage
// exports.pdfFile = pdfFile

