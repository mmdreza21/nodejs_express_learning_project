const { Contry, validata } = require('../models/contry')
const _ = require('lodash')
const { deleteImage } = require('../startUp/fileHelp');

class ContryController {

    async post(req, res) {
        const { error } = validata(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const img = req.file

        if (!img) return res.status(400).send('عکس پرچم الزامی است!');


        let country = await Contry.findOne({ title: req.body.title, })
        if (country) return res.status(400).send("this country Allready exist.")

        country = await new Contry({ ..._.pick(req.body, ["title"]), flag: img.path })

        await country.save()
        res.status(201).send(country)
    }
    async edite(req, res) {
        const { error } = validata(req.body)
        if (error) return res.status(400).send(error.details[0].message)


        let country = await Contry.findById(req.params.id)
        if (!country) return res.status(404).send("notfound.")

        const img = req.file
        let flag;
        if (!img) {
            flag = country.flag
        } else {
            await deleteImage(country.flag)
            flag = img.path
        }

        country.flag = flag
        country.title = req.body.title
        await country.save()
        res.send(country)
    }

    async getall(req, res) {
        let country = await Contry.find().collation({ locale: "en" }).sort({ title: 1 })
        res.send(country)
    }

    async delete(req, res) {
        const id = req.params.id

        const countey = await Contry.findByIdAndRemove(id)
        if (!countey) return res.status(404).send('countey not found');

        res.send(countey);
    }

}

module.exports = new ContryController()