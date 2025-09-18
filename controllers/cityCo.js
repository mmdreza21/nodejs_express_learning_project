const _ = require('lodash')

const { City, validate } = require('../models/city')
const { Contry } = require('../models/contry')

class CityController {

    async post(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const countryId = req.body.countryId
        const cityTitle = req.body.title

        let city = await City.findOne({ title: cityTitle, countryId })
        if (city) return res.status(400).send("this city in this country is already exists!")


        const country = await Contry.findById(countryId)

        city = await new City({
            title: cityTitle,
            countryId
        })

        const responseObj = {
            _id: city._id,
            title: cityTitle,
            countryId: {
                _id: countryId,
                title: country.title
            }
        }
        await city.save()
        res.send(responseObj)

    }

    async getAlle(req, res) {
        const city = await City.find().collation({ locale: "en" }).sort({ title: 1 }).populate("countryId")
        res.send(city)
    }

    async getForContry(req, res) {
        const id = req.params.id
        const city = await City.find({ countryId: id }).populate("countryId")
        if (!city) return res.status(404).send("notfound")
        res.send(city)
    }

    async update(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        const id = req.params.id
        const countryId = req.body.countryId
        const cityTitle = req.body.title

        const country = await Contry.findById(countryId)

        let city = await City.findByIdAndUpdate(id, { title: cityTitle }, { new: true })

        const responseObj = {
            _id: city._id,
            title: cityTitle,
            countryId: {
                _id: countryId,
                title: country.title
            }
        }
        res.send(responseObj)

    }
    async delet(req, res) {
        const id = req.params.id

        const city = await City.findByIdAndRemove(id)
        if (!city) return res.status(404).send('city not found');

        res.send(city);
    }


}

module.exports = new CityController()