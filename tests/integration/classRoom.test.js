const {ClassDate} = require("../../models/classDate");
const {Clas} = require("../../models/classModel");
const mongoose = require("mongoose");
const axios = require("axios");
const superTest = require('supertest')

const api = `http://localhost:8008/api`

let server;

const classRoomData = {
    title: "how to say hello",
    classLink: "http://adkjjfhsaj.com",
    lang: "60ab6d8ab3e2e710203af115",
    price: 20000,
    startDate: "2021-05-25T11:22:03.087Z",
    endDate: "2022-10",
    isSolo: false,
    classLimit: 1,
    time: 25,
    lessons: 4,
    off: 10,
    dayOfWeek: [
        {
            date: "2021-08-30T11:23:03.087Z",
            limit: 4
        },
        {
            date: "2021-08-29T19:12:03.087Z",
            limit: 4
        },
        {
            date: "2021-09-01T11:18:03.087Z",
            limit: 4
        },
        {
            date: "2021-08-28T09:05:03.087Z",
            limit: 4
        },
        {
            date: "2021-08-29T02:02:03.087Z",
            limit: 4
        }
    ]
}
const teacherToken = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGFjYWFmN2Y4ZDljZTI5MzRiMDc3NmEiLCJlbWFpbCI6Im1AbTEuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlzVGVhY2hlciI6dHJ1ZSwiaWF0IjoxNjMwMTQ2MTgyfQ.jxDVc4X98wbCsMoHTeDit_aTar9hy9c6BY29pqJrVOw'
const studentToken = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTI0ZTJkMjgwZDUzODQyMzBmYzg3NTEiLCJlbWFpbCI6Im0xQG0yMS5jb20iLCJpc0FkbWluIjpmYWxzZSwiaXNUZWFjaGVyIjpmYWxzZSwiaWF0IjoxNjMwMjI0NDc5fQ.LrALE2g3xhIwEFhN-Ccro0UCArkw3J_B44QX28ZRWfk'


describe("/api/class", () => {
    beforeEach(() => {
        server = require("../../app");
    });
    afterEach(async () => {
        // await Clas.deleteMany();
        server.close();
    });

    describe('POST ', () => {
        it('should create a class', async function () {
            console.log(server)
            const res = await superTest(server).post('/api/class').send({...classRoomData}).set('Authorization', `${teacherToken}`)
            expect(res).toBe(classRoomData)
            // console.log(res)

        });
    })

})