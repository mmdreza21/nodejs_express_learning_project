const express = require('express')
const router = express.Router()

const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const objectId = require('../middlewares/objectid')

const studentController = require('../controllers/studentCo');
const teacherController = require('../controllers/teacherCo');
const adminCo = require('../controllers/adminCo');
const GetTeCo = require('../controllers/getTeacher');
const { profile, degree, videoFile, degreeBadget } = require('../middlewares/upload');
const isteacher = require('../middlewares/isteacher');


router.post('/admin', studentController.AdminSignIn)

//! like rate stuff
router.post('/teacher/rate/:id', [auth, objectId], teacherController.rate)
router.post('/teacher/like/:id', [auth, objectId], teacherController.like)

// form route //!student             
router.post('/student', studentController.signIn)
router.patch('/student/profile', auth, studentController.PatchProfile)
router.patch('/student/profileImage', auth, profile.single('image'), studentController.PatchProfileImage)
router.patch('/student/switch/teacher', [auth], teacherController.ChangeToTeacher)

// get route //
//! GET UsERs student                     
router.get('/student', auth, studentController.getProfile)
router.get('/student/:id', studentController.studentDetails)
router.get('/students/search', GetTeCo.studentSearch)


//form route //!teacher
router.post('/teacher', teacherController.singInTeacher)
router.patch('/teacher', [auth, isteacher], teacherController.patcheacherProfile)
router.patch('/teacher/image', [auth, isteacher], degree.array("image", 8), teacherController.patchDgreePhoto)
router.patch('/teacher/profile', [auth, isteacher], profile.single("image"), teacherController.teacherProfile)

//! GET                             
router.get('/teacher/user/:id', [objectId], GetTeCo.teacherDetails)//! also for admin
router.get('/teacher/user', [auth, isteacher], GetTeCo.teacherprofile)
router.get('/teachers', GetTeCo.allTeachers)
router.get('/teachers/search', GetTeCo.getByquerys)

//! GET ADMIN PART
router.get('/admin/teachers', [auth, admin], adminCo.getUnChecked)
//*Action
router.patch('/admin/check/:id', [auth, admin, objectId], adminCo.chekTeacher)
router.patch('/admin/uncheck/:id', [auth, admin, objectId], adminCo.unchekTeacher)
router.patch('/admin/badget/:id', [auth, admin, objectId], degreeBadget.single("image"), adminCo.uploadBaget)
router.get('/admin/creditTeacher', [auth, admin], adminCo.getCreditTeacher)
router.delete('/admin/delete/:id', [auth, admin, objectId], adminCo.deleteUser)

//intro video
router.patch('/teacher/video', [auth, isteacher], videoFile.single("video"), teacherController.patchVideo)


module.exports = router