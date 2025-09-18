const { Clas } = require("../models/classModel");
const { ClassDate } = require("../models/classDate");
const { Fiscal, validatePayment } = require("../models/financial");

const _ = require('lodash');
const { User } = require("../models/user");

const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', true);

class ClasController {
    async studentDepositPayment(req, res) {
        const amount = req.body.amount
        const userId = req.user._id.toString()
        const calBack = req.query.calBack
        // const user = await User.findById(userId)
        const fiscal = await new Fiscal({
            userId,
            payment: amount,
            pay: {
                withdrawal: false,
                for: 'Student'
            },
            description: "افزایش اعتبار دانشجو",
            forTeacher: false
        })
        const fiscalId = fiscal._id
        const response = await zarinpal.PaymentRequest({
            Amount: amount, // In Tomans
            CallbackURL: `https://api.learninginbed.com/api/fiscal/student/verify?fiscalId=${fiscalId}&calBack=${calBack}&userId=${userId}`,
            Description: `شارژ کردن اعتبار  `
        })
        if (response.status !== 100) return res.send("unexpected Error")
        if (response.status === 100) {
            await fiscal.save()
            return res.send(response.url)
        }
    }

    async studentVPayment(req, res) {
        // const fiscalId = req.query.fiscalId
        // const Authority = req.query.Authority
        // const calBack = req.query.calBack
        const { userId, fiscalId, Authority, calBack } = req.query

        if (req.query.Status && req.query.Status !== "OK") {
            await Fiscal.findByIdAndDelete(fiscalId)
            return res.redirect(301, `${calBack}?status=NotOk`)
        }
        // console.log(fiscalId)
        const fiscal = await Fiscal.findById(fiscalId)
        console.log(fiscal);
        if (!fiscal) return res.status(404).send('fiscal ENOTFond')
        const fiscalAmount = fiscal.payment

        //! PaymentVerification from zarin pal
        const response = await zarinpal.PaymentVerification({
            Amount: fiscalAmount, // In Tomans
            Authority: Authority,
        })

        if (response.status !== 100) {
            await Fiscal.findByIdAndDelete(fiscalId)
            res.redirect(301, `${calBack}?status=notOk`)
        }
        // console.log(userId)
        const user = await User.findById(userId)
        const userNewBalance = user.balance + fiscalAmount
        user.balance = userNewBalance
        await user.save()
        res.redirect(301, `${calBack}?status=Ok`)
    }

    // --------buy class
    async payment(req, res) {
        const { error } = validatePayment(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        //!inputs
        const clasId = req.params.id
        const studentId = req.user._id
        //body
        const datesArray = req.body.id //? data of week {id}//todo
        const link = req.body.link
        const fromBalance = req.body.fromBalance
        const calBack = req.query.calBack
        // if (typeof fromBalance !== Boolean) return res.status(400).send('i want you just one thing and it shoud be a BOOlean wtf men');

        //!! if else
        const classRoom = await Clas.findById(clasId).populate('creatorTeacher')
        if (!classRoom) return res.status(404).send("class NotFound");


        const dates = await ClassDate.find({ classRoomId: clasId, isFull: false })
        if (!dates) return res.status(404).send('dates ENot found there is no valid date for this class')

        let classPriceFirst = 0
        const dateArr = []
        for (const Id of datesArray) {
            // console.log(Id)
            const date = await ClassDate.findById(Id)

            classPriceFirst += classRoom.price

            let dateObj = { dateObj: date._doc, classPrice: classRoom.price }

            dateArr.push(dateObj)
        }
        // console.log(dateArr)

        const classPrice = classPriceFirst

        const student = await User.findById(studentId)
        if (!student) return res.status(401).send("عدم وجود توکن در لایه هدر!");
        //!if pay from balance
        if (fromBalance) {
            if (student.balance < classPrice) return res
                .status(402)
                .send('مجودی حساب شما کافی نمی باشد لطفا حساب خود را شارژ کنید !');
            //!making new fiscals
            const fiscal = await new Fiscal({
                payment: classPrice,
                pay: {
                    withdrawal: true,
                    for: 'Student'
                },
                description: `
                <div>
        <h4>
            خرید کلاس توسط دانش آموز
            <span>
                : ${student.email}
            </span>
        </h4>
        <h5>
            برای کلاس :
            <span>
                ${classRoom.title}
            </span>
        </h5>
        <h5>
            معلم کلاس :
            <span>
                ${classRoom.creatorTeacher.email}
            </span>
        </h5>
    </div>
                 `,
                forTeacher: false,
                userId: studentId,
                classId: clasId,
                byWallet: true,
                ClassDateArr: dateArr,
            })


            // payment staf withrawall from student and
            // //deposit to teachr

            const newBalance = student.balance - classPrice
            student.balance = newBalance

            // -Add class to student calass
            student.classes.push(clasId)

            const teacher = await User.findById(classRoom.creatorTeacher._id)
            if (!teacher) return res.status(404).send('teacher ENotFound')
            const studentObj = {}
            studentObj.student = studentId
            teacher.students.push(studentObj)


            // await classRoom.fullingClass(student, link, datesArray)
            let stu = { student: studentId, connectionLink: link }
            classRoom.students.push(stu)
            for (const Id of datesArray) {
                const date = await ClassDate.findById(Id)

                date.students.push(stu)
                if (date.students.length >= date.limit) {
                    date.isFull = true
                }
                await date.save()
            }
            await classRoom.save()
            teacher.save()
            await student.save()
            await fiscal.save()
            res.redirect(301, `${calBack}?status=Ok`)

        } else {
            //!! zarinpall staffs
            try {
                const response = await zarinpal.PaymentRequest({
                    Amount: classPrice, // In Tomans
                    CallbackURL: `https://api.learninginbed.com/api/class/payment/verify?id=${datesArray}&link=${link}&clasId=${clasId}&calBack=${calBack}&studentId=${studentId}`,
                    Description: `:خرید کلاس${classRoom.title} `
                })
                if (response.status === 100) return res.send(response.url)
                if (response.status !== 100) return res.status(404).send("خطای غیر منتظره!!!");
            } catch (e) {
                console.log(e);
            }
        }

        // await classRoom.fulingcllass(student, link, datesArray)

    }

    async joinInClass(req, res) {

        if (req.query.Status && req.query.Status !== "OK") return res.status(402).send("؛تراکنش نا موفق");
        const clasId = req.query.clasId
        const studentId = req.query.studentId
        const calBack = req.query.calBack

        //!from query
        const datesArray = req.query.id
        const link = req.query.link
        const Authority = req.query.Authority

        const datesArrayArr = datesArray.split(",")

        const classRoom = await Clas.findById(clasId)
        if (!classRoom) return res.status(404).send("class NotFound");
        let classPriceFirst = 0
        const dateArr = []
        const dates = await ClassDate.find({ classRoomId: clasId, isFull: false })
        if (!dates) return res.status(404).send('dates ENot found there is no valid date for this class')
        // console.log(dates)

        for (let datesArray of datesArrayArr) {
            const date = await ClassDate.findById(datesArray)

            let dateObj = { dateObj: date._doc, classPrice: classRoom.price }

            dateArr.push(dateObj)
            classPriceFirst += classRoom.price
        }
        const classPrice = classPriceFirst

        const student = await User.findById(studentId)
        if (!student) return res.status(401).send("عدم وجود توکن در لایه هدر!");
        student.classes.push(clasId)
        await student.save()


        //! PaymentVerification from zarin pal
        const response = await zarinpal.PaymentVerification({
            Amount: classPrice, // In Tomans
            Authority: Authority,
        })
        if (response.status !== 100) return res.redirect(301, `${calBack}?status=notOk`);

        const teacher = await User.findById(classRoom.creatorTeacher)
        if (!teacher) return res.status(404).send('teacher ENotFound')
        const studentObj = {}
        studentObj.student = studentId
        teacher.students.push(studentObj)


        //!making new fiscals
        const fiscal = await new Fiscal({
            payment: classPrice,
            pay: {
                withdrawal: true,
                for: 'Admin'
            },
            description: ` 
            <div>
        <h4>
            خرید کلاس توسط دانش آموز
            <span>
                : ${student.email}
            </span>
        </h4>
        <h5>
            برای کلاس :
            <span>
                ${classRoom.title}
            </span>
        </h5>
        <h5>
            معلم کلاس :
            <span>
                ${teacher.email}
            </span>
        </h5>

    </div>
            
            `,
            forTeacher: false,
            userId: studentId,
            classId: clasId,
            byWallet: false,
            ClassDateArr: dateArr
        })

        await teacher.save()
        await fiscal.save()
        // await classRoom.fullingClass(student, link, datesArrayArr)
        let stu = { student: studentId, connectionLink: link }
        classRoom.students.push(stu)
        for (const Id of datesArrayArr) {
            const date = await ClassDate.findById(Id)

            date.students.push(stu)
            if (date.students.length >= date.limit) {
                date.isFull = true
            }
            await date.save()
        }
        await classRoom.save()

        res.redirect(301, `${calBack}?status=Ok`)
    }
}

module.exports = new ClasController()
