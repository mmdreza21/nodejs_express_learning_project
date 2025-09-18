const { Clas, validate, offValidator, updateValidator } = require("../models/classModel");
const { Fiscal } = require("../models/financial");
const { ClassDate, validate: datesValidate, } = require('../models/classDate')

const _ = require('lodash');
const { User } = require("../models/user");


class ClassController {

    async createClass(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const teacherId = req.user._id
        const teacher = await User.findById(teacherId)
        // if (!teacher) return res.status(401).send('')
        let discountedPrice = req.body.price
        const dateArr = req.body.dayOfWeek


        const classRoom = await new Clas({
            ..._.pick(req.body, [
                "title",
                "classLink",
                "startDate",
                "lang",
                "price",
                "isSolo",
                "endDate",
                "classLimit",
                "time",
                "off",
                "lessons"
            ]),
            discountedPrice,
            creatorTeacher: teacherId,
        })

        for (let dateObj of dateArr) {
            dateObj.classRoomId = classRoom._id.toString()
            const { error } = datesValidate(dateObj)
            if (error) return res.status(400).send(error.details[0].message)
            let dateArr = []
            let date = await ClassDate.findOne({ date: dateObj.date, teacherId })
            if (date) {
                continue

            } else {

                const expireAt = dateObj.date

                let date = await new ClassDate({
                    ..._.pick(dateObj, ['classRoomId', 'limit', 'date']),
                    teacherId,
                    expireAt
                })
                await date.save()
                dateArr.push(date)

            }

        }

        // await teacher.classes.push(classRoom._id)

        // await teacher.save()
        await classRoom.save()

        res.send({ classRoom, dateArr })
    }


    async patchDiscoumt(req, res) {
        const { error } = offValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const classRoom = await Clas.findById(req.params.id)
        if (!classRoom) return res.status(400).send('class ENOTFound');

        const isInOff = req.body.isInOff
        const off = req.body.off
        const price = classRoom.price

        let discountedPrice
        if (isInOff) {
            discountedPrice = price * off / 100
        } else {
            discountedPrice = price
        }
        classRoom.isInOff = isInOff
        classRoom.off = off
        classRoom.discountedPrice = discountedPrice

        await classRoom.save()
        res.send(classRoom)
    }

    async updateClasses(req, res) {
        const { error } = updateValidator(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const id = req.params.id
        const classRoom = await Clas.findByIdAndUpdate(id, {
            ..._.pick(req.body, [
                "title",
                "classLink",
                "startDate",
                "endDate",
                "lang",
                "price",
                "classLimit",
                "isSolo",
                "time",
                "lessons"
            ])
        }, {
            new: true
        })
        if (!classRoom) return res.status(400).send('class ENOTFound');

        res.send(classRoom);

    }

    async removeClass(req, res) {
        const clas = await Clas.findByIdAndRemove(req.params.id)
        if (!clas) return res.status(400).send('class ENOTFound');
        res.send(clas)
    }


    async getTecherClass(req, res) {
        const teacherId = req.params.id
        const clas = await Clas.find({ creatorTeacher: teacherId }).populate('students.student lang creatorTeacher')
        res.send(clas)
    }

    async getStudentClass(req, res) {
        const teacherId = req.user._id
        const clas = await Clas.find({ 'students.student': teacherId }).populate('students.student lang creatorTeacher')
        res.send(clas)
    }


    async getAllClass(req, res) {
        const clas = await Clas.find()
        res.send(clas)
    }

    async getOneClass(req, res) {
        const classId = req.params.id
        const clas = await Clas.findById(classId).populate('students.student lang creatorTeacher')
        const classObj = { ...clas._doc }

        const dates = await ClassDate.find({ classRoomId: classObj._id })
        classObj.dayOfWeek = dates

        res.send(classObj)
    }


    async userPatchClassDone(req, res) {
        const { classDateId, classId } = req.query

        const classRoom = await Clas.findById(classId)
        if (!classRoom) return res.status(404).send('CLASSROOM ENot Found')

        const classDate = await ClassDate.findById(classDateId)
        if (!classDate) return res.status(404).send('Date ENot Found')

        // -modifying classDate
        console.log(classDate);
        const userToken = req.user
        const checkerObj = { userId: userToken._id, check: true }
        !userToken.isTeacher ? classDate.studentCheck = checkerObj : classDate.teacherCheck = checkerObj
        await classDate.save()

        // -checking 
        const status = classDate.checkTimeDone()
        if (!status) return res.status(204).send('')

        //  - fiscals
        const fiscals = await Fiscal.find({ classId })

        //  - made the fiscals close //TODO
        //  - graP fiscals money and send them to teacher balance
        let totalPrice = 0
        let theDate
        for (const fiscal of fiscals) {
            const allDateINFiscal = fiscal.ClassDateArr
            theDate = allDateINFiscal.find((e) => {
                return e.dateObj._id.toString() === classDateId.toString()
            })
            if(!theDate) return res.status(404).send('the date ENotFound')
            totalPrice += theDate.classPrice

        }
        // console.log(totalPrice)
        // TODO this is %5for site profit 
        const amount = totalPrice - ((totalPrice * 5) / 100)
        const teacherId = classRoom.creatorTeacher


        const teacher = await User.findById(teacherId)
        if (!teacher) return res.status(400).send('you have NoTHING')
        teacher.balance += amount

        //  - make a new fiscal
        const newFiscal = await new Fiscal({
            payment: amount,
            pay: {
                withdrawal: false,
                for: 'Teacher'
            },
            description: `
                    <div>
                    <h4>
                        مبلغ کل کلاس:
                        <span>
                            (${totalPrice})
                        </span>
                    </h4>
                    <h5>
                        مبلغ واریزی برای شما :
                        <span>
                            ( ${amount})
                        </span>
                    </h5>
                    <h5>
                        از فیش به حساب معلم با ای دی :
                        <span>
                            (${teacherId})
                        </span>
                    </h5>
                </div>
        
                    `,
            forTeacher: true,
            userId: teacherId,
            verify: true,
            classId,
            byWallet: false,
            ClassDateArr: [theDate]
        })//todo save and send to alis balance teacher


        //   - add the class time to student timeInClass

        const students = classDate.students
        const classRoomTime = classRoom.time
        for (const studentId of students) {
            const student = await User.findById(studentId.student)
            student.timeInClasses += classRoomTime
            console.log(student);
            await student.save()
        }
        //TODO
        classDate.isDone = true
        await classDate.save()
        await newFiscal.save()
        await teacher.save()

        res.send("done")

    }


    // //! TODO  dont touch this any more// make here  some more work this is not done
    // async patchClassDone(req, res) {
    //     const teacherId = req.user._id

    //     const classRooms = await Clas.find({ creatorTeacher: teacherId, })
    //     if (!classRooms) return res.status(404).send('Class room ENoT Found')


    //     let yesterday = Date.now() - 1000 * 60 * 60 * 24
    //     let fiscalArr = new Set()
    //     let classDateIdArr = []
    //     const dates = await classDate.ClassDate.find({ teacherId, date: { $lt: yesterday } })
    //     if (!dates) return res.status(204).end()

    //     for (let dateIdArrElement of dates) {

    //         const fiscal = await Fiscal
    //             .findOne({
    //                 verify: false,
    //                 "ClassDateArr.dateObj._id": dateIdArrElement._id
    //             })
    //         // console.log(fiscal)
    //         if (fiscal === null) continue
    //         fiscalArr.add(fiscal)
    //     }
    //     // console.log(fiscalArr)

    //     if (fiscalArr.size === 0) return res.status(404).send('no fiscal no payment Fiscal ENotfound')

    //     for (const fiscalArrElement of fiscalArr) {
    //         // console.log(fiscalArrElement)
    //         const arrNew = classDateIdArr.concat(fiscalArrElement.ClassDateArr)
    //         classDateIdArr = [...arrNew]

    //     }
    //     let expiredDats = classDateIdArr.filter(elem => {
    //         // console.log(elem.dateObj._id)
    //         // console.log(elem)
    //         return elem.dateObj.date <= yesterday
    //     })
    //     if (expiredDats.length === 0) return res.status(404).send('no fiscal expired no payment Fiscal ENotfound')

    //     let totalPrice = 0
    //     for (const classDateIdArrElement of expiredDats) {
    //         if (classDateIdArrElement.payed === false) {
    //             totalPrice += classDateIdArrElement.classPrice
    //         }
    //     }
    //     if (totalPrice === 0) return res.status(200).send('no money no payment Fiscal ENotfound do your job ignore this')
    //     // mines the site present money from class money by 5%//TODO darsad
    //     const amount = totalPrice - ((totalPrice * 5) / 100)
    //     const newFiscal = await new Fiscal({
    //         payment: amount,
    //         withdrawal: true,
    //         description: `
    //         <div>
    //         <h4>
    //             مبلغ کل کلاس:
    //             <span>
    //                 (${totalPrice})
    //             </span>
    //         </h4>
    //         <h5>
    //             مبلغ واریزی برای شما :
    //             <span>
    //                 ( ${amount})
    //             </span>
    //         </h5>
    //         <h5>
    //             از فیش به حساب معلم با ای دی :
    //             <span>
    //                 (${teacherId})
    //             </span>
    //         </h5>
    //     </div>

    //         `,
    //         forTeacher: true,
    //         userId: teacherId,
    //         verify: true,
    //         classId: classRooms[0]._id,
    //         byWallet: false,
    //         ClassDateArr: classDateIdArr
    //     })//todo save and send to alis balance teacher

    //     const teacher = await User.findById(teacherId)
    //     if (!teacher) return res.status(400).send('you have NoTHING')

    //     teacher.balance += amount

    //     for (let fiscalArrElement of fiscalArr) {
    //         const fiscal = await Fiscal.findById(fiscalArrElement._id)
    //         console.log(fiscal)
    //         await fiscal.turnPayed()
    //     }

    //     for (const el of dates) {
    //         const students = el.students
    //         const classRoom = await Clas.findById(el.classRoomId)
    //         const classRoomTime = classRoom.time
    //         for (const studentId of students) {

    //             const student = await User.findById(studentId)
    //             student.timeInClasses += classRoomTime
    //             console.log(student);
    //             // await student.save()
    //         }

    //     }

    //     await newFiscal.save()
    //     await teacher.save()
    //     res.send("done")
    // }
}

module.exports = new ClassController()


// const studentBalance = student.balance
// student.balance = (+studentBalance) - (+classPrice)

// const teacher = await User.findById(teacherId)
// if (!teacher) return res.status(401).send("عدم وجود معلم در لایه های کلاس!");
// teacher.balance = teacher.balance + money


// await teacher.save()
// await student.save()